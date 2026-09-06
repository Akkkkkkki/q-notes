# Evidence roles — preventing theory laundering

This document is the normative evidence-role contract for Issue #87. It complements the
Claim Ledger ownership model in `docs/pipeline.md`: **ownership says whose claim it is;
evidence role says what a source can actually establish for that claim.** The two fields
must not be collapsed.

## Roles

Every external source used as load-bearing support must have exactly one role for the
claim it is attached to:

- `direct-evidence` — directly measures or observes the claim/mechanism being asserted.
- `example` — shows an instance of the claim, without establishing prevalence or cause.
- `counterexample` — limits, falsifies, or narrows the claim.
- `context` — establishes background, prevalence, timing, or surrounding facts; it does
  not establish the mechanism.
- `analogy` — explains by comparison with another domain; it never establishes the
  target-domain claim.
- `hypothesis-source` — motivates a possible explanation or extension but does not
  independently support it.

Role is **claim-relative**. The same paper may be `direct-evidence` for one claim and
`context` for another. Store the role on the claim/source relationship, not as a permanent
label on the source.

## Claim Ledger shape

Keep the existing stable Claim IDs and ownership classes. For every external source that
matters to a load-bearing claim, add a compact evidence record:

```md
C3. <claim> — External — Required in: EN + ZH
    - Evidence: <source URL> — role: context — establishes: <what the source actually shows>
C4. <claim> — Q-derived — Required in: EN + ZH
    - Evidence: <source URL> — role: direct-evidence — establishes: <measured mechanism>
```

The minimum machine-readable fields are:

```text
claim_id        stable Cn id
evidence_source stable URL or source reference
evidence_role   direct-evidence | example | counterexample | context | analogy | hypothesis-source
establishes     short statement of what the source actually supports
```

Issue #88 adds inference-distance / parent-claim metadata to the same Claim Ledger. That
is a separate axis. Implementations must preserve these evidence-role fields when #88
lands rather than replacing them with inference distance.

## No implicit upgrades

Evidence roles are ceilings, not hints. Drafting prose cannot promote them:

```text
context + context + analogy != direct-evidence
example + context != prevalence
analogy != target-domain mechanism
hypothesis-source != support for the hypothesis
```

Ten context sources do not equal one direct source. Citation count is not material
density and must not be used to justify a broader form or stronger causal claim.

If a load-bearing thesis needs direct evidence and the package has none, choose one of
four actions: narrow the claim; keep the mechanism explicitly hypothetical; search for
direct measurement/case evidence; or leave the question unresolved. Do not bridge the
gap with synthesis prose.

## Research behavior

Research is role-gap driven after the first useful package exists. Before another broad
search, ask which role is missing for the load-bearing claim. Search for that role, for
example `direct measurement of mechanism M`, rather than collecting more adjacent links.

Counterexamples are useful evidence because they constrain a thesis. They do not need to
be turned into a ceremonial counterargument section.

## Material Audit

The Material Audit judges what the evidence **does**, not how many citations exist.
Research specifics should name the role that materially earns scope. A dense bibliography
made only of context/examples cannot upgrade a Note into an Essay or an observation into
a causal theory.

## Editorial critic

The existing single `## Editorial critic` surface remains the only PR-facing critic
contract. Evidence-role findings feed its existing sections; do not create a second
permanent audit comment.

Privately compare each load-bearing external claim with its evidence records and report a
blocking reasoning failure when the prose uses a source above its recorded role. Name the
Claim ID and the upgrade, for example:

```text
C4: context -> causal support; source establishes adoption growth, not mechanism M.
C7: analogy -> target-domain conclusion; narrow or mark as hypothesis.
```

Phrases such as “same direction”, “same lesson”, or “confirms the thesis” are prompts to
inspect the underlying roles, not banned strings. They are valid when the sources really
do establish the same claim.

## Calibration fixtures

- `consulting-coordination` (#81): the broad “coordination is the real bottleneck” thesis
  fails when adjacent process/productivity/architecture sources are mostly context or
  analogy rather than direct evidence for one coordination mechanism.
- `consulting-outcomes` (#82): AI revenue is context for AI adoption/economics; it is not
  direct evidence that consulting pricing is moving to outcome-contingent fees.
- `agent-prs-need-traffic-control` (#77): a concurrency/merge study can be direct evidence
  for overlap/conflict; a logging-repair study is peripheral context for that narrower
  mechanism and should not be counted as support.

## Public output

Evidence roles are internal editorial metadata. Public articles do not need labels or a
source table. Firsthand author material keeps its existing Author Kernel provenance path
and is not forced into this external-source schema.
