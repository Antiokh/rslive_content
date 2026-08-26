import { execFileSync } from 'node:child_process';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { compile } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';
import YAML from 'yaml';

const root = process.cwd();
const docsRoot = path.join(root, 'src', 'content', 'docs');
const updatesRoot = path.join(root, 'docs', 'updates');
const contentIndexPath = path.join(docsRoot, 'CONTENT_INDEX.yml');
const stickerRoot = path.join(docsRoot, 'about', 'stickers', 'assets', 'svg');
const docsPrefix = 'src/content/docs/';

const navigatorPhases = new Set(['now', 'next', 'situation', 'later']);
const navigatorTags = new Set([
  'planning', 'traveling', 'arrived', 'settled',
  'before-arrival', 'after-arrival', 'not-settled',
  'stay-short', 'stay-temporary', 'stay-permanent', 'stay-unsure', 'long-stay',
  'housing-searching', 'housing-temporary', 'housing-stable', 'housing-buying',
  'job-search', 'employee', 'freelance', 'business', 'student', 'not-working', 'work-unsure',
  'adults-only', 'preschool-age', 'school-age',
  'pets', 'no-pets',
  'no-car', 'foreign-license', 'foreign-car', 'buy-car', 'car', 'driving',
]);

let errorCount = 0;
let warningCount = 0;

const toPosix = (value) => value.split(path.sep).join('/');
const relativeToRoot = (value) => toPosix(path.relative(root, value));

function escapeCommand(value) {
  return String(value)
    .replaceAll('%', '%25')
    .replaceAll('\r', '%0D')
    .replaceAll('\n', '%0A');
}

function report(level, file, line, message) {
  if (level === 'error') errorCount += 1;
  else warningCount += 1;

  const location = line ? `,line=${Math.max(1, line)}` : '';
  console.log(
    `::${level} file=${escapeCommand(file)}${location}::${escapeCommand(message)}`,
  );
}

function issue(level, code, line, message) {
  return { level, code, line, message };
}

async function walk(dir, predicate = () => true) {
  const result = [];
  let entries;

  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') return result;
    throw error;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(fullPath, predicate)));
    else if (entry.isFile() && predicate(fullPath)) result.push(fullPath);
  }

  return result.sort();
}

function routeForRelativeFile(relative) {
  const docsRelative = toPosix(relative).replace(/^src\/content\/docs\//, '');
  const withoutExtension = docsRelative.replace(/\.(?:md|mdx)$/i, '');

  if (withoutExtension === 'index') return '/';
  if (withoutExtension.endsWith('/index')) {
    return `/${withoutExtension.slice(0, -'/index'.length)}/`;
  }
  return `/${withoutExtension}/`;
}

function routeForFile(file) {
  return routeForRelativeFile(relativeToRoot(file));
}

function parseFrontmatter(source) {
  const normalized = source.replace(/^\uFEFF/, '');
  const lines = normalized.split(/\r?\n/);

  if (lines[0]?.trim() !== '---') {
    return {
      data: {},
      body: normalized,
      bodyStartLine: 1,
      errors: [{ line: 1, message: 'MDX page must start with YAML frontmatter (---).' }],
      warnings: [],
    };
  }

  let closing = -1;
  for (let index = 1; index < lines.length; index += 1) {
    const marker = lines[index].trim();
    if (marker === '---' || marker === '...') {
      closing = index;
      break;
    }
  }

  if (closing === -1) {
    return {
      data: {},
      body: normalized,
      bodyStartLine: 1,
      errors: [{ line: 1, message: 'Frontmatter is not closed with --- or ....' }],
      warnings: [],
    };
  }

  const rawFrontmatter = lines.slice(1, closing).join('\n');
  const document = YAML.parseDocument(rawFrontmatter, {
    prettyErrors: true,
    strict: true,
    uniqueKeys: true,
  });

  const errors = document.errors.map((item) => ({
    line: item?.linePos?.[0]?.line ? item.linePos[0].line + 1 : 2,
    message: `Invalid frontmatter YAML: ${item.message}`,
  }));
  const warnings = document.warnings.map((item) => ({
    line: item?.linePos?.[0]?.line ? item.linePos[0].line + 1 : 2,
    message: `Frontmatter YAML warning: ${item.message}`,
  }));

  let data = {};
  if (errors.length === 0) {
    const parsed = document.toJS();
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) data = parsed;
    else errors.push({ line: 2, message: 'Frontmatter must be a YAML mapping/object.' });
  }

  return {
    data,
    body: lines.slice(closing + 1).join('\n'),
    bodyStartLine: closing + 2,
    errors,
    warnings,
  };
}

