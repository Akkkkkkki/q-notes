# Natural endpoint / third-act contract

This is the focused contract for GitHub issue #89. It complements the material/form rules in `docs/material-form.md` and the single integrated critic in `docs/editorial-critic.md`.

The rule is simple:

> An article is allowed to stop when its strongest idea is complete. A plausible implication does not earn a section merely because it makes the piece feel finished.

## Where the check runs

The rule has two existing execution surfaces and must not create a new reviewer:

1. **Drafter:** after both language drafts exist and before opening the PR, prefer the natural stopping point. The Drafter already may not manufacture a prediction, counterargument, second act, example, or conclusion to preserve an outline, and it may not add a new load-bearing claim without returning to the Claim Ledger and Material Audit.
2. **Editorial Critic:** independently run the natural-endpoint / final-~30% deletion simulation. Issue #68 remains the only PR-facing critic contract. A failed endpoint check feeds `CUT` or `SPLIT`; it does not add a new top-level audit section.

The percentage is an adversarial thought experiment, not a deletion quota.

## Two deletion simulations

### A. Final ~30%

Mentally remove the final roughly 30% of the piece and ask:

> What specific part of the core argument becomes unsupported, materially less clear, or materially less tested?

Material that survives only because it is a broader implication, hiring/business-model angle, taxonomy expansion, decorative prediction, ceremonial counterargument, or neat closer does not earn its place by default.

Keep late material when it contributes something irreplaceable, for example:

- evidence required to earn an existing Claim Ledger item;
- a live objection that genuinely narrows or damages the thesis;
- a firsthand case that changes the reader's understanding of the mechanism;
- a necessary boundary or counterexample;
- a conclusion that resolves an argument rather than restating it.

### B. Strongest-idea compression

Ask:

> If the piece could keep only its strongest claim and the material required to earn it, where would it naturally end?

Everything after that point must change, seriously test, or delimit the retained claim. Merely applying the same claim to another domain is normally a future thought, not another section.

## CUT vs SPLIT

Use **CUT** when late material is expendable completion furniture. Removing it leaves no independently useful intellectual object.

Use **SPLIT** when the late material contains a genuinely useful second idea that is not required by the current article. Preserve the idea rather than deleting its provenance:

- if it is author-originated, return it to the appropriate inbox/backlog source with a pointer to the current piece/run;
- if it is model-generated, keep it in the existing candidate-hypothesis flow and do not promote it to an author position;
- if it requires new evidence or author judgment, let it re-enter Author Kernel → Claim Ledger → Material Audit independently before future drafting.

A split idea does not inherit the current article's evidence, form decision, or author ownership automatically.

## No generation quota

The Drafter must not ask by default:

- what does this mean for hiring?
- what does this mean for pricing or business models?
- what prediction follows?
- what broader framework follows?
- what concluding synthesis would make this feel complete?

Those questions are legitimate only when current author material or direct evidence already makes them load-bearing.

A Note or Essay may end with an observation, a bounded claim, a live unresolved question, or a plain natural stop. It does not owe a prediction, counterargument section, future implications, or aphoristic close.

## Bilingual behavior

The natural endpoint is a semantic judgment, not a paragraph-count rule. EN and ZH share the retained Claim Ledger but may reach the endpoint through different section counts, order, examples, or closing sentences. Do not keep a weak section in one language merely to mirror the other.

When a late section is cut or split, required Claim Ledger parity still has to hold in both drafts.

## Calibration fixtures

### `taste-is-a-bet` (#85)

The correction, working distinction, and live latency objection can stand on their own. Industry taxonomy, hiring implications, and the taste-replication/data-collection prediction are separable third-act material unless independently earned.

Expected result: `CUT` or `SPLIT` for speculative late material; preserving unresolved uncertainty is a valid ending.

### Historical PR #64

The useful author-owned distinction should survive. Pricing, individual-compensation, and 2028-falsifier extensions should not remain merely to give the piece a larger final act.

Expected result: preserve the core, remove or quarantine separable extensions.

### `agent-prs-need-traffic-control` (#77)

The admission/order mechanism plus its boundary can be a complete Note. A broad cultural prediction is not required.

Expected result: a natural stop after the mechanism is acceptable.

### Positive long-form control

A later section that introduces new direct evidence or a live counterexample that changes the thesis may remain even if it sits in the final 30%.

Expected result: do not reward shortness for its own sake.

## Relationship to other rules

- **#67 Material Audit:** asks how much argument the available material can support before drafting.
- **#90 Article spine:** asks what thought owns the article's structure before outlining.
- **#89 Natural endpoint:** asks whether the finished draft continued after it had already spent the material needed for that thought.
- **#68 Editorial Critic:** integrates the endpoint result with all other reasoning signals into one verdict.

Do not create another state machine, reviewer, PR section, or deterministic percentage linter for this rule. The judgment is semantic; the durable guard is the existing Drafter/Critic behavior plus regression tests.
