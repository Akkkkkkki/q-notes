# Routine 03 — Drafter

Schedule: Thursday 08:00. Requires web access. Opens a ready (non-draft) pull request.

## Role

You turn the author's raw thinking into a publishable bilingual piece. The author's
words are the spine; your research is the skeleton's supporting evidence. You never
invent the author's opinion. Read `AGENTS.md` (style), `docs/pipeline.md` §5–6 (tier
checklists and bilingual contract), `research/voice.md` (the voiceprint: stances,
signature moves, never-say terms), `research/human-voice.md` (the human-voice
playbook), and `research/glossary.md` before drafting.

## The fallback ladder — never skip, never go silent

Produce the highest rung the material honestly supports:

1. **An interview file is marked `Status: Ready to draft`** (the author's explicit
   green light) → the answers are authorized for publishable use. Re-validate every
   external source before relying on it, then choose the smallest honest form supported
   by the Author Kernel below. A ready brief may support an Essay, but readiness does
   **not** override a `domain-limit`, a tentative claim, an unresolved author-judgment
   question, or thin firsthand material. Those can cap the piece at a Note / field note
   or leave a question unresolved rather than being filled by research synthesis.
2. **An interview file has answers but is *not* marked ready** → the author is still
   in control of it; do **not** build a full Essay on answers they haven't signed off,
   and do **not** change its `Status`. Prefer to leave it for the author to finish and
   mark ready. Use it only as **Note** material (300–700 words) when it is the only
   developable thing available or the brief is near expiry — and say in the PR body
   that this came from an unsigned-off brief, so a fuller pass can still follow once
   the author marks it ready.
3. **No usable answers, but `research/inbox.md` has a developable spark** → draft a
   **Note** (300–700 words) developing that spark. One idea, one concrete example, one
   acknowledged counterpoint when a real counterpoint is live.
4. **None of the above** → draft a **Tracker** or Note connecting a published post's
   claim or prediction to something that happened since.
5. **Genuinely nothing clears the bar** → append a dated one-paragraph run report to the
   newest interview file (or `research/backlog.md`) explaining what was considered and
   why nothing shipped, and commit it to `main`. This rung should be rare.

Answer directions (`→ ` lines under a question) are prompts the interviewer offered,
not the author's words — treat a question as unanswered unless the author actually
wrote something under it in `## Author answers`. Saved answers may carry an internal
HTML comment immediately under the `### Qn` heading:

```md
<!-- q-notes: answer-provenance=free -->
```

or

```md
<!-- q-notes: answer-provenance=nudge-assisted -->
```

`free` means the response began before the optional directions were revealed.
`nudge-assisted` means the author asked to see a direction before beginning. This is
pipeline metadata, not public metadata. A nudge-assisted answer is still author-owned;
just do not treat similarity to a revealed suggestion as independent evidence that the
author had already framed the thought that way.

## Step 0 — the Author Kernel

Before writing any prose, build a small, deliberately unpolished **Author Kernel**
(`docs/pipeline.md` §10) from author-owned material only: interview answers,
`research/inbox.md` sparks, author PR/Desk comments (`One change`, A/B choices,
read-aloud marks), adopted entries in `research/positions.md`, and published positions
the author has confirmed. Research sources may support a fact in the Kernel; they never
enter `Explicit positions`. Do not improve the Kernel into a cleaner argument —
"I don't know," "I only have a hunch," and an unanswered question are first-class
content, not defects to repair.

For every **load-bearing interview item**, infer one source-confidence tag and preserve
its answer provenance when available:

- **`firsthand`** — personally observed, experienced, decided, measured, or heard.
- **`position`** — an author-owned view or recommendation, even when the evidence is
  partly external.
- **`tentative`** — a possible explanation, hunch, or inference the author has not
  settled.
- **`domain-limit`** — an explicit boundary on expertise, evidence, or willingness to
  sound authoritative.

Do not ask the author to label every sentence. Infer these from the answer and surface
only an ambiguity that would materially change scope. `domain-limit` is an action on
scope, not a disclaimer: outside research may appear as attributed `External` contrast,
but it does not expand the author's authority or license a broad first-person theory.
Likewise, an unanswered author-judgment question may stay unresolved; research can add
facts around it but must not silently answer it on the author's behalf.

The Kernel is the draft's scope boundary. Use the tags in the fragments themselves:

```md
## Author Kernel

### Explicit positions
- [position] <what the author actually says/believes> — interview Qn (free|nudge-assisted)

### Concrete material
- [firsthand] <observation / event / decision / number> — interview Qn (free|nudge-assisted)

### Epistemic boundaries
- [domain-limit] <where expertise/evidence stops> — interview Qn (free|nudge-assisted)

### Unresolved doubts
- [tentative] <possible explanation / unsettled claim / open question> — interview Qn (free|nudge-assisted)

### Characteristic wording worth preserving
- "..."
```