function maskCode(text) {
  const lines = text.split('\n');
  let fence = null;

  return lines
    .map((line) => {
      const match = line.match(/^\s*(`{3,}|~{3,})/);
      if (match) {
        const marker = match[1][0];
        if (fence === null) fence = marker;
        else if (fence === marker) fence = null;
        return '';
      }
      if (fence !== null) return '';
      return line.replace(/`[^`\n]*`/g, '');
    })
    .join('\n');
}

function lineAt(text, index) {
  return text.slice(0, index).split('\n').length;
}

function collectFootnoteIssues(body, bodyStartLine) {
  const result = [];
  const masked = maskCode(body);
  const definitions = new Map();
  const references = [];
  const definitionPattern = /^\s*\[\^([^\]]+)\]:/gm;

  for (const match of masked.matchAll(definitionPattern)) {
    const label = match[1];
    const line = bodyStartLine + lineAt(masked, match.index) - 1;
    definitions.set(label, line);
    if (!/^\d+$/.test(label)) {
      result.push(issue('error', `footnote-label:${label}`, line, `Footnote label must be numeric: [^${label}].`));
    }
  }

  const referencePattern = /\[\^([^\]]+)\]/g;
  for (const match of masked.matchAll(referencePattern)) {
    const lineStart = masked.lastIndexOf('\n', match.index - 1) + 1;
    const before = masked.slice(lineStart, match.index);
    const after = masked.slice(match.index + match[0].length);
    if (/^\s*$/.test(before) && after.startsWith(':')) continue;

    const label = match[1];
    const line = bodyStartLine + lineAt(masked, match.index) - 1;
    references.push({ label, line });
    if (!/^\d+$/.test(label)) {
      result.push(issue('error', `footnote-reference:${label}`, line, `Footnote reference must be numeric: [^${label}].`));
    }
  }

  const referencedLabels = new Set(references.map((item) => item.label));

  for (const reference of references) {
    if (!definitions.has(reference.label)) {
      result.push(
        issue(
          'error',
          `footnote-missing:${reference.label}`,
          reference.line,
          `Footnote [^${reference.label}] has no definition.`,
        ),
      );
    }
  }

  for (const [label, line] of definitions) {
    if (!referencedLabels.has(label)) {
      result.push(
        issue(
          'error',
          `footnote-unused:${label}`,
          line,
          `Footnote definition [^${label}] is never referenced.`,
        ),
      );
    }
  }

  const firstNumericReferences = [];
  const seen = new Set();
  for (const reference of references) {
    if (!/^\d+$/.test(reference.label) || seen.has(reference.label)) continue;
    seen.add(reference.label);
    firstNumericReferences.push(reference);
  }

  firstNumericReferences.forEach((reference, index) => {
    const expected = String(index + 1);
    if (reference.label !== expected) {
      result.push(
        issue(
          'warning',
          `footnote-order:${reference.label}:${expected}`,
          reference.line,
          `Footnotes should be numbered by first appearance: expected [^${expected}], found [^${reference.label}].`,
        ),
      );
    }
  });

  return result;
}

