"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const workflow = fs.readFileSync(
  path.join(__dirname, "../workflows/humanizer-russian-review.yml"), "utf8"
);
const dispatcher = fs.readFileSync(
  path.join(__dirname, "../workflows/humanizer-base-refresh.yml"), "utf8"
);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

function extract(file, name) {
  const lines = file.split("\n");
  const start = lines.findIndex(line => line.includes("- name: " + name));
  const script = lines.findIndex((line, i) => i > start && line === "          script: |");
  assert.ok(start >= 0 && script > start, "Missing workflow script: " + name);
  const end = lines.findIndex((line, i) => i > script && line.startsWith("      - name: "));
  return lines.slice(script + 1, end < 0 ? undefined : end)
    .map(line => line.startsWith("            ") ? line.slice(12) : line)
    .join("\n");
}

assert.ok(workflow.includes("workflow_dispatch:"));
assert.ok(workflow.includes("cancel-in-progress: true"));
assert.ok(workflow.includes("steps.pr.outputs.base_sha"));
assert.ok(workflow.includes("steps.pr.outputs.head_sha"));
assert.ok(workflow.includes("steps.finalize.outcome == 'success'"));
assert.ok(workflow.includes("--inline-output"));
assert.ok(dispatcher.includes("branches: [main]"));
assert.ok(dispatcher.includes("actions: write"));

const publish = new AsyncFunction("github", "context", "core", "process",
  extract(workflow, "Комментарий и замечания в diff"));
const resolve = new AsyncFunction("github", "context", "core", "process",
  extract(workflow, "Получение текущих refs PR"));
const refresh = new AsyncFunction("github", "context", "core",
  extract(dispatcher, "Повторная проверка открытых PR к main"));

const expected = {
  head: { sha: "a".repeat(40) },
  base: { ref: "main", sha: "b".repeat(40) },
};
const pr = {
  state: "open", head: { ...expected.head, repo: { full_name: "Antiokh/rslive_content" } },
  base: expected.base, user: { login: "author" },
};

(async () => {
  async function resolvePr(prData, eventName = "workflow_dispatch") {
    const outputs = {};
    await resolve(
      { rest: { pulls: { get: async () => ({ data: prData }) } } },
      { eventName, repo: { owner: "Antiokh", repo: "rslive_content" } },
      { setOutput: (k, v) => { outputs[k] = v; }, info: () => {} },
      { env: { REVIEW_PR_NUMBER: "7" } },
    );
    return outputs;
  }

  assert.equal((await resolvePr(pr)).active, "true");
  assert.deepEqual(JSON.parse((await resolvePr(pr)).target), expected);
  for (const excluded of [
    { ...pr, state: "closed" },
    { ...pr, base: { ...pr.base, ref: "release" } },
    { ...pr, head: { ...pr.head, repo: { full_name: "other/fork" } } },
    { ...pr, user: { login: "dependabot[bot]" } },
  ]) assert.equal((await resolvePr(excluded)).active, "false");
  assert.equal((await resolvePr(pr, "pull_request")).active, "true");

  const seenDispatch = [];
  await refresh({
    paginate: async () => [
      { number: 7, ...pr },
      { number: 8, ...pr, base: { ref: "release", sha: pr.base.sha } },
      { number: 9, ...pr, head: { ...pr.head, repo: { full_name: "fork/pr" } } },
    ],
    rest: {
      pulls: { list: async () => {} },
      actions: { createWorkflowDispatch: async args => seenDispatch.push(args) },
    },
  }, { repo: { owner: "Antiokh", repo: "rslive_content" } }, { info: () => {} });
  assert.deepEqual(seenDispatch.map(x => x.inputs.pr_number), ["7"]);
  assert.equal(seenDispatch[0].workflow_id, "humanizer-russian-review.yml");

  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rslive-humanizer-"));
  const commentFile = path.join(temp, "comment.md");
  const inlineFile = path.join(temp, "inline.json");
  const id = "a".repeat(20);
  fs.writeFileSync(commentFile, "<!-- humanizer-russian-review -->\nТестовый отчёт\n");
  fs.writeFileSync(inlineFile, JSON.stringify([{
    path: "src/content/docs/example.mdx", line: 2, id,
    body: "**Замечание**\n\nФрагмент\n\n<!-- humanizer-inline:" + id + " -->",
  }]));

  async function run({ current = pr, comments = [], oldInline = [],
                       patch = "@@ -1 +1,2 @@\n context\n+новая строка",
                       changedAfter = null } = {}) {
    const writes = [];
    let reads = 0;
    const github = {
      rest: {
        pulls: {
          get: async () => ({ data: changedAfter && reads++ >= 1 ? changedAfter : current }),
          listFiles: async () => {},
          listReviewComments: async () => {},
          createReview: async args => writes.push({ kind: "review", args }),
        },
        issues: {
          listComments: async () => {},
          createComment: async args => writes.push({ kind: "comment", args }),
          updateComment: async args => writes.push({ kind: "update", args }),
        },
      },
      paginate: async fn => {
        if (fn === github.rest.issues.listComments) return comments;
        if (fn === github.rest.pulls.listReviewComments) return oldInline;
        if (fn === github.rest.pulls.listFiles) return [{
          filename: "src/content/docs/example.mdx", status: "modified", patch,
        }];
        throw new Error("Unexpected pagination");
      },
    };
    await publish(github,
      { repo: { owner: "Antiokh", repo: "rslive_content" } },
      { info: () => {}, warning: msg => { throw new Error(msg); } },
      { env: {
        COMMENT_PATH: commentFile, INLINE_PATH: inlineFile,
        REVIEW_PR_NUMBER: "7", REVIEW_TARGET: JSON.stringify(expected),
      } });
    return writes;
  }
  try {
    const normal = await run();
    assert.deepEqual(normal.map(x => x.kind), ["comment", "review"]);
    assert.equal(normal[1].args.comments[0].line, 2);
    assert.equal(normal[1].args.comments[0].side, "RIGHT");
    assert.equal((await run({ patch: "@@ -1,2 +1,2 @@\n unchanged\n+line other" }))
      .filter(x => x.kind === "review").length, 1); // same added line
    assert.equal((await run({ patch: "@@ -1,2 +1,2 @@\n+another\n unchanged" }))
      .filter(x => x.kind === "review").length, 0); // line 2 context
    assert.deepEqual((await run({ oldInline: [{
      user: { login: "github-actions[bot]" },
      body: "<!-- humanizer-inline:" + id + " -->",
    }] })).map(x => x.kind), ["comment"]);
    assert.deepEqual((await run({ current: { ...pr, state: "closed" } })).map(x => x.kind), []);
    assert.deepEqual((await run({ changedAfter: {
      ...pr, base: { ...pr.base, sha: "c".repeat(40) },
    } })).map(x => x.kind), []);
    // A contributor cannot spoof ownership by pasting the hidden summary marker.
    assert.deepEqual((await run({ comments: [{
      id: 10, user: { login: "contributor" },
      body: "<!-- humanizer-russian-review -->",
    }] })).map(x => x.kind), ["comment", "review"]);
    assert.deepEqual((await run({ comments: [{
      id: 12, user: { login: "github-actions[bot]" },
      body: "<!-- humanizer-russian-review -->",
    }] })).map(x => x.kind), ["update", "review"]);
    console.log("Humanizer inline publication, ref checks, spoofing and dispatch: OK");
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