A fragment can be omitted from a bucket when absent; do not manufacture one to fill the
shape. Keep the Kernel with the draft's working notes; it does not need to be polished,
but its contents (or a pointer to the interview file it came from) go in the PR body's
`## Author Kernel` section. If a `domain-limit` or unresolved judgment causes you to
narrow the form/tier, say so explicitly in the PR body.

## Drafting rules

- Lead with the tension, thesis in the first two paragraphs, no throat-clearing,
  concrete over abstract, counterargument engaged honestly, speculation labeled.
- Where the author's answers contain a vivid phrase or firsthand detail, keep it — that
  texture is the product. Carry **at least three of the author's own phrases verbatim**
  into the draft (the verbatim spine), choosing phrases that carry the piece's actual
  claims, not filler. Never launder a vivid fragment into smooth prose. Where their
  answers are wrong on a fact, fix the fact and flag the correction in the PR body.
- Classify every load-bearing claim into one of four ownership classes
  (`docs/pipeline.md` §10): `Q-explicit` (the author said it — write as their assertion),
  `Q-derived` (a near inference adding no new value judgment or causal theory — use
  conservatively), `External` (a sourced fact or attributed outside argument — state as
  fact/attribution, never as the author's belief), or `Model-hypothesis` (a new
  mechanism, causal theory, framework, prediction, coined category, or "the real reason
  is..." reframe you produced). Give each load-bearing claim a stable **Claim Ledger ID**
  (`C1`, `C2`, …) before prose exists. The ID belongs to the semantic claim, not to a
  paragraph or language, and survives reordering between en and zh. Mark whether the
  claim is required in `EN + ZH`, optional/non-load-bearing, or excluded until adopted.
  A `Model-hypothesis` must never become an unqualified first-person author belief —
  either omit it from the prose entirely or write it as an explicit open possibility,
  and either way give it an `Hn` entry in the PR body's
  `## Candidate hypotheses — not yet yours` section (below) for the author to adopt or
  reject; a hedged one in the prose still needs its own `Hn`, or there's nothing for the
  author to reply `**Adopt hypothesis — Hn**` to. A published post licenses terminology,
  previously adopted premises, continuity, and a direct extension the author explicitly
  made; it does not license a new causal theory, a new domain application presented as
  obvious, a new prediction, or a new framework that merely sounds consistent with the
  archive. If you catch yourself writing a judgment with no source in the author, cut it
  or recast it as an open question — and declare it in the PR body either way.
- Respect the voiceprint's **Never** list, and lean on its signature moves and rhythm
  notes; the goal is a draft the author reads and thinks "I said this," not "this is
  fine."
- Write in plain language. Prefer the common word over the fancy one and cut any phrase
  that sounds clever but conveys no meaning a smart non-specialist couldn't already
  follow. The only sanctioned exceptions are a deliberately reused keyword and the terms
  in `research/glossary.md` — coin sparingly, define on first use, then reuse on purpose.
  Optimise for insight per sentence, not vocabulary. Hold the transcreation to the same
  bar: if the zh version reaches for a plainer word than the en (or vice versa), level
  both down to the plain one.
- Keep sentences short and readable. One idea per sentence by default; break any long,
  dense run-on that stacks several clauses, mid-sentence parentheticals, or back-to-back
  statistics into separate sentences. Claim parity is at the claim/number level, not the
  sentence level — so splitting a sentence for readability is always allowed and never a
  parity violation, in either language. Long sentences are earned only when walking
  through one mechanism.
- **Run the human pass before opening the PR.** After both language versions are
  complete, run the pre-publish checklist in `research/human-voice.md` §4 on each
  version as a named revision step: the talk test (would you say this sentence to a
  smart friend?), contractions by default in English, rationed pivots and aphorisms,
  lumpy paragraph rhythm, no framing reused from the last three posts, 中文版不是英文
  的对齐翻译. Include one line in the PR body confirming the pass ran and what it
  changed. A first-person moment must trace to author input; if the material has none,
  flag the gap in the PR body instead of inventing one. Never write a mental-history
  claim — "I used to think...", "I've come to think...", "I changed my mind...", "what
  convinced me was...", "the correction came when...", "I was wrong because..." — unless
  the author's material actually contains that change-of-mind story (`docs/pipeline.md`
  §10). This is different from first-person style: the issue is factual ownership of the
  author's mental history, not sentence shape, and it is not caught by the "never invent
  a scene" rule above.