const allowedDynamicRoutes = [
  /^\/api(?:\/|$)/,
  /^\/edit\/?$/,
  /^\/methodology(?:\/|$)/,
  /^\/\.well-known(?:\/|$)/,
];

function collectLinkIssues(body, bodyStartLine, knownRoutes) {
  const result = [];
  const masked = maskCode(body);

  for (const match of masked.matchAll(/<https?:\/\/[^>\s]+>/g)) {
    const line = bodyStartLine + lineAt(masked, match.index) - 1;
    result.push(
      issue(
        'error',
        `autolink:${match[0]}`,
        line,
        'Markdown autolinks in angle brackets are not allowed; use [URL](URL).',
      ),
    );
  }

  const linkPattern = /(?<!!)\[[^\]\n]*\]\(([^)\n]+)\)/g;
  for (const match of masked.matchAll(linkPattern)) {
    let destination = match[1].trim();
    if (destination.startsWith('<')) {
      const closing = destination.indexOf('>');
      if (closing !== -1) destination = destination.slice(1, closing);
    } else {
      destination = destination.split(/\s+/)[0];
    }

    if (!destination || destination.startsWith('#') || destination.startsWith('{')) continue;
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(destination)) continue;
    if (destination.startsWith('//')) continue;

    const line = bodyStartLine + lineAt(masked, match.index) - 1;

    if (!destination.startsWith('/')) {
      result.push(
        issue(
          'error',
          `relative-link:${destination}`,
          line,
          `Internal link must use an absolute root path: ${destination}`,
        ),
      );
      continue;
    }

    const pathname = destination.split(/[?#]/, 1)[0];
    if (!pathname) continue;
    if (allowedDynamicRoutes.some((pattern) => pattern.test(pathname))) continue;
    if (/\.[a-z0-9]{1,8}$/i.test(pathname)) continue;

    if (!knownRoutes.has(pathname)) {
      if (!pathname.endsWith('/') && knownRoutes.has(`${pathname}/`)) {
        result.push(
          issue(
            'error',
            `trailing-slash:${pathname}`,
            line,
            `Internal route must use its canonical trailing slash: ${pathname}/`,
          ),
        );
      } else {
        result.push(
          issue(
            'warning',
            `unknown-route:${pathname}`,
            line,
            `Route is not present in the public MDX tree or CONTENT_INDEX.yml; verify it in rslive.ru: ${pathname}`,
          ),
        );
      }
    }
  }

  return result;
}

function collectNavigatorIssues(data, route) {
  const result = [];
  if (!Object.hasOwn(data, 'navigator')) return result;

  const navigator = data.navigator;
  if (!navigator || typeof navigator !== 'object' || Array.isArray(navigator)) {
    return [issue('error', 'navigator-type', 2, 'Frontmatter navigator must be a mapping/object.')];
  }

  if (route === '/en/' || route.startsWith('/en/') || route === '/sr/' || route.startsWith('/sr/')) {
    result.push(issue('error', 'navigator-locale', 2, 'Localized /en/ and /sr/ pages are not connected to the Russian RelocationWizard.'));
  }

  if (typeof data.description !== 'string' || data.description.trim() === '') {
    result.push(issue('error', 'navigator-description', 2, 'A page with navigator must have a non-empty description for the recommendation card.'));
  }

  const phases = Object.entries(navigator);
  if (phases.length === 0) {
    result.push(issue('error', 'navigator-empty', 2, 'Frontmatter navigator must contain at least one phase.'));
    return result;
  }

  for (const [phase, value] of phases) {
    if (!navigatorPhases.has(phase)) {
      result.push(issue('error', `navigator-phase:${phase}`, 2, `Unknown navigator phase: ${phase}.`));
      continue;
    }

    let clauses = null;
    if (Array.isArray(value) && value.every((item) => typeof item === 'string')) clauses = [value];
    else if (Array.isArray(value) && value.every((item) => Array.isArray(item))) clauses = value;

    if (!clauses || clauses.length === 0) {
      result.push(issue('error', `navigator-shape:${phase}`, 2, `navigator.${phase} must be [tag, ...] or [[tag, ...], [tag, ...]].`));
      continue;
    }

    const seenClauses = new Set();
    for (const [clauseIndex, clause] of clauses.entries()) {
      if (!Array.isArray(clause) || clause.length === 0 || !clause.every((tag) => typeof tag === 'string' && tag.trim() !== '')) {
        result.push(issue('error', `navigator-clause:${phase}:${clauseIndex}`, 2, `navigator.${phase} contains an empty or invalid AND-clause.`));
        continue;
      }

      const seenTags = new Set();
      for (const tag of clause) {
        if (!navigatorTags.has(tag)) {
          result.push(issue('error', `navigator-tag:${tag}`, 2, `Unknown navigator tag: ${tag}. Update the engine tag registry before using a new tag.`));
        }
        if (seenTags.has(tag)) {
          result.push(issue('error', `navigator-duplicate-tag:${phase}:${tag}`, 2, `navigator.${phase} repeats tag ${tag} inside one AND-clause.`));
        }
        seenTags.add(tag);
      }

      const signature = [...seenTags].sort().join('|');
      if (seenClauses.has(signature)) {
        result.push(issue('error', `navigator-duplicate-clause:${phase}:${signature}`, 2, `navigator.${phase} contains the same OR-clause more than once.`));
      }
      seenClauses.add(signature);
    }
  }

  return result;
}

