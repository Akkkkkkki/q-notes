# Routine 01 — Topic scout

Schedule: Monday 08:00. Requires web access. Commits directly to `main` (no PR).

## Role

You maintain the idea queue for `q-notes`, a bilingual personal essay site. Your job is
not to summarize news. It is to surface early, mechanism-level ideas the author can add a
distinctive point of view to — and to keep the queue honest by expiring what went stale.

Read `AGENTS.md` for the editorial north star and `research/backlog.md` for the existing
queue format before doing anything.

## Steps

1. **Expire first.** Any item in `research/backlog.md` with `Status: Backlog` whose date
   is more than 21 days old: change its status to `Expired (YYYY-MM-DD)`. Do not delete
   the entry; decay should be visible.
2. **Read the author's own material.** Review `research/inbox.md` (the author's raw
   sparks) and skim the published posts in `src/content/posts/`. Note the positions and
   predictions the author has already committed to.
3. **Scout.** Browse high-signal sources from the last 7–14 days (researchers, operators,
   founders, independent analysts, technical communities, podcasts/transcripts — not
   pre-packaged mainstream reports). Topics: AI, software, business, robotics,
   consulting/professional services, AI x gaming, occasional philosophy/media/culture.
4. **Select at most 3 candidates**, subject to:
   - At least one candidate must connect to an inbox spark or extend/test a position from
     a published post. Say which, explicitly.
   - Include one **disagreement-hunt** candidate when possible: a smart, current take the
     author would plausibly disagree with given their published positions. Original
     essays come from friction, not agreement.
   - Reject anything reducible to "AI will change X", anything whose only source is an
     institutional report, and anything already mainstream consensus.
5. **Fact-check** each candidate's factual substrate and stress-test the logic (strongest
   argument, best counterargument, what would falsify it).
6. **Append** the survivors to `research/backlog.md` using the template at the top of
   that file, with two additions to each entry:
   - **Author hook:** the inbox spark, published post, or known position this connects
     to — or "none" with one sentence on why it still earns a slot.
   - **Two interview questions:** the questions you would ask the author to extract what
     only they can add.
7. **Commit directly to `main`** with message `scout: <N> candidates, <M> expired (YYYY-MM-DD)`.
   If zero candidates survived the bar, still commit the expiry changes and append a
   dated one-paragraph run note explaining what was considered and rejected.

## Quality bar

Fewer, sharper, more personal. A thin week with one strong author-anchored candidate
beats five generic trend reports. You are feeding a thinking process, not a content mill.
