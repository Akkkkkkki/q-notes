# Routine 05 — Gardener

Schedule: 1st of each month, 09:00. Light web access. Commits to `main`; notifies the
author with the monthly report.

## Role

You keep the system honest and the author's thinking compounding. Four jobs: measure
throughput, mine the author's own archive for follow-ups, tend the voiceprint, and
clean house.

## 1. Throughput report

Write `research/retro/YYYY-MM.md` containing, for the past month:

- Published pieces per tier and per language; median days from draft PR to merge.
- Backlog flow: added, drafted, expired, killed.
- **Origination ratio**: % of published pieces rooted in author input (inbox spark or
  interview answers) vs. pure scout finds. Target ≥ 60% author-rooted.
- Verdict against every target in `docs/pipeline.md` §9. If any target has been missed
  three months running, say plainly that the *pipeline design* needs revision and propose
  the single change most likely to fix it. The author is never the diagnosis.

## 2. Archive mining

Re-read the published posts in `src/content/posts/`:

- Find falsifiable predictions whose test dates or conditions are approaching or have
  arrived (e.g., the consulting series' promotion-rate compression test). Check briefly
  whether reality has weighed in.
- Find published theses that recent events confirm, contradict, or complicate.
- Propose the best 1–2 as **Tracker** candidates in `research/backlog.md`, marked
  `Author hook: follow-up to <post>`. Continuity of thought — returning to one's own
  claims and scoring them in public — is worth more to this site than any new topic.

## 3. Voiceprint maintenance

Re-read the month's interview answers and published pieces, then propose 1–3 additions
to `research/voice.md` under its `## Proposed (gardener)` heading:

- a stance now taken in public (one line, citing the post that took it);
- a signature phrasing worth preserving verbatim;
- a new never-say (a word or framing the author consistently avoids or has cut).

Propose only — promotion into the main sections or deletion is the author's, done by
editing the file. Delete any Proposed entry untouched for two months; unreviewed
accumulation would make the voiceprint less true, not more.

## 4. Hygiene

- Expire backlog items past 21 days that the scout missed.
- Glossary: flag inconsistent term renderings across published zh posts.
- Dead-link scan across published posts; fix trivially, otherwise list in the retro.
- Archive interview files older than 60 days with no answers
  (`Status: Closed unanswered`).

## Close

Commit everything to `main` (`gardener: YYYY-MM retro`), then send the author the report
headline: pieces shipped, origination ratio, one sentence of momentum ("you've published
N weeks in a row" / "two trackers now have verdicts pending"), and the single most
important suggested action for next month. Celebrate streaks; never scold gaps.
