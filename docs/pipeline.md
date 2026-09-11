# q-notes Editorial Pipeline

An author-led process for a personal bilingual publication. Capture material, choose
whether to develop it, write or request targeted help, review meaning, edit style,
preview both languages, then explicitly publish. A private fragment, open question,
or no draft is a normal successful outcome.

This is the source of truth for `automations/`. `docs/material-form.md` owns material fit;
`docs/editorial-critic.md` owns the one independent scope review. Read them together with
`AGENTS.md`. No new mandatory rule document or runtime is required.

> 中文版：[`docs/pipeline.zh.md`](./pipeline.zh.md)（如有冲突以本文为准）。

## 1. Why the process changed

The previous weekly production loop allowed unsigned answers to become Notes near
expiry, drafted from sparks or archive posts without new intent, and used age to force
scope changes. Those rules are removed. They made saving a thought feel like agreeing
to publish it and encouraged completion beyond the available material.

## 2. Design principles

- The author can write directly, paste a complete draft, ask for help, or stop.
- Saving material does not authorize drafting. Find explicit intent tied to selected
  material or a current, unconsumed author-marked `Ready to draft` brief. Check later
  withdrawal/edits and existing PRs before acting. No fallback to unsigned answers,
  inbox sparks, old posts, source expiry, or calendar slots.
- Ready to draft permits work within that scope, not a mandatory Essay or publication.
  Reuse confirmed material only within its recorded authorization.
- Keep original author input intact. Public Git, branches, and PR bodies are public;
  authentication/noindex do not make them private. Do not move private material here.
  #142 owns verification and changes to the storage boundary.
- Offer optional targeted help: Ask me a question / Challenge this / Find evidence /
  Suggest an edit. Whole-draft generation remains available on explicit request.
- Review ownership, meaning, and evidence before style. An AI suggestion cannot adopt
  itself. Preserve useful language and detail without a phrase or rhythm quota.
- Keep one compact claim/source/input/gap record and one independent critic result.
  Existing headings and Hn/Cn IDs remain for client compatibility, not separate forms
  for Q to fill in. No mandatory retell, A/B, title/last-line, or voice-mining exercises.
- Content changes use PRs. Publication requires explicit approval of the complete
  reviewed revision, including both languages, titles, excerpts, and public metadata.
  Any subsequent edit needs a new preview/approval. #141 enforces this server-side.
- No publication quota, Essay quota, age-based downgrade/closure, or seedling release
  valve. Material determines scope and length; the author determines publication.

## 3. Content tiers

| Tag | Meaning | Length guidance |
|---|---|---|
| `note` | A bounded point, personal scene/detail, observation, or useful open question | Usually at most 700 English words; no minimum |
| `essay` | Enough specific material to sustain a longer piece | Usually at most 1,500 English words; no minimum |
| `tracker` | Scores a prior falsifiable claim against new evidence | Only as long as the assessment needs |

Formats and length are not quality rankings. A 200-word observation may be complete.
Personal writing may succeed through specificity or humor without a theory. No required
objection, taxonomy, prediction, conclusion, or broad business implication.

The existing `maturity: seedling|growing|evergreen` schema remains compatible, but no
label makes unsupported claims safe or replaces author endorsement.

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

## 4. Author-led review flow

### 4.1 Optional discovery — Scout

`automations/01-topic-scout.md` may offer useful reading or questions. No minimum
candidate count, author-hook quota, or obligation to turn a recommendation into writing.
Archive posts provide history/source discovery, never current-position authorization.

### 4.2 Optional questions — Interviewer

`automations/02-interview-brief.md` starts from author-selected material. Identify what
seems interesting and the consequential gap, then ask one useful question. More questions
are optional. No interview is required for an existing draft. Unsigned answers stay
untouched, including near expiry or after every question has an answer.

### 4.3 Requested drafting — Drafter

`automations/03-drafter.md` checks explicit intent and existing work before starting.
No intent means no draft/PR, with a short run response if needed and no filler commit.

Build the Author Kernel and Claim Ledger from safe input/source references (§10), then
run Material Audit and choose the smallest honest form. Reuse claim IDs rather than
repeating source inventories. Draft each language from the shared material; check meaning
by claim, not outline. After drafting, run the natural-endpoint check. Preserve useful
late evidence or objections; remove unsupported completion rather than a fixed percentage.
Review public metadata under the same evidence/uncertainty ceiling as the body. Only then
polish style. Open a PR only when the authorized material supports one.

### 4.3b Independent scope review — Editorial critic

03b Editorial critic (`automations/03b-editorial-critic.md`) applies
`docs/editorial-critic.md`: one result, one of `KEEP | CUT | DOWNGRADE | SPLIT | SKIP`,
with strongest idea, blocking reasoning failures, required scope cuts/splits, and optional
warnings. Bind it to the full reviewed head SHA. No extra audit section per child rule.

The critic checks claim-relative evidence, inference gaps, spine, analogy/category scope,
metadata, live objections, predictions, archive provenance, and the natural endpoint.
A prevalence source may directly support prevalence, not causation. A correct citation
cannot close a missing inferential step. Restructuring stays an action under CUT/SPLIT.
A well-supported draft may KEEP intact; a personal note needs no manufactured theory.

