# q-notes Editorial Pipeline

A closed-loop system for regularly publishing bilingual (English + 中文) notes and essays,
where automations do the heavy lifting and the author supplies the only thing that matters:
their own point of view.

This document is the source of truth. The runnable prompts for each stage live in
[`automations/`](../automations/). The old `.codex/automations/` prompts are superseded by
this pipeline and should be unscheduled once the new routines are live.

`docs/material-form.md` is the normative material/form addendum. `docs/editorial-critic.md`
is the focused contract for the independent scope/novelty review between drafting and
shipping.

> 中文版：[`docs/pipeline.zh.md`](./pipeline.zh.md)（对照译本；如有冲突以本文为准）。

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
   and Chinese versions exist. They are reviewed and shipped as a single editorial unit,
   sharing claims and evidence but not a required outline or section order.
6. **PRs for content only.** Backlog, inbox, interview, and glossary changes commit
   directly to `main`. Human review is reserved for the one thing that needs it:
   the published words.
7. **Voice is enforced by mechanism, not vibes.** `research/voice.md` (the voiceprint)
   records the author's stances, signature phrasings, and never-say terms. The drafter
   carries a verbatim spine of the author's own phrases into every piece and declares
   any opinion it cannot trace to author input; the ship gate flags voice violations as
   questions, never as blockers. Easy must never come to mean generic. (Full design:
   [`docs/companion-vision.md`](./companion-vision.md) §4.)
8. **Scope is reviewed independently from shipping.** The drafter is optimized to make a
   piece; the ship gate is optimized to prevent perfectionism and stuck work. Between
   them, Routine 03b independently asks whether the current thesis/scope/evidence actually
   earned the shape. Only an applicable critic `KEEP` advances to Routine 04.

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

### Optional reading-layout frontmatter

Beyond the required fields, a post may carry structured blocks the reading layout
surfaces automatically. All are optional and mirror the editorial moves the tiers already
ask for, so add them where they exist rather than inventing them:

- `definedTerm: { term, pos, definition }` — a coined term the piece defines on first use
  (the glossary discipline in `AGENTS.md`). Renders as a "Defined term" callout.
- `prediction: { statement, confidence, falsifier, status }` — the essay/tracker's
  falsifiable prediction. `confidence` is `low|medium|high`, `status` is
  `open|right|wrong|partial`; `statement` may contain a light `<em>` for emphasis.
- `sources: [{ label, title, url }]` — the collected, numbered bibliography (the prose
  keeps its own inline links).
- `connections: { linksTo: [translationKey], citedBy: [translationKey] }` — the note graph,
  by translationKey so it resolves per language. Shown as "Connections" in the aside.

Keep these identical across the en/zh pair (translate the prose fields; the keys stay the
same). "Read next" is computed from shared threads, so it needs no frontmatter.

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
  Thu 08  DRAFTER ──► PR with en + zh versions (or fallback ladder)    │
            │                                                          │
  Thu 16  EDITORIAL CRITIC ──► KEEP/CUT/DOWNGRADE/SPLIT/SKIP           │
            │                                                          │
  Fri  SHIP GATE ──► mechanical/checklist verdict + 5-min approval     │
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
- a blank `## Author answers` section;
- optionally, **answer directions** (`→ ` lines) under a question — angles the author
  could take, rendered as prompts on the phone, never answers put in the author's mouth.
  A leading keyword types each one: `→ text` is a stance (a choice chip), `→ push: text`
  a steelman to argue against, and `→ read: title — url` a reading worth a look.

The author answers in 15–30 minutes, in either language, at voice-dump quality —
fragments, mixed English/中文, typos all fine. Answering some now and finishing later is
expected; **the author owns the green light** and marks the brief `Ready to draft` from
the phone when they're happy. **The answers are the raw material; a brief that has not
been marked ready produces a Note at most, never a ghost-written Essay.** Ready means
permission to use the supplied answers in publishable work; it does not select the Essay
tier or promise a complete argument.