function collectEditorialIssues(parsed, relative, knownRoutes, stickerNames) {
  const result = [];
  const { data, body, bodyStartLine } = parsed;
  const route = routeForRelativeFile(relative);

  if (!data.description) {
    result.push(
      issue('warning', 'description-missing', 2, 'Frontmatter has no description.'),
    );
  }

  if (Object.hasOwn(data, 'source')) {
    result.push(
      issue('warning', 'legacy-source', 2, 'Legacy frontmatter field source is deprecated; use live.'),
    );
  }

  if (typeof data.live === 'string') {
    const expected = `https://rslive.ru${route}`;
    if (data.live !== expected) {
      result.push(
        issue('error', `live-mismatch:${expected}`, 2, `Frontmatter live must match the file route: ${expected}`),
      );
    }
  }

  if (typeof data.ogSticker === 'string' && !stickerNames.has(data.ogSticker)) {
    result.push(
      issue(
        'warning',
        `unknown-public-sticker:${data.ogSticker}`,
        2,
        `ogSticker is not in the public SVG archive; verify that it is an engine-only sticker: ${data.ogSticker}`,
      ),
    );
  }

  result.push(...collectFootnoteIssues(body, bodyStartLine));
  result.push(...collectLinkIssues(body, bodyStartLine, knownRoutes));
  return result;
}

async function checkGlobalMdxFile(file) {
  const relative = relativeToRoot(file);
  const source = await readFile(file, 'utf8');
  const parsed = parseFrontmatter(source);

  for (const item of parsed.errors) report('error', relative, item.line, item.message);
  for (const item of parsed.warnings) report('warning', relative, item.line, item.message);

  if (parsed.errors.length === 0) {
    if (typeof parsed.data.title !== 'string' || parsed.data.title.trim() === '') {
      report('error', relative, 2, 'Frontmatter must contain a non-empty title.');
    }

    for (const item of collectNavigatorIssues(parsed.data, routeForRelativeFile(relative))) {
      report(item.level, relative, item.line, item.message);
    }
  }

  try {
    await compile({ path: relative, value: parsed.body }, { remarkPlugins: [remarkGfm] });
  } catch (error) {
    const parserLine = error?.position?.start?.line ?? 1;
    report(
      'error',
      relative,
      parsed.bodyStartLine + parserLine - 1,
      `Invalid MDX syntax: ${error?.reason || error?.message || String(error)}`,
    );
  }

  return { source, parsed };
}

