# Inference distance and multi-hop ownership

Issue: #88

This contract makes new reasoning visible without punishing ordinary explanation. It extends the existing Claim Ledger semantics; it does not create a second ledger.

## Core rule

The farther a load-bearing claim sits from observed or explicitly supplied material, the more clearly it must be treated as inference rather than inherited source certainty.

A citation can be accurate while the conclusion is still several reasoning steps away. Source correctness and inference distance are separate questions.

## Claim-level fields

For every load-bearing claim whose meaning depends on another claim or evidence item, record:

- `inference_distance`: `0 | 1 | 2 | 3+`
- `parent_claims`: stable Claim IDs or evidence refs that the claim depends on

These fields live alongside, not instead of, existing fields such as ownership and evidence role.

### Distance 0 — observed / stated

The claim is directly present in author-owned firsthand material or directly reported by an external source.

Examples:

- a benchmark reports a measured failure rate;
- Q explicitly says a client workflow changed in a specific way;
- a company discloses a pricing term.

Distance 0 does not decide ownership by itself. It may be `Q-explicit`, `External`, or another valid existing ownership class depending on provenance.

### Distance 1 — near inference

One narrow interpretation follows from a distance-0 parent and adds little new mechanism.

A near inference must stay close enough that a reasonable reader would not need a second independent assumption to get there.

Distance 1 may be `Q-derived` when the inference is genuinely narrow and introduces no new value judgment, causal mechanism, cross-domain transfer, or second-order consequence.

### Distance 2 — substantive inference

The claim adds a new causal, mechanistic, structural, or behavioral proposition that the parent material does not itself establish.

Model-generated distance-2 claims default to `Model-hypothesis` unless Q explicitly supplied or adopted that inference.

Before prose may present such a claim as part of the article's asserted position, choose one:

1. obtain direct evidence that lowers the unsupported gap;
2. obtain explicit author adoption;
3. keep it visibly as a hypothesis/question;
4. narrow or remove it.

### Distance 3+ — theory extension

The claim combines multiple substantive inferences, crosses domains, predicts second-order effects, or generalizes from a bounded observation to an industry/system conclusion.

Model-generated distance-3+ claims are always `Model-hypothesis` until explicit author adoption. Source count, fluent connective prose, or analogy cannot lower the distance.

## Parent-chain rule

`parent_claims` must make the load-bearing chain inspectable.

Example:

```text
C1 [distance 0, External]
AI revenue share rose.

C2 [distance 2, Model-hypothesis, parent C1]
Firms are changing pricing because AI lowers delivery effort.

C3 [distance 3+, Model-hypothesis, parent C2]
Consulting will move toward outcome-contingent pricing.
```

The existence of direct evidence for C1 does not make C2 or C3 directly evidenced.

Do not mechanically count arrows or sentences. The classification is semantic. The point is to expose where a new mechanism or consequence enters the reasoning.

## Interaction with evidence roles (#87)

Evidence role and inference distance are orthogonal:

- evidence role asks what a source does for a claim;
- inference distance asks how much new reasoning sits between the supporting material and the claim.

A `direct-evidence` source for C1 can still leave C3 at distance 2 or 3+.

A `context`, `analogy`, or `hypothesis-source` item cannot become direct support for a distant target claim through repetition or synthesis.

When #87 lands, both dimensions belong to the same extended Claim Ledger contract.

## Drafting behavior

Before outlining, classify the inference distance of every load-bearing derived claim.

The Drafter must not use connective language to hide a substantive hop. Words such as `therefore`, `which means`, `the implication is`, or `the same logic transfers` do not reduce inference distance.

If drafting introduces a new load-bearing distance-2+ claim after Material Audit, stop and return it to the Claim Ledger. Re-run the Material Audit/form decision before continuing.

Do not add research merely to decorate a distant hypothesis. Research should target the missing link in the parent chain.

## Editorial Critic behavior

Issue #68 remains the single critic surface. The critic should inspect the longest or most consequential parent chains and report only material failures in its existing compact output.

A blocking failure exists when, for example:

- a model-generated distance-2+ claim is written as Q's current position without adoption;
- a source fact is followed by an unmarked new root-cause claim;
- a bounded case becomes an industry claim without intermediate support;
- an analogy becomes a target-domain conclusion;
- correlation becomes a causal mechanism;
- a current mechanism becomes a labor-market or business-model consequence without evidence/ownership.

The critic should reference Claim IDs where possible. Do not add a permanent `Inference-distance audit` section to PRs.

## Bilingual behavior

EN and ZH share the same Claim IDs, ownership, inference distance, and parent relationships. Their rhetorical order may differ.

A Chinese rewrite cannot strengthen a distance-2 hypothesis into a declarative current position merely to sound natural. An English hedge is not required word-for-word, but the semantic uncertainty/ownership must remain.

## Calibration fixtures

### `consulting-barbell` (#80)

The investing observation can be distance 0 in its source domain. Claims about consulting senior pricing, grade structure, and a market-wide barbell are multi-hop target-domain extensions and must remain hypotheses unless independently evidenced/adopted.

### `consulting-coordination` (#81)

A reported low P&L-impact result is distance 0 as an external observation. `Organization/coordination is the binding constraint` adds a causal diagnosis and cannot inherit the source's certainty.

### `helpful-agents-authorization-bug` (#83)

Observed out-of-scope agent behavior can directly support the intent/authority distinction. A claim that convenient mobile approval will cause approval fatigue or weaker scope decisions is a further behavioral hypothesis and must be marked accordingly.

## What this rule does not do

- It does not require every sentence to carry an inference label.
- It does not turn ordinary explanation into author-approval bureaucracy.
- It does not prohibit inference or original thinking.
- It does not replace evidence-role classification.
- It does not treat numeric distance as mathematical truth.

The rule applies to load-bearing claims: thesis, mechanism, counterargument, taxonomy, prediction, or current author position.