# Editorial critic — scope and integration contract

This document is the canonical focused reference for Issue #68. It sits between the
material/form rules in `docs/material-form.md` and the mechanical shipping rules in
`automations/04-ship-gate.md`.

The runnable prompt is `automations/03b-editorial-critic.md`.

## Why this stage exists

Q-notes already checks content schema, build, bilingual parity, claim ownership, source
links, and human voice. Those checks can still approve a draft that has become too
complete: a model can take one good observation and add a framework, analogy,
counterargument, implication, prediction, and neat conclusion until the article looks
more intellectually settled than the material warrants.

The editorial critic has a different job:

> Decide whether the current piece has earned its **scope and shape** before the ship gate
> spends effort polishing and shipping it.

It is intentionally independent from both the drafter and the ship gate.

## Pipeline position

```text
Author Kernel + Claim Ledger
→ Material Audit + Form decision
→ bilingual draft PR
→ independent editorial critic (03b)
→ scope repair when needed
→ fresh critic KEEP
→ deterministic content/build checks + ship gate (04)
→ author approval
```

The critic is a required content-PR stage. The ship gate may not say `Ready to ship` or
`Ready — queued` without an applicable critic `KEEP`.

## One compact PR contract

The critic posts one PR-facing result:

```md
## Editorial critic

<!-- q-notes: editorial-critic head=<full PR head SHA> -->

### Verdict
KEEP | CUT | DOWNGRADE | SPLIT | SKIP

### Strongest single idea
<one sentence>

### Blocking reasoning failures
- <only failures that require thesis, scope, ownership, or evidence changes before ship>

### Required scope cuts / splits
- <what should leave this piece and why>

### Optional warnings
- <non-blocking issue only when useful>
```

Use `- None.` rather than adding empty audit sections.

The five verdicts mean:

- `KEEP`: current scope is earned; proceed to mechanical/ship review.
- `CUT`: the core idea is earned but expendable or over-completing material must leave.
- `DOWNGRADE`: the material earns a smaller public form/tier.
- `SPLIT`: two or more useful ideas exist but do not earn one combined piece.
- `SKIP`: no standalone publishable shape is earned yet, or the piece adds no useful
  self-novelty beyond an existing Q-notes idea.

A non-`KEEP` verdict is a normal editorial outcome, not a failed automation run.

## Severity boundary

The critic blocks only reasoning problems that require a change to thesis, public scope,
claim ownership/uncertainty, evidence, or form. It does not absorb the jobs already owned
elsewhere.

**Critic / blocking when material:**

- over-completion and false intellectual neatness;
- generic/expendable sections;
- conclusion or title-level thesis outrunning available material;
- author uncertainty or domain limits being over-resolved;
- archive framework stamping / weak self-novelty;
- unsupported causal or cross-domain inference;
- separable third acts that should be cut or split;
- an article tier larger than the actual earned idea.

**Outside critic / ship or deterministic checks:**

- build/schema failures;
- bilingual claim parity;
- link/formatting errors;
- punctuation and ordinary prose polish;
- voice/style warnings that preserve the same semantic claim;
- cadence and stale-PR clocks.

This boundary matters. The critic must be strong enough to say `SKIP`, while the ship gate
must remain strong enough to stop perfectionism once scope is settled.

## Independence and repair

The critic must judge before editing. It posts its initial verdict first.

After an initial `CUT` or `DOWNGRADE`, it may make a narrow subtractive repair only when
no new thought is required: deleting generic material, removing an unearned prediction,
or re-tiering and trimming to an already-earned claim. It must not invent replacement
logic, evidence, first-person stance, or a stronger title.

After any such edit it reruns itself and posts a fresh result against the new head SHA.
`SPLIT`, `SKIP`, missing evidence, and author-judgment gaps do not get silently self-fixed.

## Freshness

The HTML marker binds a critic pass to the PR head it reviewed. A semantic edit after a
`KEEP` requires another pass. Semantic edits include changes to:

- thesis / strongest claim;
- Claim Ledger membership, ownership, or uncertainty;
- Material Audit / Form decision / public tier;
- evidence for load-bearing claims;
- major sections;
- hypothesis adoption that changes prose;
- materially stronger/narrower title claims;
- prediction, counterargument, or framework scope.

A ship-gate-only typo, formatting, link, build, or claim-preserving voice fix does not
needlessly reset the critic. If the SHA changed only for those reasons, Routine 04 must
explicitly verify that no semantic draft change occurred before carrying the `KEEP`
forward.

## Self-novelty and framework stamping

Archive continuity is valuable, but it creates a local machine-voice failure mode:

```text
new event
→ retrieve old Q-notes concept
→ explain event with that concept
→ coin adjacent mechanism
→ link back
→ expand the framework library
```

The critic compares the draft to roughly five relevant/recent posts and asks what the new
piece **changes, challenges, combines, or deepens**. Semantic comparison matters; raw
keyword overlap does not.

A useful example of an old idea may still earn an `application-note` or Tracker. It does
not automatically earn a new Essay or new canonical framework.

Under strict-v1 archive provenance, published article bodies are historical/contextual
material for this comparison. They do not, by themselves, authorize a current
`Q-explicit` premise.

## Structural fingerprint

The critic privately compares whole-article choreography, for example:

```text
opening: trend / scene / correction / quote / question
move 1: definition / case / data / observation
move 2: mechanism / contrast / taxonomy
counterpoint: none / early / middle / late
coined concept: yes/no
prediction: yes/no
closer: open question / claim / prediction / aphorism / callback / natural stop
```

Repeated individual moves are fine. The smell is the same complete sequence appearing
regardless of what the material needs.

## Natural endpoint

The critic mentally removes the final ~30% and asks what part of the core argument is
actually lost. The percentage is adversarial, not a quota.

If what disappears is only a broader implication, hiring/business-model angle, taxonomy
expansion, prediction, ceremonial counterargument, or neat closer, default to `CUT` or
`SPLIT` unless that material changes or seriously tests the thesis.

An article is allowed to stop when its idea is complete.

## v3 integration surface

Issue #68 remains the **single integration owner** for later v3 reasoning signals. As
#87–#97 land, their shared data/checks feed this same critic internally. They must not add
permanent competing top-level reviewer contracts to content PRs.

Potential internal signals include evidence roles, inference distance, article spine,
natural endpoint, analogy transfer, concept maturity, title claim ceiling, live-objection
damage, prediction scoreability/ownership, and archive canonical status.

A missing future signal is not automatically a blocker. #68 owns severity. The public PR
result remains the compact five-section contract above.

## Regression philosophy

The semantic calibration set is `tests/editorial/critic-v2.md`.

Do not snapshot model prose. Test outcomes and failure families instead:

- a narrow authored observation should not become a grand framework merely because the
  research can support related examples;
- a real correction of an older Q-notes position counts as self-novelty;
- an application of an old framework may be useful but usually deserves a smaller form;
- stronger concrete cases should materially improve a draft's verdict;
- positive fixtures must not be downgraded simply because the critic exists.

The system is successful when it makes scope smaller **when warranted**, not when it
returns more warnings.