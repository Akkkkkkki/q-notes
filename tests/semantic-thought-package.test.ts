import { describe, expect, it } from 'vitest';
import {
  SEMANTIC_THOUGHT_SCHEMA_VERSION,
  semanticThoughtRepoPath,
  toSemanticThoughtCompilationInput,
  validateSemanticThoughtPackage,
  type SemanticThoughtPackage,
} from '../worker/semantic-thought-package';

function thoughtFixture(): SemanticThoughtPackage {
  return {
    schemaVersion: SEMANTIC_THOUGHT_SCHEMA_VERSION,
    thoughtId: 'T17-agent-role-allocation',
    createdAt: '2026-09-05T00:00:00.000Z',
    updatedAt: '2026-09-05T00:05:00.000Z',
    status: 'developing',
    origin: [
      {
        id: 'O1',
        type: 'direct-author-input',
        ref: 'inbox:2026-09-05:1',
        summary: 'Author observation about delegated coding work.',
        visibility: 'private',
      },
    ],
    question: 'Does agent delegation change what engineers spend their time doing?',
    currentSpine: 'Task compression does not by itself establish durable role reallocation.',
    authorKernel: {
      firsthand: [
        {
          text: 'Several implementation tasks recently needed much less manual coding.',
          provenance: 'inbox:2026-09-05:1',
        },
      ],
      unresolved: [
        {
          text: 'It is unclear where the saved time actually goes.',
          provenance: 'inbox:2026-09-05:1',
        },
      ],
    },
    claims: [
      {
        claimId: 'C1',
        claim: 'Some recent coding tasks required less manual implementation work.',
        ownership: 'Q-explicit',
        sourceProvenance: ['inbox:2026-09-05:1'],
        inferenceDistance: 0,
        languageRequirement: 'EN+ZH',
        canonicalStatus: 'current',
      },
      {
        claimId: 'C2',
        claim: 'Saved implementation time may shift toward coordination work.',
        ownership: 'Model-hypothesis',
        sourceProvenance: ['model:T17'],
        inferenceDistance: 2,
        parentClaims: ['C1'],
        languageRequirement: 'EN+ZH',
      },
    ],
    uncertainties: [
      {
        id: 'U1',
        text: 'The destination of saved implementation time is unresolved.',
        targetClaimIds: ['C2'],
      },
    ],
    assumptions: [
      {
        id: 'A1',
        text: 'Demand remains high enough that saved time is reallocated rather than removed.',
        ownership: 'Model-hypothesis',
        targetClaimIds: ['C2'],
      },
    ],
    alternatives: [
      {
        id: 'ALT1',
        text: 'Agents may increase implementation scope per engineer rather than shift work toward coordination.',
        ownership: 'Model-hypothesis',
        targetClaimIds: ['C2'],
      },
    ],
    evidenceGaps: [
      {
        id: 'E1',
        text: 'Observed time allocation after agent delegation.',
        targetClaimIds: ['C2'],
        answerableBy: 'author',
      },
    ],
    rejectionRefs: ['R-014'],
    correctionRefs: ['CORR-009'],
    authorDecisions: [
      {
        id: 'D1',
        createdAt: '2026-09-05T00:04:00.000Z',
        type: 'leave-unresolved',
        targetRefs: ['U1'],
        note: 'Keep this as a question until there is concrete time-allocation evidence.',
      },
    ],
    relatedThoughts: [{ thoughtId: 'T12-task-compression', type: 'narrows' }],
    compilationHistory: [
      {
        id: 'COMP1',
        createdAt: '2026-09-05T00:05:00.000Z',
        artifactType: 'unresolved-memo',
        claimIds: ['C1'],
        runId: 'run-T17-v1',
        sourceRef: 'git:fixture-sha',
      },
    ],
  };
}

describe('SemanticThoughtPackage', () => {
  it('accepts a durable developing thought with unresolved model hypotheses', () => {
    expect(validateSemanticThoughtPackage(thoughtFixture())).toEqual({ valid: true, errors: [] });
  });

  it('reuses EditorialRunManifest claim validation instead of forking claim semantics', () => {
    const thought = thoughtFixture();
    thought.claims[1].parentClaims = ['C99'];

    const result = validateSemanticThoughtPackage(thought);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes('unknown parent claim C99'))).toBe(true);
  });

  it('requires durable origin provenance and validates semantic references', () => {
    const thought = thoughtFixture();
    thought.origin = [];
    thought.uncertainties![0].targetClaimIds = ['C404'];
    thought.compilationHistory![0].claimIds = ['C404'];

    const result = validateSemanticThoughtPackage(thought);

    expect(result.errors).toContain('at least one origin is required');
    expect(result.errors).toContain('uncertainties U1: unknown claim C404');
    expect(result.errors).toContain('compilation COMP1: unknown claim C404');
  });

  it('keeps package persistence on a private repo-backed path', () => {
    expect(semanticThoughtRepoPath('T17-agent-role-allocation')).toBe(
      'research/.companion/thoughts/T17-agent-role-allocation.json',
    );
    expect(() => semanticThoughtRepoPath('../public-post')).toThrow('unsafe path characters');
  });

  it('creates a stable recompilation input without prior run or artifact history', () => {
    const thought = thoughtFixture();

    const first = toSemanticThoughtCompilationInput(thought);
    const second = toSemanticThoughtCompilationInput(thought);

    expect(first).toEqual(second);
    expect(first.claims[1].ownership).toBe('Model-hypothesis');
    expect(first.alternatives[0].ownership).toBe('Model-hypothesis');
    expect(first).not.toHaveProperty('compilationHistory');
    expect(first).not.toHaveProperty('authorDecisions');
    expect(first).not.toHaveProperty('status');
  });

  it('does not let callers mutate the source package through compilation input', () => {
    const thought = thoughtFixture();
    const input = toSemanticThoughtCompilationInput(thought);

    input.claims[0].claim = 'mutated copy';
    input.origin[0].ref = 'changed';

    expect(thought.claims[0].claim).toBe(
      'Some recent coding tasks required less manual implementation work.',
    );
    expect(thought.origin[0].ref).toBe('inbox:2026-09-05:1');
  });

  it('rejects self-relations and unsafe package identifiers', () => {
    const thought = thoughtFixture();
    thought.thoughtId = '../T17';
    thought.relatedThoughts = [{ thoughtId: '../T17', type: 'related' }];

    const result = validateSemanticThoughtPackage(thought);

    expect(result.errors).toContain('thoughtId contains unsafe path characters');
    expect(result.errors).toContain('relatedThoughts cannot reference the package itself');
  });
});
