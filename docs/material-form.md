# Material-driven form — pipeline addendum

This document is the normative form-selection addendum for Issue #67 under the editorial-quality v2 umbrella (#70). It works **after** the Author Kernel / ownership model in `docs/pipeline.md` §10 and the source-confidence tags already used by the interviewer/drafter. It does not replace the Claim Ledger or bilingual contract.

Where this document conflicts with the older tier wording in `docs/pipeline.md` §3 or §5, **this document wins**. In particular, word bands have no minimum floor, a Note does not owe a ceremonial counterpoint, and an Essay does not owe a prediction.

## 1. Ready is authorization, not a tier

`Status: Ready to draft` means the author has authorized the supplied answers for publishable use. It does **not** mean:

- the material deserves an Essay;
- every question must be resolved;
- outside research may fill an author-judgment gap;
- the drafter should produce a complete argument arc.

A ready brief can honestly become a Note, field note, correction, question memo, application note, Essay, or no piece yet. `domain-limit`, `tentative`, unanswered author-judgment questions, and thin firsthand material remain scope boundaries.

## 2. Material Audit — before tier, form, or outline

After building the Author Kernel and Claim Ledger, but **before** choosing a public tier, internal form, headings, or outline, perform this judgment pass. This is not another inventory. It asks how much argument the existing material can honestly carry.

Use this exact PR-body shape:

```md
## Material Audit

### Author-owned specifics
- <firsthand observation / decision / concrete example / characteristic phrase>

### Research specifics
- <source, fact, mechanism, case, or contradiction that materially changes the argument>

### Open gaps
- <unanswered author judgment, domain-limit, tentative mechanism, missing reporting>

### Density judgment
- Supported by this material: <fragment | note | essay>
- Why: <2–4 sentences naming the material that earns that density and what is still missing>
```

Do not score by number of bullets. One unusually rich firsthand case can support more than six generic facts. Ten citations that all restate the same consensus still do not create an Essay.

The three density judgments mean:

- **fragment** — a sharp correction, observation, question, or application exists, but there is not yet enough owned/evidenced material to carry a standalone argued Note without synthesis padding. Keep it as a fragment/question memo, or research/interview more before polish.
- **note** — one arguable point is supported by at least one irreplaceable concrete mechanism, firsthand example, or research case. It can stand without inventing a second act.
- **essay** — several distinct, load-bearing pieces of material interact: the thesis has a mechanism, the strongest live objection or boundary can be engaged, and multiple sections would each contain evidence/experience that could not have been written before this material existed.

### The irreplaceable-material test

For every proposed major section ask:

> Could a competent model have written this section before reading the interview answers and the research used for this piece?

If yes, the section is generic scaffolding. Add a concrete case/mechanism/firsthand detail/source that changes the argument **only if that material already exists**. Otherwise cut the section. Do not manufacture material to save the outline.

Concepts, transitions, scene-setting, and generic "what this means" prose do not count as density by themselves.

## 3. Internal editorial forms

Pick the smallest form that fits the audit. These are internal reasoning scaffolds recorded in the PR body; they do not expand the public frontmatter schema beyond `note` / `essay` / `tracker`.

- **`correction`** → usually `note`. A previous belief/claim is wrong or incomplete and the material supports a precise correction. Do not invent a change-of-mind story; §10 ownership still applies.
- **`field-note`** → `note`. A firsthand observation or narrow case is the product. Keep its boundary visible rather than generalizing it into a broad theory.
- **`argument-note`** → `note`. One claim plus one mechanism/case. Engage an objection only when a strong informed reader would actually raise one.
- **`question-memo`** → usually `note` or fragment/no piece. The honest endpoint is an unresolved question. Research can map the known facts but cannot answer the author's judgment for them.
- **`application-note`** → `note`. Applies an already-owned idea to a concrete situation without pretending that the application proves a new general theory.
- **`essay`** → `essay`. Earned only when the Material Audit says `essay`.
- **Tracker** remains the public form for scoring a prior falsifiable prediction; it is not selected just because a new Essay happens to contain a prediction.

Record the choice exactly:

```md
## Form decision
- Chosen form: <correction | field-note | argument-note | question-memo | application-note | essay>
- Public tier: <note | essay | tracker>
- Strongest available material: <what actually carries the piece>
- Material deliberately not expanded: <gap/boundary/question the draft leaves alone>
```

`Ready to draft` must never appear as the reason for choosing `essay`.

## 4. Tier completion rules amended by material fit

These rules amend the old checklist wording in `docs/pipeline.md` §5.

### Note

A Note needs:

