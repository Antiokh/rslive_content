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