### 4.3 Thursday — Drafter (`automations/03-drafter.md`)

The skip-by-default rule is replaced by a **fallback ladder**. The drafter always
produces the highest rung the material honestly supports:

1. **A brief is marked `Status: Ready to draft`** (the author's explicit green light) →
   the answers are authorized for publishable use. Build the Author Kernel first,
   re-validate external sources, then choose the smallest honest form supported by the
   material. A ready brief may support an Essay, but readiness does not override an
   epistemic/domain boundary, a tentative claim, or an unresolved author-judgment
   question; those may cap the piece at a Note or remain unresolved.
2. **A brief has answers but is not marked ready** → the author is still working on it;
   do not build an Essay on answers they haven't signed off, and leave its `Status`
   untouched. Use it only as Note material when nothing better is available or it is near
   expiry (soft gate). Prefer to let the author finish and mark it ready.
3. **No usable answers, but inbox has a meaty spark** → draft a Note developing that spark.
4. **Neither** → draft a Tracker update or a Note that connects a published post to
   something that happened since.
5. **Genuinely nothing** → commit a one-paragraph run report to the interview file
   explaining what was considered and why nothing cleared the bar. Silence is forbidden;
   a visible "why not" is itself a signal the loop is alive.

Answer directions (`→ ` lines) are the interviewer's prompts, not the author's words:
treat a question as unanswered unless the author actually wrote under it in
`## Author answers`.

Before any prose, the drafter builds an **Author Kernel** from author-owned material only
and classifies every load-bearing claim into one of four ownership classes — see §10.
Each load-bearing claim receives a stable `C1`, `C2`, … Claim Ledger ID before either
language draft exists.

The drafter writes **both language versions in the same PR** (see §6), runs
`npm run build`, marks the backlog item `Drafted`, and opens a ready (non-draft) PR whose
body contains: thesis, tier, sources re-checked, what the author should challenge,
a **Bilingual parity** table keyed by Claim Ledger IDs, a **voice section** (the author
phrases kept verbatim; any opinion not traceable to author input — a list that should be
empty), a **claim ledger** and a **candidate hypotheses** section per §10, and **three
title options per language** so the author can swap the title at ship time without
writing anything.

### 4.3b Thursday — Editorial critic (`automations/03b-editorial-critic.md`)

An independent pass runs after the draft PR exists and before the Friday ship gate. Its
job is not to polish prose or maximize throughput. It asks whether the piece has actually
earned its current thesis, scope, evidence strength, and form — or whether a competent
model completed the available material into a more satisfying article than the author and
evidence support.

The critic consumes the PR's Author Kernel, Claim Ledger, Material Audit and Form decision,
both language drafts, and relevant recent Q-notes for self-novelty comparison. Under the
strict-v1 provenance rule, archive bodies can be read as history/self-novelty context but
do not authorize a current `Q-explicit` premise.

The PR-facing result is deliberately compact and singular:

```md
## Editorial critic

<!-- q-notes: editorial-critic head=<full PR head SHA> -->

### Verdict
KEEP | CUT | DOWNGRADE | SPLIT | SKIP

### Strongest single idea
<one sentence>

### Blocking reasoning failures
- <only thesis/scope/ownership/evidence/form failures>

### Required scope cuts / splits
- <what leaves and why>

### Optional warnings
- <only when useful>
```

Only `KEEP` advances to the ship gate. `CUT`, `DOWNGRADE`, `SPLIT`, and `SKIP` are valid
editorial outcomes, not failed runs. The critic may apply an unambiguous **subtractive**
repair after posting its initial verdict, but it must never invent replacement theory or
new author judgment; after any semantic repair it posts a fresh pass on the new head.

The marker binds the verdict to the semantic draft reviewed. A later thesis, Claim Ledger,
evidence, form/tier, major-section, substantive title, hypothesis-adoption, prediction, or
other reasoning change requires a fresh pass. Pure typo/format/link/build or
claim-preserving voice fixes do not force another expensive model pass; Routine 04 must
verify that no semantic scope changed before carrying a `KEEP` forward.

`docs/editorial-critic.md` is the focused canonical contract. As #87–#97 land, their
signals feed this **same** critic internally. They do not create a family of competing
PR-facing audit sections; #68 remains the integration owner.

### 4.4 Friday — Ship gate (`automations/04-ship-gate.md`)

The anti-perfectionism and mechanical-readiness enforcer. For every open content PR:

- **Work in the author's feedback before anything else.** Every Desk action that isn't
  Ship or Kill is a change request on that PR. Apply it before any new verdict.
- **Require the latest applicable editorial-critic verdict to be `KEEP`.** If there is no
  critic result, or the latest applicable result is `CUT`, `DOWNGRADE`, `SPLIT`, or
  `SKIP`, the gate cannot say Ready. If semantic edits happened after a `KEEP`, send the
  PR through Routine 03b again rather than re-judging scope inside Routine 04.
- Run the tier's definition-of-done checklist (§5), with `docs/material-form.md` as the
  normative material/form amendment.
- Run the **voice check** against `research/voice.md`; ordinary voice/style flags are
  questions/advisory and never replace the critic's scope judgment.
- Run the **bilingual parity check** (§6) by Claim Ledger ID. Different section order,
  headings, paragraphing, claim order, or length are not parity errors.
- Run the **ownership check** (§10). Any `Model-hypothesis` stated as author belief without
  adoption gets recast/removed and quarantined. If that changes semantic scope, require a
  fresh critic pass.
- If the PR has been open **> 7 days**, cut it down to the strongest single-idea Note,
  then send that revised semantic draft through the critic again.
- If open **> 14 days**, close it and log the kill. Killed is a valid outcome; zombie is
  not.

When all checks pass, the gate posts `Ready to ship` (or `Ready — queued` under cadence)
plus a phone-sized summary. It does **not** repeat the editorial critic's analysis. The
author's recurring obligations remain the Tuesday braindump and Friday five-minute
approval.

### 4.5 Monthly — Gardener (`automations/05-gardener.md`)

First of the month:

- **Throughput report** (committed to `research/retro/YYYY-MM.md` and sent as a
  notification): published per tier per language, median days from draft to publish,
  items expired/killed, % of published pieces originating from author sparks or interview
  answers vs. pure scout finds.
- **Editorial-critic calibration**: initial/final `KEEP/CUT/DOWNGRADE/SPLIT/SKIP` mix,
  author reversals, late `too generic / need real examples / make it a note` rescues after
  critic `KEEP`, stale critic passes caught by the ship gate, and pure framework
  applications redirected to application Notes/Trackers/skips. These are calibration
  signals, not quotas to optimize.
- **Archive mining**: re-read published posts, find predictions now testable and events
  that confirm/contradict published theses → propose Tracker candidates.
- **Voiceprint maintenance**: propose 1–3 additions to `research/voice.md` from the
  month's interview answers, published pieces, A/B choices, and read-aloud marks.
- **Hygiene**: glossary consistency, dead links, backlog pruning, and malformed/duplicate
  editorial-critic contract checks.

## 5. Definitions of done

A piece ships when its tier checklist passes **and** the current semantic draft has an
applicable editorial-critic `KEEP` — not when it feels finished.

**Note**
- [ ] One arguable claim a reader could repeat in one sentence.
- [ ] One concrete example or mechanism (not just assertion).
- [ ] One acknowledged counterpoint, even if only a sentence.
- [ ] Plain language: no jargon or clever coinage a smart non-specialist couldn't follow, and no wording that sounds smart but adds no meaning. Deliberately reused keywords and glossary terms are the only exceptions, and they're defined on first use.
- [ ] Readable sentences: no long, dense, multi-clause run-ons; one idea per sentence by default, and stacked clauses, parentheticals, or statistics are split into their own sentences.
- [ ] Human voice: the pre-publish human pass (`research/human-voice.md` §4) ran on both language versions — talk test, contractions in English, rationed pivots/aphorisms, varied paragraph rhythm, no reused opening/closing frames, 中文版不是英文的对齐翻译. The countable half of that pass is enforced by `scripts/content-gate.mjs` (§5 of the same file); its style warnings are advisory, but an unaddressed one needs a reason in the PR body.
- [ ] Both language versions present and **claim-equivalent by the shared Claim Ledger IDs**; same section order, headings, paragraphing, claim order, or length are not required.
- [ ] Claim ledger present (§10); no unadopted `Model-hypothesis` stated as the author's
      first-person belief; no mental-history claim ("I used to think…") without a traceable
      source.
- [ ] Applicable editorial-critic verdict is `KEEP` for the current semantic draft.
- [ ] Build passes.

**Essay** — all of the above, plus:
- [ ] Opens with the tension; thesis stated in the first two paragraphs.
- [ ] Factual claims that depend on current events have linked sources, re-validated at draft time.
- [ ] The strongest live counterargument/boundary is engaged when one exists, not manufactured as a slot.
- [ ] Speculation is labeled as speculation.

**Tracker** — scores the original prediction honestly (right / wrong / too early), links the
original post, and states what was learned. Both languages. That's the whole bar.

The material/form addendum is normative where the older tier wording differs: Note
counterpoints are conditional, Essay predictions are opportunistic, and historic length
bands are ceilings/descriptions rather than minimums.

Explicitly **not** on any checklist: "the author has reread it five times," "every
paragraph is polished," "covers all angles." If a checklist passes and the author still
hesitates, the maturity field goes to `seedling` and it ships anyway — that's the deal.

## 6. Bilingual design (中英双语)

### Editorial contract

Every published piece has an English and a Chinese version, written as
**transcreation, not literal translation**. The shared source of truth is the Claim
Ledger, not mirrored article architecture.

- **Identical in meaning**: thesis, required claim set, factual claims, numbers/dates,
  source support, stance/uncertainty, and maturity/public meaning.
- **Independent by language**: claim order, section structure/order, headings and number
  of headings, paragraph boundaries, rhetorical entry/close, connective scaffolding,
  and length. One language may merge sections the other splits, move context later, or
  omit a heading the other needs.
- **No hard length ratio**: a natural Chinese version may be materially shorter than the
  English one because it needs fewer connective phrases, less repeated setup, or fewer
  headings. Claim coverage, not word-count parity, is the test.
- **Glossary-governed**: recurring terms (e.g., "agent" → 智能体, "forward-deployed
  engineer", "reward hacking") use the renderings in `research/glossary.md` so the site
  reads consistently over time. The drafter appends newly-decided terms each run.

### Shared package, independent composition

Before either language becomes prose, freeze one shared package:

- Author Kernel (§10)
- Claim Ledger (§10), with stable `C1`, `C2`, … IDs and required-language status
- source links and factual support
- source-confidence/domain-limit information from the interview material
- glossary decisions
- Material Audit when that stage exists for the piece

Draft first in whichever language the author's source material leans toward. Then draft
the second language **clean-room style from that shared package**, not from the first
article's sentence order, section order, or headings. Close/hide the first-language prose
while composing the second; reopen it only after both drafts exist for parity checking.

This is not a quota for difference. If both languages independently arrive at the same
shape, keep it. But matching structure is never required for parity, and suspicious 1:1
heading/paragraph/claim alignment is an advisory translation-shape smell worth checking.

### Claim-level parity

Every load-bearing semantic claim has one stable Claim Ledger ID. Parity means:

- every claim marked `Required in: EN + ZH` appears in both versions;
- every number/date is consistent;
- each source supports the same factual claim;
- causal direction does not flip;
- stance and uncertainty are equivalent;
- a `Model-hypothesis` does not silently become adopted in one language only.

Parity does **not** mean:

- claim order must match;
- section headings must correspond 1:1;
- paragraph boundaries must match;
- the counterargument must appear in the same location;
- both files need the same opening or closing device;
- both files need the same length.

The drafter records the audit in the PR body:

```md
## Bilingual parity

| ID | Claim | EN | ZH | Notes |
|---|---|---|---|---|
| C1 | <short claim> | ✅ | ✅ | zh appears before context |
| C2 | <short claim> | ✅ | ✅ | en uses a separate paragraph |
```

The ship gate spot-checks this table against the two files. A missing required claim,
changed certainty, changed number/date, changed causal direction, or source mismatch is
a parity failure. Different order/headings/paragraphing/length is not.

### Evidence-bearing vs rhetorical examples

Examples follow their role in the argument:

- If a specific company, study result, number, factual case, or firsthand event is
  evidence for a load-bearing claim, both languages carry it unless the Claim Ledger
  explicitly marks it optional/non-load-bearing.
- If an example is purely rhetorical illustration, each language may use a culturally or
  linguistically natural equivalent as long as it adds no new factual claim, changes no
  thesis, and invents no firsthand experience.

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

**This is the step that is easy to skip and impossible to notice.** Writing the prompt
files is not scheduling them. If the table below has no counterpart in your scheduler,
the pipeline is not running.

| Routine | Schedule (author's local time) | Cron (UTC) | Needs web | Needs notify | Writes |
|---|---|---|---|---|---|
| 01 Topic scout | Mon 08:00 | `0 0 * * 1` | yes | no | commit to `main` |
| 02 Interview brief | Tue 08:00 | `0 0 * * 2` | light | **yes** | commit to `main` |
| 03 Drafter | Thu 08:00 | `0 0 * * 4` | yes | no | PR |
| 03b Editorial critic | Thu 16:00 | `0 8 * * 4` | as needed | no | PR critic comment / narrow subtractive edit |
| 04 Ship gate | Fri 08:00 | `0 0 * * 5` | no | **yes** | PR comments / edits |
| 05 Gardener | 1st of month 09:00 | `0 1 1 * *` | light | yes | commit + notification |

The cron column assumes the author's `Asia/Shanghai` (UTC+8), where 08:00 local is 00:00
UTC on the *same* day. Recompute both columns if the author's timezone changes.

Point each routine at the prompt file rather than pasting its text, so edits to
`automations/**` take effect without touching the scheduler. For example:

> Work in the `Akkkkkkki/q-notes` repository. Read `AGENTS.md`, `docs/pipeline.md`, and
> `automations/03-drafter.md`, then carry out that routine exactly as written for today's
> date. Never end the run silently — if no artifact is possible, commit the run report the
> prompt requires.

Use the same pattern for 03b, pointing it to `automations/03b-editorial-critic.md` and
`docs/editorial-critic.md`.

Each firing should start a **fresh session**: the prompts are standalone and a routine that
accumulates conversation history will drift. Create exactly one routine per stage and list
your scheduler's routines afterwards to confirm.

**Check the first real firing of each routine.** Scheduled sessions may start with narrower
tool permissions. Routines 03, 03b, and 04 need repository + PR access; 03 and 03b may
need web access for current evidence/archive comparison. A run that reports it could not
comment or edit is not a silent success.

Connector requirements: GitHub (all), web search/browse (scout, drafter, editorial critic
when source/archive validation requires it), one notification channel the author actually
checks for interviewer, ship gate, and gardener. A calendar connector for a weekly author
hour is optional.

Start order: enable 01 + 02 first week; add 03 + 03b + 04 the second week once one
interview has answers; add 05 after the first month. The old `.codex` routines are retired
(see `.codex/automations/RETIRED.md`); unschedule them so only the canonical 01, 02, 03,
03b, 04, and 05 routines run.

### Hard gate: Content gate CI

The editorial critic and ship gate are prompt-based reviews, so CI remains the mechanical
gate that cannot be skipped. `.github/workflows/content-gate.yml` runs
`scripts/content-gate.mjs` (tier tag, bilingual pair/orphaning, source-link requirements,
plus advisory word-count/em-dash/run-on warnings) and a full `npm run build` on every PR.
Make it a **required status check** in branch protection on `main`.

The workflow runs on every PR with no `paths` filter; the content gate vets only posts a
PR changes, so non-content PRs pass cheaply and legacy posts are not re-litigated.

CI does not replace the model-based 03b critic. Conversely, the critic must not report
build/parity/mechanical failures as its blocking reasoning failures.

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
| Model-hypothesis accidentally presented as Q position | 0 |
| Stale critic KEEP allowed through semantic change | 0 |

Critic verdict mix is **not** a target. Track `KEEP/CUT/DOWNGRADE/SPLIT/SKIP`, author
reversals, and late author `too generic / need real examples / make it a note` feedback to
calibrate whether the critic is useful. Do not optimize for more warnings or shorter work.

The author-input metric is what distinguishes this site from an aggregation feed. If it
drops, the fix is more interviewing and archive mining, not more scouting.

The drafter-run metric has a live counterpart because a monthly report is too slow to
catch a stopped scheduler: the Flow surface raises a `now` item when a brief marked
`Ready to draft` has sat through a Thursday drafter slot with nothing on the Desk. If it
appears, check the scheduler against §8 before debugging content.

## 10. Thought ownership

The style work in §5–6 and `research/human-voice.md` keeps the *prose* from reading as
machine-written. It does nothing to stop a subtler failure: the prose reads as the author,
but the *thinking* was silently completed by the model. A nearby published position gets
treated as license to construct a new one; a model-built hypothesis gets written as an
unqualified first-person belief; the model invents an intellectual autobiography — "I used
to think X, then I came to believe Y" — that the author never supplied. None of that trips
the never-list or the "never invent a scene" rule, because it isn't a fabricated scene. It's
fabricated authorship.

> The model may make the writing clearer. It must not make the author's thinking more
> complete than the author has earned.
> 允许 AI 帮忙把想法写清楚，不允许它替作者把没想完的地方想完。

This section governs the drafter (§4.3), editorial critic (§4.3b), ship gate (§4.4), and
gardener (§4.5).

### The Author Kernel

Before drafting, the drafter builds a small, deliberately unpolished internal Kernel from
author-owned material only: interview answers, `research/inbox.md` sparks, author PR/Desk
comments (`One change`, A/B choices, read-aloud marks), adopted entries in
`research/positions.md`, and explicitly promoted `research/voice.md ## Stances`. Research
sources may support a fact in the Kernel; they never enter `Explicit positions`. Under the
strict-v1 #98/#97 containment rule, published article bodies are history/context only and
do not enter `Explicit positions` by themselves.

The model does not smooth the Kernel into a cleaner argument — "I don't know," "I only
have a hunch," and an unanswered question are first-class content, not gaps to repair.
The Kernel is the draft's scope boundary: an epistemic boundary narrows what the piece
attempts; it is not satisfied by adding a disclaimer and writing past it.

```md
## Author Kernel

### Explicit positions
-

### Concrete material
-

### Epistemic boundaries
-

### Unresolved doubts
-

### Characteristic wording worth preserving
- "..."
```

### The claim ledger — four ownership classes

Every load-bearing semantic claim in a draft carries one stable ID (`C1`, `C2`, …) and
one ownership class in the PR body's `## Claim ledger` section. The ID belongs to the
claim, not a paragraph or language, so it remains the same when en and zh put the claim
in different places. Each entry also records where it is required:

```md
## Claim ledger

C1. <claim> — Q-explicit (interview Q1) — Required in: EN + ZH
C2. <claim> — External (<source>) — Required in: EN + ZH
C3. <rhetorical/non-load-bearing item if worth recording> — Q-derived (...) — Required in: optional
```

The four classes are:

1. **`Q-explicit`** — the author said/adopted it in current author input, an adopted
   `research/positions.md` entry, or a promoted `research/voice.md ## Stances` entry. May
   be written as a first-person author assertion.
2. **`Q-derived`** — a near inference from an explicit position that adds no new value
   judgment or causal theory. Use conservatively: if a reasonable person could accept the
   parent claim while rejecting the derived one, it is not `Q-derived`.
3. **`External`** — a factual claim or explicitly attributed outside argument, sourced.
   Stated as fact/attribution, never silently converted into the author's belief.
4. **`Model-hypothesis`** — a new mechanism, causal explanation, framework, prediction,
   coined category, cross-domain analogy, or "the real reason is…" reframe the model
   produced while researching or drafting. It must not silently become a first-person
   Q-notes position. Omit it or write it as an explicit open possibility; either way it
   gets an `Hn` entry in `## Candidate hypotheses — not yet yours` for author adoption or
   rejection.

For bilingual work, the Claim Ledger is also the **parity source of truth** (§6). A claim
marked `Required in: EN + ZH` must survive in both files with equivalent meaning,
certainty, number/date, causal direction, and source support, but it may appear in a
different section, paragraph, or rhetorical sequence.

**Published posts are context, not current-position authorization under strict-v1.** They
may supply historical continuity, self-novelty comparison, terminology, or source links
that are re-verified. A substantive premise found only in an old article body is context
or a fresh `Model-hypothesis` unless current author input, `positions.md`, or a promoted
Stance independently authorizes it.

### No fabricated intellectual autobiography

"I used to think…", "I've come to think…", "I changed my mind…", "what convinced me
was…", "the correction came when…", "I was wrong because…" are factual claims about the
author's mental history, not style choices. They are allowed only when source material
actually contains that change-of-mind story. They are never narrative glue for a
model-built argument.

### Adoption protocol (v1: PR-comment text, no UI)

The draft must read correctly with every unadopted candidate hypothesis absent. The
author replies on the PR:

```md
**Adopt hypothesis — H1**
```

or

```md
**Reject hypothesis — H1**
```

The ship gate applies the decision before its next verdict (§4.4). An adopted hypothesis
is committed to `research/positions.md` **directly on `main`**, so it survives the PR's
later fate. If the draft carries a hedged version, promote it to a plain author assertion
in both languages; if fully quarantined, add the adopted assertion at the natural point in
each language independently. A rejected hypothesis is stripped and recorded nowhere.

Because adoption can change semantic scope, the ship gate then evaluates whether a fresh
editorial-critic pass is required before Ready. Adopted positions become valid
`Q-explicit` material for future drafts and, once actually taken in public, candidates for
the gardener to propose into `research/voice.md ## Stances`. `voice.md` remains how Q
sounds; `positions.md` is what Q has adopted.

### Worked fixtures

**PR #62 shape.** Input: firsthand software experience, a strong line about verification
theater, an explicit "I don't know hardware" boundary. Expected ownership: researched EDA
facts are `External`; coined `consequence gate` and accountability-as-root-cause are
`Model-hypothesis` unless adopted. Expected critic: `DOWNGRADE` or aggressive `CUT`, not a
fully completed cross-domain theory.

**PR #64 shape.** Input: an existing taste/judgment distinction and outside decisiveness
argument. Expected ownership: pricing-as-root-cause and a 2028 personal-comp falsifier are
`Model-hypothesis` until adopted. Expected critic: keep the earned distinction; cut/split
the speculative pricing/compensation third act unless separately earned.

**Real-correction case.** Input explicitly says "I think I got my earlier definition
wrong." Expected: change-of-mind language is `Q-explicit` and allowed. The editorial
critic counts a genuine correction/deepening as self-novelty rather than punishing reuse
of the old terminology.