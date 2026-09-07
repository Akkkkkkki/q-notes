# Article spine

Issue: #90

This document is the normative article-spine contract for Q-notes. It extends the material/form rules in `docs/material-form.md`; it does not replace the Author Kernel, Claim Ledger, Material Audit, or the single Editorial Critic owned by Issue #68.

## Principle

> Sources support the article spine. They do not become the spine.

A publishable Q-notes piece needs one author-owned or mechanism-led reason to exist that remains legible when source names and citations are hidden. Research can establish, challenge, delimit, or contextualize that reason. A sequence of related sources is not itself an article structure.

A research memo may be source-organized. A published Note, Essay, or Tracker should not be source-organized by default.

## When the spine is chosen

Choose the spine **after** the Author Kernel, Claim Ledger, Material Audit, and Form decision are fixed, but **before** outlining or drafting prose.

The order is:

```text
Author Kernel
→ Claim Ledger
→ Material Audit
→ Form decision
→ Article spine
→ Outline
→ Draft
→ Editorial Critic
```

The spine may not introduce a load-bearing claim that is absent from the frozen Claim Ledger. If choosing a spine reveals that the piece requires a new claim, return to the Claim Ledger and rerun Material Audit/Form decision before proceeding.

## Spine contract

Every draft PR records exactly one compact spine object:

```md
## Article spine
- Type: author-claim | firsthand-case | concrete-mechanism | correction | unresolved-question
- Spine: <one sentence>
- Claim refs: <one or more Claim Ledger IDs>
```

`Claim refs` must point to claims already present in the shared Claim Ledger. The spine is semantic state shared by both languages; the English and Chinese drafts may realize it with different openings, section order, headings, and closers.

### Allowed spine types

- **`author-claim`** — a current author-owned claim that the material can earn at the chosen form.
- **`firsthand-case`** — a concrete author-owned event/case where the observation itself is the organizing material.
- **`concrete-mechanism`** — a bounded mechanism directly supported by the current package, including an externally observed mechanism when it is not being laundered into an author position.
- **`correction`** — a documented change/narrowing of a prior view where current author material owns the correction.
- **`unresolved-question`** — a real open question whose uncertainty is itself the honest center of the piece.

There is deliberately no `research-trend`, `source-roundup`, `three-papers`, or `industry-consensus` spine type.

If the best available description is “several sources discuss X,” the material may be useful research, but it has not yet earned an argued Q-notes article. Leave it as research/backlog material or do the specific work needed to identify a real claim, case, mechanism, correction, or question.

## Section mapping

Each proposed major section must answer all three questions:

1. **Which part of the spine does this advance, challenge, or delimit?**
2. **What irreplaceable material does it add?** This can be author material, a concrete mechanism/case, direct evidence, a live counterexample, or a necessary boundary.
3. **What role does any research play?** Use the canonical evidence-role contract when available; source succession alone is not a reason for a section.

A section whose only job is “another recent study says something related” should be cut or kept in research notes.

Do not copy research-memo headings or source order into the article outline unless the spine independently makes that order necessary.

## Citation-hiding test

The Editorial Critic runs this adversarial test after a draft exists:

> Hide every citation, source name, company/lab name used only as attribution, and research-paper heading. Can the piece still state one clear mechanism, author-owned claim/correction, firsthand case, or unresolved question in concrete terms?

This is a reasoning test, not permission to publish unsourced claims. Sources remain required where the claim needs them. The test asks whether sources are supporting an argument or supplying its entire structure.

### Pass

A draft passes when the spine remains clear without the labels of its supporting sources and the retained sections can still explain how their evidence relates to that spine.

### Fail

A draft fails when removing source labels leaves only a topic, trend, or chain such as:

```text
paper A
→ interpretation
→ paper B
→ interpretation
→ founder quote
→ paper C
→ synthesis
```

A failure normally means `restructure`, `DOWNGRADE`, or `SKIP` through the existing Editorial Critic contract. It does **not** create a separate PR-facing audit section.

## Interaction with other contracts

- **Material/form (#67):** the spine cannot justify a larger form than the Material Audit already earned.
- **Ownership (#66):** an author-claim/correction spine must trace to current author-owned material. Published history alone cannot authorize it under strict-v1 provenance.
- **Evidence roles (#87):** evidence role is claim-relative. Context/analogy cannot become the spine's direct support through repetition.
- **Inference distance (#88):** when implemented, a spine cannot hide a distance-2+ Model-hypothesis as a sourced or author-owned premise.
- **Natural endpoint (#89):** the spine determines what the article needs; the later natural-endpoint test asks whether the draft kept writing after that work was complete.
- **Editorial Critic (#68):** article-spine failures feed the one existing `KEEP | CUT | DOWNGRADE | SPLIT | SKIP` verdict. Do not add another reviewer or permanent PR section beyond the draft's compact `## Article spine` record.

## Calibration fixtures

### `agent-coordination-debt` (#76)

The existing source succession is too prominent. A valid rewrite needs the bounded organizational unresolved-decision mechanism as the spine; adoption, calibration, and prompt-framing papers can only remain if their role against that mechanism is explicit.

### `pull-requests-are-knowledge-imports` (#84)

The six-item intent/maintenance package can form a concrete-mechanism spine. Peripheral studies that merely repeat “generation is cheap, review is expensive” should not determine article order.

### `taste-is-a-bet` (#85)

The correction/working distinction exists independently of citations, so it should pass the citation-hiding test even if supporting examples and sources are removed from view.

## Non-goals

- Do not require first-person scenes or firsthand material when an external concrete mechanism genuinely earns a useful Note.
- Do not discourage well-sourced writing.
- Do not make articles citation-light for style reasons.
- Do not require a new database, typed runtime field, or separate critic before the current pipeline can enforce this contract.
- Do not force every source to appear in the public article merely because it was useful during research.
