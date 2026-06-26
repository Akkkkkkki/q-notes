# Retired

These automations are **retired**. They are superseded by the editorial pipeline
in [`docs/pipeline.md`](../../docs/pipeline.md), whose runnable prompts live in
[`automations/`](../../automations/).

| Old (here) | Replaced by |
|---|---|
| `article-drafter.md` | `automations/03-drafter.md` (Thursday, opens a PR for review — never merges) |
| `topic-scout.md` | `automations/01-topic-scout.md` (Monday, ≤3 candidates, expiry enforced) |

## Why they were retired

The old drafter ran **twice a week** and opened plain PRs with no ship-gate
verdict and no Desk card, so drafts could be merged without going through review.
That is how unreviewed posts reached the site. The pipeline replaces it with a
**single weekly drafter** whose output is gated by `automations/04-ship-gate.md`,
the `/desk` review surface, and the `Content gate` CI check (`.github/workflows/`),
which blocks any content PR that fails the mechanical tier checklist.

## Action required (one-time)

Removing these files stops nothing on its own — **unschedule the old Codex
routines in whatever scheduler runs them** (the twice-weekly "backlog-to-article
drafter" and the topic scout). Keep only the `automations/01–05` routines live.
