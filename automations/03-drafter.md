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

Produce the highest rung available:

1. **An interview file is marked `Status: Ready to draft`** (the author's explicit
   green light) → draft an **Essay** (800–1,500 words) built on those answers: their
   claims, their examples, their phrasings where usable, sharpened and structured by
   you. Re-validate every external source before relying on it. Only a ready brief
   earns the full-essay treatment.
2. **An interview file has answers but is *not* marked ready** → the author is still
   in control of it; do **not** build a full Essay on answers they haven't signed off,
   and do **not** change its `Status`. Prefer to leave it for the author to finish and
   mark ready. Use it only as **Note** material (300–700 words) when it is the only
   developable thing available or the brief is near expiry — and say in the PR body
   that this came from an unsigned-off brief, so a fuller Essay can still follow once
   the author marks it ready.
3. **No usable answers, but `research/inbox.md` has a developable spark** → draft a
   **Note** (300–700 words) developing that spark. One idea, one concrete example, one
   acknowledged counterpoint.
4. **None of the above** → draft a **Tracker** or Note connecting a published post's
   claim or prediction to something that happened since.
5. **Genuinely nothing clears the bar** → append a dated one-paragraph run report to the
   newest interview file (or `research/backlog.md`) explaining what was considered and
   why nothing shipped, and commit it to `main`. This rung should be rare.

Answer directions (`→ ` lines under a question) are prompts the interviewer offered,
not the author's words — treat a question as unanswered unless the author actually
wrote something under it in `## Author answers`.

## Step 0 — the Author Kernel

Before writing any prose, build a small, deliberately unpolished **Author Kernel**
(`docs/pipeline.md` §10) from author-owned material only: interview answers,
`research/inbox.md` sparks, author PR/Desk comments (`One change`, A/B choices,
read-aloud marks), adopted entries in `research/positions.md`, and published positions
the author has confirmed. Research sources may support a fact in the Kernel; they never
enter `Explicit positions`. Do not improve the Kernel into a cleaner argument —
"I don't know," "I only have a hunch," and an unanswered question are first-class
content, not defects to repair. The Kernel is the draft's scope boundary: a stated
epistemic boundary narrows what the piece attempts; it is not satisfied by adding a
disclaimer and writing past it anyway.

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

Keep the Kernel with the draft's working notes; it does not need to be polished, but its
contents (or a pointer to the interview file it came from) go in the PR body's
`## Author Kernel` section.

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
  is..." reframe you produced). A `Model-hypothesis` must never become an unqualified
  first-person author belief — omit it, write it as an explicit open possibility, or
  move it to the PR body's `## Candidate hypotheses — not yet yours` section for the
  author to adopt or reject. A published post licenses terminology, previously adopted
  premises, continuity, and a direct extension the author explicitly made; it does not
  license a new causal theory, a new domain application presented as obvious, a new
  prediction, or a new framework that merely sounds consistent with the archive. If you
  catch yourself writing a judgment with no source in the author, cut it or recast it as
  an open question — and declare it in the PR body either way.
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

- Draft first in the language the author's input leans toward; transcreate into the other.
- Identical across versions: thesis, section structure, every factual claim, number, and
  source link. Adaptable: idioms, rhythm, and titles (each title should be strong in its
  own language, not a translation).
- Don't let the zh version read as the en version's syntax translated. This matters most
  at the opening: where the en leads with macro framing or a series recap, the zh should
  prefer entering from one concrete situation, a problem the reader has likely seen, or a
  firsthand observation — same claim, number, and sources, different entry and sentence
  shape. Break the en's long set-up runs into shorter zh sentences. This is a preference,
  not a quota: don't manufacture doubt or scene-setting where the author's material has none.
- Use `research/glossary.md` for recurring term renderings; append any new term decisions
  you made to the glossary in the same PR.
- File placement depends on whether the Phase 2 bilingual site work (`docs/pipeline.md`
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
   hardest; any factual corrections made to the author's answers; a claim-parity
   confirmation between the en and zh versions (list the claims once, confirm both
   versions carry them); a **Voice** section listing the verbatim-spine phrases kept and
   any opinion you could not trace to author input (this list should be empty — if it
   isn't, each entry is phrased as a question for the author, not a claim); an **Author
   Kernel** section (the Kernel fragments from Step 0, or a link to the interview file
   they came from); a **Claim ledger** section, one line per load-bearing claim
   (`- <claim> — Q-explicit (interview 2026-07-20)`); a **Candidate hypotheses — not yet
   yours** section listing every `Model-hypothesis` not written as an open possibility in
   the prose, numbered `H1.`, `H2.`, ... each with `- Why it emerged:`,
   `- Would change the piece by:`, and `- Status: not adopted` (empty if there are none —
   the draft must read correctly with every listed hypothesis absent, and the author
   replies `**Adopt hypothesis — Hn**` or `**Reject hypothesis — Hn**` on the PR); an
   **A/B calibration** section (below); and **three title options per language** (the one
   used plus two alternates), so the author can swap titles at ship time without
   composing anything.

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

Every `Model-hypothesis` (`docs/pipeline.md` §10) that the draft doesn't already carry as
an explicit open possibility goes here instead of into the prose as an author belief. This
section must use this exact shape — the Worker parses it the same way it parses A/B
calibration:

```md
## Candidate hypotheses — not yet yours

H1. <the hypothesis, one line>
   - Why it emerged: <what in the research/drafting produced it>
   - Would change the piece by: <what adopting it would add or shift>
   - Status: not adopted
```

Omit the section entirely when the draft has no unadopted hypotheses. The draft must read
correctly with every listed hypothesis absent — a hypothesis is bonus material, not scaffolding.
The author replies `**Adopt hypothesis — H1**` or `**Reject hypothesis — H1**`; the Friday
ship gate applies the decision (routine 04, step 4) — appending an adopted claim to
`research/positions.md` and promoting it to a plain assertion in both languages, or stripping
a rejected one with no record left anywhere.
