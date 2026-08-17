# Editorial critic v2 — semantic regression fixtures

This is the calibration set for Issue #68. It is intentionally human/model-readable rather
than a snapshot test: the critic is a semantic reviewer and exact prose will vary.

When changing `automations/03b-editorial-critic.md` or `docs/editorial-critic.md`, run these
cases against the actual draft → critic → ship reasoning path. Compare **verdict family,
strongest idea, and failure family**, not exact wording.

A healthy critic must discriminate. Do not tune it until every fixture returns a downgrade.

## Fixture A — PR #62, pre-author downgrade

**Known shape**

A narrow set of author observations about software verification/approval expands through
DAC vendor architecture, reversibility, DO-178C, accountability theory, a coined
`consequence gate`, regulation, and a prediction. The author material also carries an
explicit hardware/domain boundary.

**Expected**

- Verdict: `DOWNGRADE` or aggressive `CUT`.
- Strongest idea: narrow firsthand software/verification observation, not the completed
  cross-domain theory.
- Flags: later sections exceed the Author Kernel/Material Audit; hardware boundary was
  resolved rather than respected; coined framework/prediction are separable or
  hypothesis-heavy.
- Must **not** repair by inventing a better hardware theory.

## Fixture B — PR #64, taste / decisiveness

**Known shape**

The strongest material is the correction/distinction around taste, judgment, and
`decisiveness`. The draft later expands into pricing, incentives, outcome underwriting,
individual compensation, and a 2028 falsifier.

**Expected**

- Verdict: `CUT` or `SPLIT` is acceptable; `KEEP` only if those later extensions have
  already been removed/narrowed.
- Preserve the core distinction/correction.
- Pricing/compensation/falsifier material is identified as separable or unadopted
  hypothesis, not required third act.
- Removing the prediction must not make the core article fail.

## Fixture C — PR #58 before deeper game research

**Known shape**

The draft has a promising thesis but much of the body could have been written from generic
AI/game discourse without specific cases doing argumentative work.

**Expected**

- Verdict: `CUT`, `DOWNGRADE`, or `SKIP`/more-material depending on exact snapshot.
- Flag generic section density using the irreplaceable-material test.
- Ask for concrete cases/mechanisms only when genuinely needed; do not reward smoother
  connective prose as a substitute.

## Fixture D — PR #58 after BG3 / CK3 / Vox Deorum revisions

**Known shape**

Specific game cases now carry the mechanism and constrain the argument.

**Expected**

- Materially better verdict than Fixture C; `KEEP` or light `CUT` is plausible.
- The critic should name what the concrete examples now earn.
- It must not downgrade merely because the earlier version was weak.

## Fixture E — `taste-is-a-bet`

**Known shape**

The piece reuses prior taste/judgment terminology but genuinely corrects/deepens the older
position and keeps a live latency objection that can change the distinction.

**Expected**

- Verdict: `KEEP` or light `CUT`.
- Reuse of prior terminology is **not** framework stamping by itself.
- Self-novelty is the correction/deepening of the earlier position.
- Unresolved latency tension should remain unresolved rather than be converted into a neat
  synthesis.

## Fixture F — pure old-framework application

**Synthetic shape**

A new event is explained entirely through an existing Q-notes framework. The event is a
reasonable example, but the article does not change, challenge, combine, or deepen the
framework and adds no unusually useful firsthand/evidence package.

**Expected**

- Default `DOWNGRADE` to application Note/Tracker or `SKIP`.
- Must state what is merely reapplied and what, if anything, is genuinely new.
- Must not coin an adjacent framework just to manufacture novelty.

## Fixture G — narrow field note with no third act

**Synthetic shape**

One author-owned observation, one concrete mechanism, clear boundary, both languages,
no prediction, no formal counterargument section, and a natural stop after the mechanism.

**Expected**

- `KEEP` if the Note is otherwise supported.
- No penalty for lacking prediction, taxonomy, broad implication, or conclusion section.
- The critic must not create editorial furniture in the name of completeness.

## Fixture H — same structure, different earned material

**Synthetic pair**

Two Notes happen to share the sequence `scene → mechanism → boundary → stop`, but each is
built from different firsthand/evidence material and neither stamps an old conceptual
framework onto a new event.

**Expected**

- Structural similarity alone does not block.
- The critic may mention choreography only if the *whole repeated sequence* appears to be
  imposed despite different material needs.
- Raw structure/keyword similarity is not a novelty score.

## Invariants across all fixtures

- Output uses the one compact `## Editorial critic` contract.
- One of `KEEP | CUT | DOWNGRADE | SPLIT | SKIP` is explicit.
- Strongest single idea is always named.
- Blocking failures are limited to thesis/scope/ownership/evidence/form issues.
- Build, bilingual parity, formatting, cadence, and ordinary voice polish stay outside
  critic blocking failures.
- Claim IDs are referenced when available and useful, but missing IDs in a historical
  fixture do not cause automatic failure.
- No AI-detector score, perplexity metric, numeric novelty threshold, or fixed 30% deletion
  quota is used.
- A positive fixture is allowed to pass.