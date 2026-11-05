# Content Update Stack

This folder stores human-facing update notes derived from article changes in `main`.

- `daily/YYYY-MM-DD.json` - machine-readable daily stack for automation
- `daily/YYYY-MM-DD.md` - accumulated daily note for humans
- `monthly/YYYY-MM.md` - monthly roll-up assembled from daily stacks

These files are intended to feed Telegram digests, blog updates, and monthly summaries.

## Required update flow

For every meaningful published article change in `src/content/docs/**`, update the current content update stack in the same PR:

1. update `daily/YYYY-MM-DD.json`;
2. update the matching `daily/YYYY-MM-DD.md`;
3. update `monthly/YYYY-MM.md` for the same date.

If the article already appears in the current daily stack, append only the new summaries to that article instead of creating a duplicate article entry. Keep `article_count` equal to the number of unique articles represented in the daily stack.

`commit_count` records the number of content publication units represented by the daily snapshot. A merged content PR counts as one publication unit; a meaningful content commit pushed directly to `main` also counts as one. Do not count the PR merge and its internal review/fixup commits separately.

Do not replace or remove earlier summaries from the same day unless the underlying content change was reverted, superseded before publication, or the summary itself was incorrect.

## Calendar and historical backfill

Daily stacks use the calendar date in **Europe/Belgrade**, not a rolling 24-hour window.

For historical reconstruction and post-merge corrections:

- a merged PR belongs to the Europe/Belgrade calendar date when it was merged into `main`;
- a meaningful direct commit belongs to the Europe/Belgrade calendar date when it reached `main`;
- branch-only review, rebase and fixup commits are not separate publication events;
- several meaningful changes to the same article on the same day stay in one article entry with multiple summaries;
- if an earlier same-day state was superseded before it became the final reader-visible result, describe the final published result instead of preserving a transient intermediate state.

Exclude changes that do not materially change what a reader can learn or do, including:

- `CONTENT_INDEX.yml`-only maintenance;
- repository documentation or workflow changes;
- pure frontmatter/source metadata migrations;
- OG/presentation metadata-only changes;
- mechanical syntax cleanup and link-only maintenance without new reader-facing information.

Reader-visible repairs, such as fixing broken illustrations that carry useful information, may be included. The initial repository bootstrap/import is the archive baseline rather than a synthetic list of hundreds of “new” articles.

Monthly roll-ups are derived from the daily stacks. They may use a more compact one-line-per-article representation, but must preserve every day, article and summary represented by the daily files without inventing additional changes.

## Public-facing summaries

Daily JSON summaries, human-readable daily notes and monthly roll-ups are sources for **public news and social posts**. Describe changes in terms of what the reader can now find or do, not how the RSLive implementation stores or serves data.

- Prefer "Добавили каталог с поиском по названию, категории и городу" over descriptions of the internal database or storage provider.
- Do not include internal infrastructure terms such as `Supabase`, `PostgreSQL`, `SQLite`, `backend`, `dataset`, `Edge Function` or `GitHub Actions` in public update summaries. Preserve those details in code, PRs and technical documentation instead.
- Technical terms may still appear in a specialist article when they are the subject of the article. This rule governs publication summaries, not the article content itself.
- Keep daily JSON, daily Markdown and monthly Markdown semantically consistent when correcting an existing update; a previously published external post is not edited retroactively by changing the update stack.
- The content-quality check rejects newly added or modified lines containing known internal infrastructure terms in daily/monthly update entries. Review unusual cases manually rather than silently stripping words from a public message.

## Update language and localization

Write each article's `summaries` in the language of its published page, determined by the canonical URL / content path:

- `/en/` and `src/content/docs/en/**`: English summaries, English post template and CTA.
- `/sr/` and `src/content/docs/sr/**`: Serbian summaries, Serbian post template and CTA. Current Serbian editorial pages primarily use Serbian Cyrillic.
- Other canonical routes: Russian summaries, Russian post template and CTA.

The daily Markdown and monthly archive may contain updates for multiple languages. Each entry retains the language of its target page; **do not translate everything into Russian in order to make the archive homogeneous.**

The Edge ingest checks that the content path agrees with the canonical URL, rejects English summaries containing Cyrillic and flags recognizable Russian-only vocabulary in Serbian summaries. Content CI checks changed daily JSON summaries similarly. These checks are guardrails, **not proof of language quality**: translators/editors must ensure the entire announcement is written naturally in the target language. Fix the canonical stack rather than silently translating an already approved variant during delivery.

## Monthly blog from the canonical update archive

In addition to the monthly social digest, every **closed** month gets one reader-facing Starlight Blog article:

- Source of facts and links: `docs/updates/monthly/YYYY-MM.md` in this repository. Do not derive a new month from social post status, Git commits or the old rolling July–August blog article.
- Canonical route: `/blog/updates-YYYY-MM/`, owned by `src/content/docs/blog/updates-YYYY-MM/index.mdx` in `rslive_content`. The engine's mirrored copy is **not** an edit target.
- Layout: Russian-language overview grouped by reader topic, four annotated highlights per topic, and links to every other distinct page that changed. English and Serbian page titles/summary snippets retain their **source language**, rather than being silently translated. Per-article social announcements remain in the article's own language.
- Every figure is counted from the monthly archive: dated headings, recorded changes, and distinct canonical article URLs. A partial monthly archive is presented as partial; there is no invented coverage for missing days.
- The article uses its **actual publication date**, not the last day of the month. Backfilled articles identify themselves as retrospective; publishing the digest does not imply all laws, prices or procedures were reverified that day.
- Internal implementation details are rejected before rendering. If a canonical monthly entry contains a prohibited technical term, fix the archive and review the change, rather than silently emitting a public post with internal details.
- The generated monthly blog page is a derivative presentation of the *same* month and does **not** get added to its own daily/monthly update stack: that would recursively trigger news about the digest itself. New reporting or substantive additions to a blog article are normal content changes and do require updates.

### Production workflow

The workflow `.github/workflows/monthly-blog.yml` runs on the **second calendar day** of each month (07:17 UTC, safely after month close in Europe/Belgrade), or manually with `workflow_dispatch` and an optional closed `YYYY-MM`.

It runs `node --test scripts/prepare-monthly-blog.test.mjs`, then `node scripts/prepare-monthly-blog.mjs --month YYYY-MM`. If a page already exists or a month-specific branch is open, it leaves that work untouched. Otherwise it pushes `agent/monthly-blog-YYYY-MM` and opens a **draft PR**. An editor checks sources, language, links, metadata and the final month archive before merging: the workflow never publishes a draft automatically.

To preview a month without writing files:

`node scripts/prepare-monthly-blog.mjs --month 2026-10 --dry-run`

To create a retrospective issue with an honest release date:

`node scripts/prepare-monthly-blog.mjs --month 2026-10 --date 2026-11-05 --retrospective`

Once a blog PR is merged, the existing `content-index.yml` and `notify-rslive-ru.yml` workflows regenerate the index and synchronize the page to the engine. Do **not** hand-edit the generated `CONTENT_INDEX.yml`. If GitHub Actions has been restricted from creating PRs, grant the designated workflow token permission to create pull requests and rerun the workflow; the failure must be visible and not silently treated as a published blog post.