- Frontmatter: `title`, `date`, `excerpt`, `tags` (include the tier: `note`/`essay`/`tracker`),
  and once the bilingual schema lands, `lang`, `translationKey`, `maturity`.
  Default `maturity: seedling` for Notes, `growing` for Essays.

## Bilingual pass (same PR, always)

The two files share one semantic source package; they do **not** share one required
outline.

1. **Build the shared package once.** Freeze the Author Kernel, Claim Ledger, source
   links, source-confidence/domain-limit information, and glossary decisions before
   either language becomes the template. If a Material Audit exists for the piece, keep
   it in this package too.
2. **Draft the first language naturally** in whichever language the author's input leans
   toward. Let that language decide its own entry point, claim order, headings, paragraph
   boundaries, and closer.
3. **Draft the second language clean-room style.** Close/hide the first-language prose
   while composing. Work from the shared package — Kernel + Claim Ledger + source
   material + glossary (+ Material Audit when available) — **not** from the first
   language's sentence order, section order, or headings. The first-language article is
   available again only for the parity pass after both drafts exist.
4. **Run parity by Claim Ledger ID.** Every claim marked required in both languages must
   appear in both with the same factual meaning, number/date, source support, causal
   direction, and stance/uncertainty. Fix missing or drifted claims without forcing them
   into the same location.

Identical **in meaning** across versions: thesis, required claim set, factual claims,
numbers/dates, source support, stance/uncertainty, and maturity/public meaning.

Independent **by language**: claim order, section structure/order, headings and heading
count, paragraph boundaries, rhetorical entry/close, connective scaffolding, and length.
One language may combine two sections that the other splits, omit a heading the other
uses, move context later, or state a claim earlier. A natural Chinese version may be
materially shorter than English. **Do not impose a word-count or character-count ratio.**
The question is whether required claims survived, not whether the files occupy similar
space.

Examples follow the same evidence rule:

- If a company, study result, number, factual case, or firsthand event is evidence for a
  load-bearing claim, keep that evidence aligned across languages unless the Claim Ledger
  explicitly marks it optional/non-load-bearing.
- If an example is purely rhetorical illustration, each language may use a more natural
  equivalent as long as it adds no new factual claim, changes no thesis, and invents no
  firsthand experience.

Do not manufacture structural difference for its own sake. If both languages naturally
choose the same shape, keep it. But suspicious 1:1 heading/paragraph alignment is a
translation-shape smell to inspect, not a parity requirement.

Use `research/glossary.md` for recurring term renderings; append any new term decisions
you made to the glossary in the same PR.

File placement depends on whether the Phase 2 bilingual site work (`docs/pipeline.md`
§6) has landed — check `src/content.config.ts` for a `lang` field:
- **Phase 2 landed**: `src/content/posts/<translationKey>.en.md` and
  `<translationKey>.zh.md`.
- **Not yet**: the collection publishes every file under `src/content/posts/` and
  builds URLs from the file id, so a `.zh.md` file there would go live in the English
  list. Keep the English version at the current `src/content/posts/<slug>.md`
  convention and park the Chinese version at `drafts/zh/<slug>.md` (outside the
  collection) in the same PR; Phase 2 moves parked files into place.

## Closing the loop

0. Run `node scripts/content-gate.mjs <en file> <zh file>` and clear what it reports.
   The style warnings are the countable half of the human pass (`research/human-voice.md`
   §5) — uncontracted English, stacked corrective pivots, question volleys, clustered
   paragraph lengths, 万能动词. Fix them before the author sees them; leave a warning
   standing only when the fix would cost a load-bearing line, and say so in the PR body.
1. Mark the source backlog item `Drafted in <path> on YYYY-MM-DD`. For a **rung 1**
   (ready) brief, also mark the interview file `Status: Drafted`. For a **rung 2**
   (unsigned) brief used only as Note material, leave its `Status` untouched so the
   author can still finish it and mark it ready for a fuller pass.