- one arguable/repeatable claim **or** one genuinely useful unresolved question;
- at least one irreplaceable concrete example, mechanism, firsthand observation, or evidence-bearing case;
- clear ownership and epistemic boundaries;
- both language versions with Claim Ledger parity;
- a passing build.

A counterpoint is **conditional**, not a slot. Include one when a strong informed reader would actually object, evidence is mixed, or the Note makes a broad causal claim. A narrow field note, correction, question memo, or application note may not need one. Do not write a fake "to be fair" paragraph to pass the checklist.

### Essay

An Essay includes the Note requirements and also needs enough material for multiple genuinely distinct sections, a mechanism-level argument, current sources where needed, and honest treatment of the strongest **live** objection/boundary.

A falsifiable statement or prediction is **opportunistic**. If the argument naturally produces one, record it in frontmatter / tracker machinery. If not, the Essay can still pass. Never generate a 2027 prediction because the checklist expects tracker fuel.

### Length

The historic bands (`Note 300–700`, `Essay 800–1,500`) are descriptive ranges and useful ceilings, not minimum targets. A 420-word Note or 760-word Essay can be complete. The content gate warns only above the ceiling. If a piece is short, ask whether it is dense enough, not how to add words.

If a piece exceeds the ceiling, edit down first. Keep the extra length only when the PR body can point to additional irreplaceable material that truly needs it.

## 5. Human-style rules are diagnostics, not generation quotas

Uniform paragraph length, uniform sentence length, no contractions, repeated corrective pivots, and template closers are useful machine-writing diagnostics. They are **not** instructions to insert:

- one two-word paragraph;
- one deliberately long paragraph;
- one or two jokes/asides/parentheticals;
- a rhetorical question;
- a punchy aphorism.

If a rhythm break or casual touch exists only because a checklist asked for it, remove it. Manufactured burstiness is another machine tell.

## 6. Drafting behavior

The outline comes **after** the Material Audit and Form decision. Draft from the material outward:

1. Build Author Kernel + confidence tags + Claim Ledger.
2. Run Material Audit.
3. Pick internal form and public tier.
4. Decide which candidate sections pass the irreplaceable-material test.
5. Draft the first language naturally from the shared package.
6. Draft the second language clean-room style from the same package, preserving #69 claim parity without mirroring structure.
7. Run the human pass as a diagnostic/editing pass, not a quota-filling pass.

An unresolved ending is valid. "We do not know yet" is valid when that is what the material supports. Research can make facts clearer; it cannot manufacture an author-owned resolution.

## 7. Ship gate: form fit is a hard gate

The ship gate checks the PR's `## Material Audit` and `## Form decision` before declaring `Ready to ship`.

**A form/tier mismatch is blocking.** If the audit says `fragment` or `note` but the PR declares `essay`, the checklist has not passed. This is not merely a voice/advisory flag.

The remedy order is:

1. cut generic scaffolding;
2. trim to the strongest material;
3. downgrade the form/tier;
4. if the missing material is genuinely necessary, send it back for more author input/reporting before polishing again.

Never solve a failed gate by inventing the missing furniture: no synthetic counterargument, prediction, extra example, neat conclusion, or filler to reach a word band.

Mechanical failures (broken links, Claim Ledger parity gaps, build errors) can still be fixed directly. A substantive author-judgment gap goes back to the author as one precise question.

## 8. Retrospective signal

The gardener tracks late downgrades (`Downgrade to note` author comments and the >7-day gate downgrade), split by the drafter's originally declared form/tier. A high Essay → Note rate is evidence that the drafter is over-tiering upstream.

## 9. Regression fixtures

Use these fixtures when changing the policy:

- **PR #62**: the useful material was a narrow firsthand observation plus an explicit hardware/domain boundary. It should be recognized early as `field-note` / `note`, not expanded into DAC vendor architecture, DO-178C, a coined framework, and a forecast merely to look complete.
- **PR #58**: where the central claim still lacks enough owned/evidenced mechanism, the right result is `fragment` / more research or interview before polish, not smoother connective prose.
- **`taste-is-a-bet`**: a piece with an author-owned correction story, multiple concrete examples, and interacting claims can still earn `essay`. The point is not to prefer short work; it is to make long form pay for itself with material.

## Relationship to sibling issues

- #66 / §10 remains the ownership boundary; the Material Audit reads the Author Kernel rather than replacing it.
- #71 source-confidence tags (`firsthand`, `position`, `tentative`, `domain-limit`) are inputs to the audit. A `domain-limit` narrows form; it is not repaired with a disclaimer.
- #69 bilingual work remains claim-parity based with independent rhetoric/structure per language. Material density is judged once on the shared package, not separately by word-count symmetry.
- #68's later editorial critic can consume the fixed `## Material Audit` and `## Form decision` sections without inventing another schema.
