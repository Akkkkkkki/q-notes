# q-notes automation prompts

Each file here is a self-contained prompt for one stage of the editorial pipeline
described in [`docs/pipeline.md`](../docs/pipeline.md). Paste a file's contents into any
scheduled agent runtime that has access to this repository, web browsing (where noted),
and a notification channel (where noted).

| File | Schedule | Web | Notify | Output |
|---|---|---|---|---|
| `01-topic-scout.md` | Mon 08:00 | yes | no | commit to `main` |
| `02-interview-brief.md` | Tue 08:00 | light | yes | commit to `main` + notification |
| `03-drafter.md` | Thu 08:00 | yes | no | pull request |
| `03b-editorial-critic.md` | Thu 16:00 | as needed | no | PR critic comment / narrow subtractive edit |
| `04-ship-gate.md` | Fri 08:00 | no | yes | PR comments/edits + notification |
| `05-gardener.md` | 1st of month 09:00 | light | yes | commit to `main` + notification |

Rollout: enable 01 + 02 in week one, 03 + 03b + 04 in week two, 05 after the first month.
Routine 03b is a required content-PR stage: Routine 04 may not post `Ready to ship` or
`Ready — queued` without an applicable editorial-critic `KEEP` for the current semantic
draft. These supersede the prompts in `.codex/automations/` — unschedule those when 01
goes live.

Shared rules for every routine:

- Read `AGENTS.md` and `docs/pipeline.md` before acting; they define the editorial bar,
  tiers, and bilingual contract. Routines 03b and 04 also read
  `docs/editorial-critic.md`.
- Research artifacts (`research/**`) commit directly to `main`. Post content
  (`src/content/posts/**`) goes through pull requests. Editorial-critic output is PR-only
  metadata and never enters the public article.
- Never end a run silently. If the intended output isn't possible, commit or comment a
  short run report saying what was considered and why.