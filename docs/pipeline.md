# q-notes Editorial Pipeline

A closed-loop system for regularly publishing bilingual (English + 中文) notes and essays,
where automations do the heavy lifting and the author supplies the only thing that matters:
their own point of view.

This document is the source of truth. The runnable prompts for each stage live in
[`automations/`](../automations/). The old `.codex/automations/` prompts are superseded by
this pipeline and should be unscheduled once the new routines are live.

---

## 1. Why the previous setup produced nothing

The topic scout worked. It ran twice (2026-05-28, 2026-05-29), produced 8 well-researched
backlog candidates, and then the system went quiet. The failure was structural, not a
quality problem:

| Failure | Mechanism |
|---|---|
| **Open loop** | Ideas flowed into `research/backlog.md`, but no stage was obligated to pull them out. Every item is still `Status: Backlog`. |
| **Skip-by-default drafter** | The drafter was told "no draft is better than a weak draft" — so the rational behavior every run was to skip. Combined with author perfectionism, the system's default output is zero. |
| **Authenticity gap** | Drafts were synthesized from external sources. They read as aggregation, not as the author's thinking — so even good drafts didn't feel publishable. |
| **No expiry** | Backlog items are timely by construction ("why this is interesting *now*") but never expire, so the queue silently rots instead of forcing a decision. |
| **Review friction everywhere** | Even backlog metadata updates required PRs, multiplying the number of human approval points. |

Every design decision below exists to close one of these gaps.

## 2. Design principles

1. **The author is the voice; AI is everything else.** Automations scout, fact-check,
   interview, structure, edit, and translate. The opinion in every published piece must
   originate from the author — captured cheaply via a 15-minute written or voice braindump,
   never invented by the model. This is the antidote to "aggregating random information
   and posting it out."
2. **The pipeline always produces its smallest shippable thing.** No stage is allowed to
   skip silently. If the ideal output isn't possible, each stage has a defined fallback
   (see the fallback ladder, §4.3). A short note beats no essay.
3. **Every artifact has a clock.** Backlog items expire at 21 days. Draft PRs get
   downgraded at 7 days and closed at 14. Stuck is a state the system resolves on its
   own; it never waits indefinitely for the author to feel ready.
4. **Tiered definitions of done.** Perfectionism thrives on a single implicit "great essay"
   bar. Replace it with explicit per-tier checklists (§5). When the checklist passes, the
   piece ships — improvements happen post-publish, in git history, like code.
5. **One PR per piece, both languages inside.** A post is not done until both the English
   and Chinese versions exist. They are reviewed and shipped as a single editorial unit.
6. **PRs for content only.** Backlog, inbox, interview, and glossary changes commit
   directly to `main`. Human review is reserved for the one thing that needs it:
   the published words.
7. **Voice is enforced by mechanism, not vibes.** `research/voice.md` (the voiceprint)
   records the author's stances, signature phrasings, and never-say terms. The drafter
   carries a verbatim spine of the author's own phrases into every piece and declares
   any opinion it cannot trace to author input; the ship gate flags voice violations as
   questions, never as blockers. Easy must never come to mean generic. (Full design:
   [`docs/companion-vision.md`](./companion-vision.md) §4.)

## 3. Content tiers

| Tier | Tag | Length | Bar | Cadence target |
|---|---|---|---|---|
| **Note** (笔记) | `note` | 300–700 words | One idea, one concrete example, one acknowledged counterpoint. | ≥ 2 / month |
| **Essay** (文章) | `essay` | 800–1,500 words | The existing q-notes bar: arguable thesis, mechanism-level argument, sources, counterargument. | ≥ 1 / month |
| **Tracker** (预测) | `tracker` | any | Revisits a falsifiable prediction made in a previous post and scores it honestly. | opportunistic |

A post's frontmatter also carries a maturity field so readers (and the author) know
shipping early is intentional:

- `maturity: seedling` — a thought released early, may change substantially.
- `maturity: growing` — argued, sourced, still open.
- `maturity: evergreen` — the author stands behind it as written.