async function checkContentIndex() {
  const relative = relativeToRoot(contentIndexPath);
  const source = await readFile(contentIndexPath, 'utf8');
  const document = YAML.parseDocument(source, {
    prettyErrors: true,
    strict: true,
    uniqueKeys: true,
  });

  for (const item of document.errors) {
    const line = item?.linePos?.[0]?.line ?? 1;
    report('error', relative, line, `Invalid CONTENT_INDEX.yml: ${item.message}`);
  }

  if (document.errors.length > 0) return new Set();

  const data = document.toJS();
  if (!Array.isArray(data?.pages)) {
    report('error', relative, 1, 'CONTENT_INDEX.yml must contain a pages array.');
    return new Set();
  }

  const seen = new Set();
  for (const page of data.pages) {
    const url = page?.url;
    if (typeof url !== 'string') {
      report('error', relative, 1, 'Every CONTENT_INDEX page entry must contain a string url.');
      continue;
    }
    if (seen.has(url)) report('error', relative, 1, `Duplicate CONTENT_INDEX URL: ${url}`);
    seen.add(url);

    if (!url.startsWith('/') || (url !== '/' && !url.endsWith('/'))) {
      report('error', relative, 1, `CONTENT_INDEX URL must be an absolute canonical route: ${url}`);
    }

    const expectedLocale =
      url === '/sr/' || url.startsWith('/sr/')
        ? 'sr'
        : url === '/en/' || url.startsWith('/en/')
          ? 'en'
          : null;
    if (expectedLocale && page?.locale !== expectedLocale) {
      report(
        'error',
        relative,
        1,
        `Localized CONTENT_INDEX route ${url} must declare locale: ${expectedLocale}`,
      );
    }
  }

  return seen;
}

function checkContentIndexCoverage(mdxFiles, indexUrls) {
  for (const file of mdxFiles) {
    const route = routeForFile(file);
    if (!indexUrls.has(route)) {
      report(
        'error',
        relativeToRoot(file),
        1,
        `Content route must be registered in CONTENT_INDEX.yml: ${route}`,
      );
    }
  }
}

async function checkUpdateJson() {
  const jsonFiles = await walk(updatesRoot, (file) => file.endsWith('.json'));
  for (const file of jsonFiles) {
    const relative = relativeToRoot(file);
    try {
      JSON.parse(await readFile(file, 'utf8'));
    } catch (error) {
      report('error', relative, 1, `Invalid JSON: ${error.message}`);
    }
  }
}

async function loadStickerNames() {
  const names = new Set();
  let entries = [];
  try {
    entries = await readdir(stickerRoot, { withFileTypes: true });
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.svg')) names.add(entry.name.slice(0, -4));
  }
  return names;
}

