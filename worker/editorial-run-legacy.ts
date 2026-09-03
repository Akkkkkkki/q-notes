import {
  decidedHypotheses,
  parseAbQuestions,
  parseHypotheses,
  parsePrBody,
} from './desk';
import {
  EDITORIAL_RUN_SCHEMA_VERSION,
  type AuthorDecision,
  type EditorialRunManifest,
  type PublicTier,
} from './editorial-run-manifest';

/**
 * Compatibility adapter for pre-manifest content PRs.
 *
 * It intentionally reuses the existing tolerant Desk parsers instead of adding
 * another Markdown protocol. New runtime behavior should consume
 * EditorialRunManifest directly; this path exists only for live/legacy PRs.
 */
export function reconstructLegacyEditorialRun(input: {
  runId: string;
  prBody: string;
  comments?: string[];
  createdAt: string;
  updatedAt: string;
  semanticHeadSha?: string;
}): EditorialRunManifest {
  const comments = input.comments ?? [];
  const body = parsePrBody(input.prBody);
  const questions = parseAbQuestions(input.prBody);
  const hypotheses = parseHypotheses(input.prBody);
  const decided = decidedHypotheses(comments);
  const adopted = new Set(decided.adopted);
  const rejected = new Set(decided.rejected);
  const decisions = parseLegacyDecisions(comments, questions.map((q) => q.n));
  const tier = toTier(body.tier);

  return {
    schemaVersion: EDITORIAL_RUN_SCHEMA_VERSION,
    runId: input.runId,
    // A reconstructed body can preserve known fields, but it cannot prove that
    // earlier pipeline stages ran successfully. Keep it at the initial stage
    // until a migrated runtime explicitly advances it.
    stage: 'requested',
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    semanticHeadSha: input.semanticHeadSha,
    formDecision: tier ? { publicTier: tier, reason: 'Reconstructed from legacy PR body' } : undefined,
    calibration: questions.map((question) => ({
      id: `Q${question.n}`,
      label: question.label,
      options: question.options.map((option) => ({ id: option.letter, text: option.text })),
    })),
    hypotheses: hypotheses.map((hypothesis) => ({
      id: `H${hypothesis.n}`,
      claim: hypothesis.text,
      status: adopted.has(hypothesis.n)
        ? 'adopted'
        : rejected.has(hypothesis.n)
          ? 'rejected'
          : 'not-adopted',
    })),
    titleOptions: body.titleOptions,
    voice: { verbatimSpine: body.spine, untraceableFlags: body.flags },
    authorDecisions: decisions,
    // Reconstruction cannot prove that a later ship-gate verdict consumed every
    // decision without replaying the full gate protocol, so fail closed: all
    // reconstructed decisions remain pending until a migrated run records its
    // own processed sequence.
    lastProcessedDecisionSequence: 0,
    execution: { status: decisions.length ? 'blocked' : 'pending', attempt: 1, lastEvent: 'legacy-reconstruction' },
    legacy: { reconstructedFromPrBody: true },
  };
}

function parseLegacyDecisions(comments: string[], questionNumbers: number[]): AuthorDecision[] {
  const validQuestions = new Set(questionNumbers);
  const decisions: AuthorDecision[] = [];
  for (const comment of comments) {
    const ab = comment.match(/\*\*A\/B[^*]*?Q(\d+)[:：]\s*([A-E])/i);
    if (ab && validQuestions.has(Number(ab[1]))) {
      decisions.push({
        id: `legacy-ab-${decisions.length + 1}`,
        sequence: decisions.length + 1,
        type: 'ab-choice',
        questionId: `Q${Number(ab[1])}`,
        optionId: ab[2].toUpperCase(),
      });
      continue;
    }
    const adopt = comment.match(/\*\*Adopt hypothesis\s*—\s*H?(\d+)/i);
    if (adopt) {
      decisions.push({
        id: `legacy-adopt-${decisions.length + 1}`,
        sequence: decisions.length + 1,
        type: 'hypothesis-adopt',
        hypothesisId: `H${Number(adopt[1])}`,
      });
      continue;
    }
    const reject = comment.match(/\*\*Reject hypothesis\s*—\s*H?(\d+)/i);
    if (reject) {
      decisions.push({
        id: `legacy-reject-${decisions.length + 1}`,
        sequence: decisions.length + 1,
        type: 'hypothesis-reject',
        hypothesisId: `H${Number(reject[1])}`,
      });
    }
  }
  return decisions;
}

function toTier(value: string | null): PublicTier | null {
  return value === 'note' || value === 'essay' || value === 'tracker' ? value : null;
}
