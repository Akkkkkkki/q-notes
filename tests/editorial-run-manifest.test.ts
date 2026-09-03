import { describe, expect, it } from 'vitest';
import {
  EDITORIAL_RUN_SCHEMA_VERSION,
  canTransitionExecutionStatus,
  canTransitionStage,
  invalidateCriticForSemanticEdit,
  isCriticApplicable,
  manifestRepoPath,
  renderEditorialRunAudit,
  validateEditorialRunManifest,
  type EditorialRunManifest,
} from '../worker/editorial-run-manifest';
import { reconstructLegacyEditorialRun } from '../worker/editorial-run-legacy';

function normalRun(): EditorialRunManifest {
  return {
    schemaVersion: EDITORIAL_RUN_SCHEMA_VERSION,
    runId: 'run-2026-09-04-001',
    stage: 'parity-checked',
    createdAt: '2026-09-04T00:00:00.000Z',
    updatedAt: '2026-09-04T00:05:00.000Z',
    semanticHeadSha: 'abc123',
    authorKernel: {
      positions: [{ text: 'The piece should stay narrow.', provenance: 'brief:12' }],
    },
    claims: [
      {
        claimId: 'C1',
        claim: 'Small editorial systems benefit from explicit state.',
        ownership: 'Q-explicit',
        sourceProvenance: ['brief:12'],
        evidenceRole: 'direct-evidence',
        inferenceDistance: 0,
        languageRequirement: 'EN+ZH',
        canonicalStatus: 'current',
      },
    ],
    materialAudit: { verdict: 'ready', notes: ['Enough author material for a Note.'] },
    formDecision: { publicTier: 'note', reason: 'One bounded claim.' },
    drafts: {
      en: { path: 'drafts/en.md', presentClaimIds: ['C1'] },
      zh: { path: 'drafts/zh.md', presentClaimIds: ['C1'] },
    },
    calibration: [
      { id: 'Q1', label: 'opening', options: [{ id: 'A', text: 'Direct' }, { id: 'B', text: 'Reflective' }] },
    ],
    hypotheses: [{ id: 'H1', claim: 'A possible extension', status: 'not-adopted' }],
    execution: { status: 'running', attempt: 1 },
  };
}

describe('EditorialRunManifest validation', () => {
  it('accepts a normal bilingual Note run', () => {
    expect(validateEditorialRunManifest(normalRun())).toEqual({ valid: true, errors: [] });
  });

  it('fails parity when a required claim is absent from one language', () => {
    const run = normalRun();
    run.drafts!.zh!.presentClaimIds = [];
    const result = validateEditorialRunManifest(run);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('parity: C1 missing from ZH draft record');
  });

  it('rejects missing/duplicate claim IDs and invalid inference parents', () => {
    const run = normalRun();
    run.claims!.push({
      ...run.claims![0],
      claim: 'Hedged extension',
      ownership: 'Model-hypothesis',
      inferenceDistance: 2,
      parentClaims: ['C99'],
    });
    const result = validateEditorialRunManifest(run);
    expect(result.errors.some((error) => error.includes('duplicate id C1'))).toBe(true);
    expect(result.errors.some((error) => error.includes('unknown parent claim C99'))).toBe(true);
  });

  it('binds critic results to the semantic head and invalidates on semantic edits', () => {
    const run = normalRun();
    run.stage = 'critic-complete';
    run.critic = {
      reviewedSemanticHeadSha: 'abc123',
      verdict: 'KEEP',
      strongestIdea: 'Explicit state removes protocol ambiguity.',
      blockingFailures: [],
      requiredCuts: [],
    };
    expect(isCriticApplicable(run)).toBe(true);
    expect(validateEditorialRunManifest(run).valid).toBe(true);

    const edited = invalidateCriticForSemanticEdit(run, 'def456');
    expect(edited.critic).toBeUndefined();
    expect(edited.stage).toBe('drafts-ready');
    expect(edited.semanticHeadSha).toBe('def456');
  });

  it('rejects author decisions that target a missing option or hypothesis', () => {
    const run = normalRun();
    run.authorDecisions = [
      { id: 'D1', sequence: 1, type: 'ab-choice', questionId: 'Q1', optionId: 'C' },
      { id: 'D2', sequence: 2, type: 'hypothesis-adopt', hypothesisId: 'H99' },
    ];
    const result = validateEditorialRunManifest(run);
    expect(result.errors).toContain('author decision D1: invalid A/B target');
    expect(result.errors).toContain('author decision D2: unknown hypothesis H99');
  });

  it('fails closed when a complete run still has unprocessed author feedback', () => {
    const run = normalRun();
    run.execution.status = 'complete';
    run.authorDecisions = [{ id: 'D1', sequence: 1, type: 'one-change', text: 'Cut the closer.' }];
    run.lastProcessedDecisionSequence = 0;
    expect(validateEditorialRunManifest(run).errors).toContain('complete runs cannot have pending author decisions');
  });
});

