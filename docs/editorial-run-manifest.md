# Editorial run manifest

Issue #106 introduces a versioned `EditorialRunManifest` as the machine contract for migrated editorial runs. It separates editorial semantics and runtime state from the Markdown that humans inspect on GitHub.

## Source of truth and persistence

GitHub remains the durable editorial source of truth. Migrated runs should persist their manifest as a repo-side internal artifact at:

`research/.companion/runs/<runId>.json`

`manifestRepoPath()` owns that path and rejects unsafe run IDs. The `research/.companion/` namespace is internal and is not part of Astro's `src/content/**` collections, so runtime metadata cannot become a public article by accident. A run artifact contains no credentials or provider secrets.

The file is versioned with the rest of the repository and should be committed with the GitHub refs/SHAs it describes. This gives retries and resumes a stable run identity and an auditable state transition history without adding an application database.

## Contract boundaries

`worker/editorial-run-manifest.ts` contains the canonical types and low-judgment checks. The Claim Ledger fields follow the editorial v3 contract: stable claim ID, semantic claim, ownership, provenance, evidence role, inference distance and parents, language requirement, and canonical/archive status. It does not attempt to judge whether prose is true, good, or semantically equivalent.

The validator checks:

- stage and execution-state transitions through explicit transition helpers;
- required artifacts once a run claims later stages;
- unique Claim, hypothesis, calibration, option, and author-decision IDs;
- valid inference-parent references;
- EN+ZH presence records before parity can be complete;
- critic binding to the semantic-head SHA;
- A/B and hypothesis decisions against real targets;
- fail-closed completion when author decisions remain unprocessed.

A semantic edit should use `invalidateCriticForSemanticEdit()`: it changes the semantic head, clears the critic result, and moves a later run back to `drafts-ready`. Mechanical/voice-preserving critic reuse remains a caller policy under the existing editorial-critic contract rather than being guessed by this validator.

## Rendering

`renderEditorialRunAudit()` is the one-way human-readable projection for migrated runs. It renders the useful GitHub audit sections from typed state, including Author Kernel, Claim Ledger, Material Audit, Form decision, bilingual parity, voice signals, candidate hypotheses, A/B calibration, title options, and critic summary.

The intended direction is:

```text
EditorialRunManifest -> PR Markdown / Desk view
```

New runtime features should be added to the typed contract and renderer, not to a new Markdown regex protocol.

## Legacy compatibility

`worker/editorial-run-legacy.ts` is an explicit migration adapter for existing content PRs. It reuses the current tolerant `worker/desk.ts` parsers for form tier, verbatim spine, untraceable flags, A/B questions, candidate hypotheses, and title options, and reconstructs known A/B/adopt/reject comments.

Reconstructed runs are deliberately fail-closed. They remain at the initial `requested` stage because a PR body cannot prove that every earlier stage completed, and reconstructed author decisions remain pending until a migrated runtime records its own processed sequence. Malformed legacy Markdown therefore produces an empty reconstruction rather than invented semantic state.

Do not add new runtime capabilities only to the legacy adapter. It should be removed after live PRs no longer depend on the old body protocol.