Semantic changes require a fresh pass. Mechanical or claim-preserving style edits may
carry KEEP only after verifying no semantic change. Publication preview approval still
expires on **any** head change, even when the critic can carry forward.

### 4.4 Readiness — Ship gate

`automations/04-ship-gate.md` applies author feedback, requires an applicable critic KEEP,
checks material fit and bilingual meaning, verifies ownership/evidence and metadata,
then edits style and runs mechanical checks/build. Missing evidence or overclaimed
metadata blocks readiness; fluency cannot repair support.

Keep the exact current-head `q-notes: ship-gate` marker contract. Ready is eligibility
for author review, not permission to merge. The routine never merges. No weekly cadence,
automatic downgrade at seven days, closure at fourteen, or seedling nudge remains.

### 4.5 Optional maintenance — Gardener

`automations/05-gardener.md` checks useful upkeep and actual review failures. No output
quota, automated voice learning, or timed deletion of author material. Preserve adopted
positions, confirmed preferences, original input, paired lifecycle notices, and permalinks.

## 5. Definitions of done

A private fragment or no draft can complete an assistance request. A publishable piece
needs supported material in its chosen form, traceable ownership, appropriate uncertainty,
and the author's endorsement. Use `docs/material-form.md` for form-specific boundaries.

Before Ready, verify:

- explicit drafting intent for the selected material, with no duplicate request/PR;
- no invented firsthand story, author belief, or unsupported inference;
- title, excerpt, and public metadata stay within the body's supported claim;
- one compact review record using existing Material Audit / Form decision / Claim ledger /
  Bilingual parity headings; Hn entries only where a hypothesis is under consideration;
- independent critic KEEP applicable to the semantic draft;
- both languages preserve required claims, source support, numbers/dates, ownership,
  uncertainty, and lifecycle; structure and length may differ;
- `node scripts/content-gate.mjs <en file> <zh file>`, appropriate tests, and
  `npm run build` pass. CI is mechanical evidence, never an editorial or author approval.

Author publication approval follows preview of the complete revision. Changing a title,
excerpt, either body, or any file at the approved head requires fresh preview/approval.

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

## 7. Capturing original material

Capture English, 中文, or mixed input intact. Saving or answering does not adopt model
interpretations, request drafting, or approve publication. Keep tentative language and
unanswered questions. Existing public research stays recoverable; do not move private
material to Git without a verified boundary and explicit intent to expose it.

## 8. Execution: runtime inventory and scheduling limits

Read the current repository instructions at each run rather than a pasted prompt:

> Work in Akkkkkkki/q-notes. Read AGENTS.md, docs/pipeline.md, and the applicable current
> automations file. Check author intent and existing work. If no action is warranted,
> report that briefly in the run response; do not create a draft or commit a filler report.

| Runtime surface inspected for #147 | What exists | What this change does |
|---|---|---|
| `automations/01–05` and `03b` | Runnable editorial instructions | Replaces production clocks/fallbacks; consolidates review rules |
| `.codex/automations/RETIRED.md` | Retirement notice only | Updates guidance; does not disable an external task |
| `.github/workflows/content-gate.yml` | PR-triggered structural gate, tests, build | Preserved; no scheduled drafting job exists here |
| `wrangler.jsonc`, `worker/index.ts`, `worker/push.ts` | Tuesday/Friday payload-less notification crons | Inspected, not deployed or changed; these do not draft or merge |
| `worker/flow.ts` and Companion copy | Legacy weekly rail, unsigned-Note copy, age/stall reminders | Still present; requires follow-up alongside #146; do not interpret UI clocks as authorization |
| External agent schedulers | Live configuration not verified in this repository change | No schedule created, edited, or disabled; copied prompts may still contain old rules |

Changing prompt files does not update an external schedule or deploy code. Before a
runtime rollout, inspect actual configured tasks and replace copied production framing
with current file-loading instructions; retire old duplicate drafters. Confirm no-intent
and paused-work behavior on the first run. Do not claim that this PR proves those changes
occurred. Existing optional discovery may continue without assigning writing work.

### Hard gate: Content gate CI

`.github/workflows/content-gate.yml` runs on every PR and vets changed posts with
`scripts/content-gate.mjs`, runs tests, and builds the full site. Branch protection and
server-side merge requirements must be verified separately (#141); editing these docs
does not configure them. Mechanical checks do not replace independent editorial review.

## 9. Evaluation

Use frozen positive and negative inputs in `tests/editorial/author-led-v1.md`, plus the
historical `tests/editorial/critic-v2.md` cases with verified source packages. Record
actual outputs and findings, not AI quality scores or string-presence claims.

Check no-intent/no-material, unsigned answers near expiry, a short authorized observation,
an unsupported attractive inference, an overclaimed title/excerpt, and a supported
technical draft. Inspect the taste/map cases against original input and primary sources;
an old positive fixture label or published article never establishes Q's adoption.

Success means the author would share the final text and the intended meaning survives.
There is no monthly throughput, length, or critic-verdict quota. Full evaluation on the
three real pieces, independent review, and live runtime confirmation remain explicit
rollout work rather than being inferred from passing code tests.

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