describe('state transitions and persistence', () => {
  it('allows only same/next editorial stage transitions', () => {
    expect(canTransitionStage('requested', 'author-kernel-ready')).toBe(true);
    expect(canTransitionStage('requested', 'claim-ledger-ready')).toBe(false);
    expect(canTransitionStage('claim-ledger-ready', 'requested')).toBe(false);
  });

  it('models retryable execution transitions explicitly', () => {
    expect(canTransitionExecutionStatus('running', 'blocked')).toBe(true);
    expect(canTransitionExecutionStatus('failed', 'running')).toBe(true);
    expect(canTransitionExecutionStatus('complete', 'running')).toBe(false);
  });

  it('keeps runtime artifacts under the non-public research namespace', () => {
    expect(manifestRepoPath('run-123')).toBe('research/.companion/runs/run-123.json');
    expect(() => manifestRepoPath('../escape')).toThrow();
  });
});

describe('audit rendering', () => {
  it('renders semantic sections from typed state without reparsing Markdown', () => {
    const run = normalRun();
    run.titleOptions = ['Typed state, readable audit'];
    run.voice = { verbatimSpine: ['keep this phrase'], untraceableFlags: ['possible overclaim'] };
    const markdown = renderEditorialRunAudit(run);
    expect(markdown).toContain('## Author Kernel');
    expect(markdown).toContain('## Claim Ledger');
    expect(markdown).toContain('## Material Audit');
    expect(markdown).toContain('## Form decision');
    expect(markdown).toContain('## Bilingual parity');
    expect(markdown).toContain('## Candidate hypotheses');
    expect(markdown).toContain('## A/B calibration');
    expect(markdown).toContain('## Title options');
  });
});

describe('legacy PR reconstruction', () => {
  it('preserves Desk-significant body fields and exact author decisions', () => {
    const body = `
## Form decision
- Public tier: note

## Verbatim spine
- keep this phrase

## Untraceable
- possible overclaim

## Candidate hypotheses — not yet yours
H1. Maybe the workflow should be event-driven
- Status: not adopted
H2. Maybe retries need a queue
- Status: not adopted

## A/B calibration
1. en opening
- A. Direct opening
- B. Reflective opening

## Title options
- Runtime, not ritual
- State before SDK
`;
    const run = reconstructLegacyEditorialRun({
      runId: 'legacy-pr-104',
      prBody: body,
      comments: [
        '**A/B calibration — Q1: B.** “Reflective opening”',
        '**Adopt hypothesis — H1**',
        '**Reject hypothesis — H2**',
      ],
      createdAt: '2026-08-20T00:00:00.000Z',
      updatedAt: '2026-08-21T00:00:00.000Z',
    });

    expect(run.legacy?.reconstructedFromPrBody).toBe(true);
    expect(run.formDecision?.publicTier).toBe('note');
    expect(run.voice?.verbatimSpine).toEqual(['keep this phrase']);
    expect(run.voice?.untraceableFlags).toEqual(['possible overclaim']);
    expect(run.titleOptions).toEqual(['Runtime, not ritual', 'State before SDK']);
    expect(run.calibration?.[0].options[1]).toEqual({ id: 'B', text: 'Reflective opening' });
    expect(run.hypotheses?.map((h) => h.status)).toEqual(['adopted', 'rejected']);
    expect(run.authorDecisions).toEqual([
      { id: 'legacy-ab-1', sequence: 1, type: 'ab-choice', questionId: 'Q1', optionId: 'B' },
      { id: 'legacy-adopt-2', sequence: 2, type: 'hypothesis-adopt', hypothesisId: 'H1' },
      { id: 'legacy-reject-3', sequence: 3, type: 'hypothesis-reject', hypothesisId: 'H2' },
    ]);
    expect(run.execution.status).toBe('blocked');
  });

  it('treats malformed legacy Markdown as reconstruction with no invented semantic state', () => {
    const run = reconstructLegacyEditorialRun({
      runId: 'legacy-malformed',
      prBody: 'free-form prose with no recognized machine sections',
      createdAt: '2026-08-20T00:00:00.000Z',
      updatedAt: '2026-08-20T00:00:00.000Z',
    });
    expect(run.stage).toBe('requested');
    expect(run.formDecision).toBeUndefined();
    expect(run.calibration).toEqual([]);
    expect(run.hypotheses).toEqual([]);
    expect(run.execution.status).toBe('pending');
  });
});
