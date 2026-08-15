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