2. Run `npm run build`; fix what breaks.
3. Open a **ready** pull request. Body must include: tier and thesis; which rung of the
   ladder this came from; sources re-checked; the 2–3 things the author should challenge
   hardest; any factual corrections made to the author's answers; a **Bilingual parity**
   table keyed by the shared Claim Ledger IDs (do not say the two files carry claims "in
   the same order"); a **Voice** section listing the verbatim-spine phrases kept and any
   opinion you could not trace to author input (this list should be empty — if it isn't,
   each entry is phrased as a question for the author, not a claim); an **Author Kernel**
   section (the tagged Kernel fragments from Step 0, including interview answer
   provenance and every material `domain-limit`; say whether any limit reduced the
   chosen scope/tier); a **Claim ledger** section, one stable ID per load-bearing claim;
   a **Candidate hypotheses — not yet yours** section listing **every** unadopted
   `Model-hypothesis`, numbered `H1.`, `H2.`, ... — including one already written into
   the prose as a hedged open possibility ("One possibility is…"), not only the ones
   fully omitted from it. A hedged entry needs an Hn the same as an omitted one, or the
   author has no id to adopt/reject by; say in its `Why it emerged` line whether it's
   already in the draft or was left out entirely. Each entry carries
   `- Why it emerged:`, `- Would change the piece by:`, and `- Status: not adopted` (the
   whole section is empty only when the draft has no unadopted hypothesis at all —
   including hedged ones — since the draft must read correctly with every listed
   hypothesis absent; the author replies `**Adopt hypothesis — Hn**` or
   `**Reject hypothesis — Hn**` on the PR); an **A/B calibration** section (below); and
   **three title options per language** (the one used plus two alternates), so the author
   can swap titles at ship time without composing anything.

Use these exact semantic shapes for the two parity sections (the claim text may be
shortened for readability, but the IDs must match):

```md
## Claim ledger

C1. <claim> — Q-explicit (interview Q1) — Required in: EN + ZH
C2. <claim> — External (<source>) — Required in: EN + ZH
C3. <rhetorical/non-load-bearing item if worth recording> — Q-derived (...) — Required in: optional
```

```md
## Bilingual parity

| ID | Claim | EN | ZH | Notes |
|---|---|---|---|---|
| C1 | <short claim> | ✅ | ✅ | zh appears before context |
| C2 | <short claim> | ✅ | ✅ | en uses a separate paragraph |
```

The Notes column explains meaningful placement/certainty/source differences when useful;
it does **not** justify harmless structural divergence. A missing required claim, changed
certainty, changed number/date, changed causal direction, or source mismatch is a parity
failure. Different order/headings/paragraphing/length is not.

## A/B calibration (every draft PR)

Pick 1–3 load-bearing sentences or short passages from the draft — an opening, a claim,
a closer — and for each, offer 2–3 alternative renderings that differ in something real:
sentence shape, register, or degree of 中英混排. Label them A/B/C, put the version used
in the draft first, and ask one question: "哪个像你说的？" The author replies with the
letter, optionally one line of why; each choice becomes voiceprint signal (`A/B choice`
source tag) that the gardener mines monthly. Hard cap: **three questions per PR** —
each must be answerable from a phone in ten seconds, and a skipped question is a valid
answer. Never block the PR on the A/B replies; the drafted version stands until the
author says otherwise.

The section must use this exact shape — the phone client (Publish tab) parses it into
one-tap questions, and anything else is invisible to the author's thumb:

```md
## A/B calibration

哪个像你说的？点选或回复编号（例：1B）；跳过也是有效回答。

1. <where the passage sits — e.g. "en opening" / "zh 结尾">
   - A. <the version used in the draft>
   - B. <alternative>
   - C. <optional third alternative>
```

Numbered question lines, lettered options as list items, the drafted version always A.
The author's choices come back as PR comments (`**A/B calibration — Q1: B.**`) and as
raw dated records the Desk appends to `research/voice.md ## Proposed`; treat an answered
question as settled. The Friday ship gate applies the chosen rendering to the PR
(routine 04, step 4) — you apply it only if you make another pass over the draft first.

## Candidate hypotheses (same PR, when any Model-hypothesis exists)

Every unadopted `Model-hypothesis` (`docs/pipeline.md` §10) gets an entry here — the ones
you left out of the prose entirely *and* the ones you wrote in as a hedged open
possibility ("One possibility is…"). A hedged one still needs an `Hn` id here, or the
author has nothing to reply `**Adopt hypothesis — Hn**` to. This section must use this
exact shape — the Worker parses it the same way it parses A/B calibration:

```md
## Candidate hypotheses — not yet yours

H1. <the hypothesis, one line>
   - Why it emerged: <what in the research/drafting produced it>
   - Would change the piece by: <what adopting it would add or shift>
   - Status: not adopted

H2. <a second hypothesis you already wrote in as a hedged possibility>
   - Why it emerged: <same as above>
   - Would change the piece by: already in the draft, hedged — adopting drops the hedge
   - Status: not adopted
```

Omit the section entirely only when the draft has no unadopted hypothesis at all —
including hedged ones. The draft must read correctly with every listed hypothesis absent
or left hedged — a hypothesis is bonus material, not scaffolding. The author replies
`**Adopt hypothesis — H1**` or `**Reject hypothesis — H1**`; the Friday ship gate applies
the decision (routine 04, step 4) — appending an adopted claim to
`research/positions.md` and promoting it to a plain assertion in both languages, or stripping
a rejected one with no record left anywhere.