Publishing a `seedling` is explicitly a success, not a compromise. The maturity label
*is* the perfectionism release valve: it tells readers what they're getting, which makes
"good enough for now" an honest contract rather than a lowered standard.

## 4. The weekly loop

Total author time: **~45–75 minutes per week**, split into two natural sessions.
Everything else is automated.

```
            ┌──────────────────────────────────────────────────────────┐
            │                                                          │
            ▼                                                          │
  Mon  SCOUT ──► backlog.md (≤3 candidates, expiry enforced)           │
            │                                                          │
  Tue  INTERVIEWER ──► research/interviews/<date>-<slug>.md            │
            │           + notification to author                       │
            ▼                                                          │
  Tue–Thu  AUTHOR BRAINDUMP (15–30 min, voice-dump quality, any language)
            │                                                          │
  Thu  DRAFTER ──► PR with en + zh versions (or fallback ladder)       │
            │                                                          │
  Fri  SHIP GATE ──► checklist verdict + 5-min author approval         │
            │                                                          │
  Monthly  GARDENER ──► stats, expiry, archive mining ─────────────────┘
```

### 4.1 Monday — Scout (`automations/01-topic-scout.md`)

Refinement of the existing scout, with three changes that matter:

- **Expiry enforcement.** Before adding anything, mark items older than 21 days as
  `Status: Expired (YYYY-MM-DD)`. Forced decay keeps the queue honest.
- **Anchor to the author.** At least one of the ≤3 new candidates must connect to a spark
  in `research/inbox.md` or to a position taken in a published post. The scout also runs a
  **disagreement hunt**: find one smart, current take the author would plausibly *disagree*
  with given their published positions — disagreement is the most reliable generator of
  original thought.
- **Commits directly to `main`.** No PR for backlog metadata.

### 4.2 Tuesday — Interviewer (`automations/02-interview-brief.md`)

The stage that converts "AI aggregation" into "author's thinking." Picks the single
strongest live candidate (or an inbox spark if it beats the backlog) and writes an
interview brief to `research/interviews/`, containing:

- the candidate's thesis and the strongest counterargument, in three sentences;
- **five sharp questions** designed to extract what only the author can add — experience,
  disagreement, predictions, stakes ("Where have you seen this firsthand?", "What part of
  this thesis is wrong?", "What would change your mind?");
- a blank `## Author answers` section.

The author answers in 15–30 minutes, in either language, at voice-dump quality —
fragments, mixed English/中文, typos all fine. **The answers are the raw material; the
brief without answers produces a Note at most, never a ghost-written Essay.**

### 4.3 Thursday — Drafter (`automations/03-drafter.md`)

The skip-by-default rule is replaced by a **fallback ladder**. The drafter always
produces the highest rung available:

1. **Interview answers exist** → draft an Essay whose spine is the author's own answers
   (their claims, their examples, their phrasing where usable), with scout research as
   supporting evidence. Re-validate sources before drafting.
2. **No answers, but inbox has a meaty spark** → draft a Note developing that spark.
3. **Neither** → draft a Tracker update or a Note that connects a published post to
   something that happened since.
4. **Genuinely nothing** → commit a one-paragraph run report to the interview file
   explaining what was considered and why nothing cleared the bar. Silence is forbidden;
   a visible "why not" is itself a signal the loop is alive.

The drafter writes **both language versions in the same PR** (see §6), runs
`npm run build`, marks the backlog item `Drafted`, and opens a ready (non-draft) PR whose
body contains: thesis, tier, sources re-checked, what the author should challenge,
a claim-parity confirmation between the two language versions, a **voice section**
(the author phrases kept verbatim; any opinion not traceable to author input — a list
that should be empty), and **three title options per language** so the author can swap
the title at ship time without writing anything.

### 4.4 Friday — Ship gate (`automations/04-ship-gate.md`)

The anti-perfectionism enforcer. For every open content PR:

- Run the tier's definition-of-done checklist (§5). If it passes, comment a verdict:
  **"Ready to ship"** plus a 3-bullet summary, so the author's approval takes five
  minutes on a phone.
- Run the **voice check** against `research/voice.md`: never-list hits, and any
  opinionated claim not traceable to the author's answers, sparks, or published
  positions, get flagged in the verdict as questions ("Says X — yours?"). Voice flags
  shape the author's five minutes; they never block a passing checklist.
- If the PR has been open **> 7 days**: cut it down — extract the strongest single idea
  into a Note, re-tier, and re-propose. The system converts stuck essays into shipped notes.
- If open **> 14 days**: close it, log one line in the backlog item explaining the kill.
  Killed is a valid outcome; zombie is not.

The author's only recurring obligations are the Tuesday braindump and the Friday
five-minute approval. Both are phone-sized.

### 4.5 Monthly — Gardener (`automations/05-gardener.md`)

First of the month:

- **Throughput report** (committed to `research/retro/YYYY-MM.md` and sent as a
  notification): published per tier per language, median days from draft to publish,
  items expired/killed, % of published pieces originating from author sparks or interview
  answers vs. pure scout finds.
- **Archive mining**: re-read the author's published posts, find predictions now testable
  (e.g., the consulting series' "EM promotion-rate compression by 2027" test) and external
  events that confirm/contradict published theses → propose Tracker candidates. This is
  how the site develops *continuity of thought* instead of a stream of unrelated takes.
- **Voiceprint maintenance**: propose 1–3 additions to `research/voice.md` under its
  `Proposed` heading — a stance now taken in public, a signature phrasing worth keeping,
  a new never-say — mined from the month's interview answers and published pieces.
  Propose only; promotion is the author's, by editing the file.
- **Hygiene**: glossary consistency check, dead-link scan, backlog pruning.

## 5. Definitions of done

A piece ships when its tier checklist passes — not when it feels finished.

**Note**
- [ ] One arguable claim a reader could repeat in one sentence.
- [ ] One concrete example or mechanism (not just assertion).
- [ ] One acknowledged counterpoint, even if only a sentence.
- [ ] Both language versions present and claim-equivalent.
- [ ] Build passes.

**Essay** — all of the above, plus:
- [ ] Opens with the tension; thesis stated in the first two paragraphs.
- [ ] Factual claims that depend on current events have linked sources, re-validated at draft time.
- [ ] The strongest counterargument is engaged, not strawmanned.
- [ ] Contains at least one falsifiable statement or prediction (tracker fuel).
- [ ] Speculation is labeled as speculation.

**Tracker** — scores the original prediction honestly (right / wrong / too early), links the
original post, and states what was learned. Both languages. That's the whole bar.

Explicitly **not** on any checklist: "the author has reread it five times," "every
paragraph is polished," "covers all angles." If a checklist passes and the author still
hesitates, the maturity field goes to `seedling` and it ships anyway — that's the deal.

## 6. Bilingual design (中英双语)

### Editorial contract

Every published piece has an English and a Chinese version, written as
**transcreation, not literal translation**:

- **Identical**: the thesis, the structure/section order, every factual claim, every
  number, every source link, the maturity level.
- **Adaptable**: idioms, sentence rhythm, rhetorical openings, and titles (each title
  should be punchy in its own language rather than a translation of the other).
- **Glossary-governed**: recurring terms (e.g., "agent" → 智能体, "forward-deployed
  engineer", "reward hacking") use the renderings in `research/glossary.md` so the site
  reads consistently over time. The drafter appends newly-decided terms each run.
- **Direction**: draft first in whichever language the author's interview answers lean
  toward; transcreate into the other. Mixed-language answers are normal input.
- **Parity check**: the drafter lists every claim in both versions and confirms parity in
  the PR body. The ship gate spot-checks it.

### Content model (Phase 2 implementation, separate PR)

Current state: language is a tag (`"English"`); the schema has no language concept.
Target state:

1. **Schema** (`src/content.config.ts`): add
   `lang: z.enum(['en', 'zh'])` and `translationKey: z.string()`
   (shared slug linking the pair). Migrate the `"English"` tag off the existing posts.
2. **Files**: `src/content/posts/<translationKey>.en.md` and `<translationKey>.zh.md`.
3. **Routing**: English keeps current URLs (`/posts/<slug>`); Chinese lives at
   `/zh/posts/<slug>`. Each post page shows a language toggle resolved via
   `translationKey`. Index/journal/tag pages gain a language filter (default English,
   sticky preference).
4. **Feeds**: `/rss.xml` (en) and `/zh/rss.xml` (zh).
5. **Typography**: verify CJK rendering in `global.css` (font stack fallback to
   `"Noto Sans SC"`/system CJK fonts; check line-height and punctuation hanging).
6. **Back-fill**: the three existing consulting essays get Chinese versions — three
   ready-made early wins for the new pipeline.

Until Phase 2 lands, the writing pipeline still doesn't block on the site work — but the
zh file cannot live under `src/content/posts/` yet, because the collection publishes
every file there and `src/pages/posts/[slug].astro` builds URLs from the file id (a
`slug.zh.md` would go live at `/posts/slug.zh` in the English list and RSS). So
pre-Phase-2 the drafter keeps the current `<slug>.md` convention for English and parks
the Chinese version at `drafts/zh/<slug>.md`, outside the collection, in the same PR.
Phase 2 includes moving parked zh files into place.

## 7. Capturing the author's own sparks

`research/inbox.md` is a frictionless capture file: one line per thought, no format
requirements beyond a date. Capture paths, lowest-friction first:

- GitHub mobile app → edit `research/inbox.md` directly (30 seconds).
- A mobile note/voice connector (Apple Notes, Drafts, or a messaging connector) with a
  routine that periodically syncs captures into the inbox file.
- Telling any Claude session "add to my q-notes inbox: …".

The scout and drafter treat inbox sparks as **first-class, outranking external finds** —
a half-formed authored thought beats a polished aggregated one, by policy.

The inbox has a sibling: `research/voice.md`, the **voiceprint**. Where the inbox
captures *what* the author thinks, the voiceprint captures *how they sound* — stances,
signature phrasings, never-say terms — so the drafter writes in the author's voice
instead of asking a model to imagine one. The Companion design adds a **spark echo** on
top of the inbox: aged unconsumed sparks resurface as one-tap questions ("Still true?"),
and a "wrong now" answer appends the disagreement as a fresh spark — the author arguing
with their past self is the most reliable generator of original material the system has.

## 8. Execution: wiring the routines

Each file in `automations/` is a self-contained, tool-agnostic prompt: paste it into a
scheduled cloud routine (Claude Code cloud sessions, Claude Desktop automations, a GitHub
Action invoking an agent, or any scheduler that can run an agent with repo + web access).

| Routine | Schedule | Needs web | Needs notify | Writes |
|---|---|---|---|---|
| 01 Topic scout | Mon 08:00 | yes | no | commit to `main` |
| 02 Interview brief | Tue 08:00 | light | **yes** | commit to `main` |
| 03 Drafter | Thu 08:00 | yes | no | PR |
| 04 Ship gate | Fri 08:00 | no | **yes** | PR comments / edits |
| 05 Gardener | 1st of month 09:00 | light | yes | commit + notification |

Connector requirements: GitHub (all), web search/browse (scout, drafter), one
notification channel the author actually checks — email or phone push — for the
interviewer, ship gate, and gardener. A calendar connector blocking a weekly 30-minute
"author hour" (Tue or Wed) is optional but recommended.

Start order: enable 01 + 02 first week; add 03 + 04 the second week once one interview
has answers; add 05 after the first month. Unschedule the old `.codex` routines when 01
goes live.

## 9. Health metrics

The gardener reports these monthly; three consecutive misses on any target means the
pipeline design (not the author) gets revised:

| Metric | Target |
|---|---|
| Published pieces / month | ≥ 3 (any tier mix), of which ≥ 1 Essay |
| Median days, draft PR → published | ≤ 7 |
| Posts with both languages | 100% |
| Pieces rooted in author input (inbox spark or interview answers) | ≥ 60% |
| Backlog items older than 21 days | 0 (auto-expired) |
| Drafter runs producing nothing (no artifact, no report) | 0 |

The fourth metric is the one that distinguishes this site from an aggregation feed.
If it drops, the fix is more interviewing and archive mining, not more scouting.