function gitOutput(args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function loadChangedPages() {
  const base = process.env.QC_BASE_SHA?.trim();
  const head = process.env.QC_HEAD_SHA?.trim() || 'HEAD';
  if (!base || /^0+$/.test(base)) {
    console.log('No comparison base SHA; running repository-wide syntax checks only.');
    return { current: new Map(), deleted: [] };
  }

  let output;
  try {
    output = gitOutput([
      'diff',
      '--name-status',
      '--find-renames',
      base,
      head,
      '--',
      'src/content/docs',
      'docs/updates',
    ]);
  } catch (error) {
    console.log(`Could not determine changed files from ${base} to ${head}; repository-wide syntax checks still run.`);
    return { current: new Map(), deleted: [] };
  }

  const current = new Map();
  const deleted = [];
  if (!output) return { current, deleted };

  for (const line of output.split('\n')) {
    const fields = line.split('\t');
    const status = fields[0];

    if (status.startsWith('R') && fields.length >= 3) {
      const oldPath = toPosix(fields[1]);
      const newPath = toPosix(fields[2]);
      if (/^src\/content\/docs\/.*\.(?:md|mdx)$/i.test(oldPath)) deleted.push(oldPath);
      if (/^src\/content\/docs\/.*\.(?:md|mdx)$/i.test(newPath)) {
        current.set(newPath, { status: 'R', baselinePath: oldPath });
      }
      continue;
    }

    const file = toPosix(fields[1] || '');
    if (!/^src\/content\/docs\/.*\.(?:md|mdx)$/i.test(file)) continue;

    if (status.startsWith('D')) deleted.push(file);
    else current.set(file, { status: status[0], baselinePath: status.startsWith('A') ? null : file });
  }

  return { current, deleted };
}

function readFileAtRevision(revision, relative) {
  try {
    return gitOutput(['show', `${revision}:${relative}`]);
  } catch {
    return null;
  }
}

function issueKey(item) {
  return `${item.level}|${item.code}`;
}

function reportNewIssues(file, currentIssues, baselineIssues) {
  const baselineKeys = new Set(baselineIssues.map(issueKey));
  for (const item of currentIssues) {
    if (!baselineKeys.has(issueKey(item))) {
      report(item.level, file, item.line, item.message);
    }
  }
}

async function checkChangedPages(changes, parsedByFile, knownRoutes, indexUrls, stickerNames) {
  const base = process.env.QC_BASE_SHA?.trim();

  for (const [relative, change] of changes.current) {
    const absolute = path.join(root, relative);
    const currentParsed = parsedByFile.get(relative)?.parsed;
    if (!currentParsed) continue;

    const currentIssues = collectEditorialIssues(
      currentParsed,
      relative,
      knownRoutes,
      stickerNames,
    );

    let baselineIssues = [];
    if (base && change.baselinePath) {
      const baselineSource = readFileAtRevision(base, change.baselinePath);
      if (baselineSource !== null) {
        const baselineParsed = parseFrontmatter(baselineSource);
        baselineIssues = collectEditorialIssues(
          baselineParsed,
          change.baselinePath,
          knownRoutes,
          stickerNames,
        );
      }
    }

    reportNewIssues(relative, currentIssues, baselineIssues);

    if ((change.status === 'A' || change.status === 'R') && !indexUrls.has(routeForFile(absolute))) {
      report(
        'error',
        relative,
        1,
        `New content route must be registered in CONTENT_INDEX.yml: ${routeForFile(absolute)}`,
      );
    }
  }

  for (const relative of changes.deleted) {
    const route = routeForRelativeFile(relative);
    if (indexUrls.has(route)) {
      report(
        'error',
        'src/content/docs/CONTENT_INDEX.yml',
        1,
        `Deleted or renamed content route is still present in CONTENT_INDEX.yml: ${route}`,
      );
    }
  }
}

async function main() {
  await access(docsRoot);

  const mdxFiles = await walk(
    docsRoot,
    (file) => /\.(?:md|mdx)$/i.test(file) && path.basename(file).toLowerCase() !== 'readme.md',
  );
  const routeSet = new Set(mdxFiles.map(routeForFile));
  const stickerNames = await loadStickerNames();
  const changes = loadChangedPages();

  console.log(`Checking syntax for ${mdxFiles.length} content pages...`);
  console.log(`Applying delta-aware editorial checks to ${changes.current.size} changed page(s) and ${changes.deleted.length} deleted/renamed route(s).`);

  const indexUrls = await checkContentIndex();
  checkContentIndexCoverage(mdxFiles, indexUrls);
  const knownRoutes = new Set([...routeSet, ...indexUrls]);
  await checkUpdateJson();

  const parsedByFile = new Map();
  for (const file of mdxFiles) {
    const relative = relativeToRoot(file);
    parsedByFile.set(relative, await checkGlobalMdxFile(file));
  }

  await checkChangedPages(changes, parsedByFile, knownRoutes, indexUrls, stickerNames);

  console.log(`Content quality: ${errorCount} error(s), ${warningCount} warning(s).`);
  if (errorCount > 0) process.exitCode = 1;
}

await main();
