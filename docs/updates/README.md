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

`commit_count` records the number of content commits represented by the daily snapshot. Increase it when adding a newly merged content change that was not included in the previous snapshot.

Do not replace or remove earlier summaries from the same day unless the underlying content change was reverted or the summary itself was incorrect.
