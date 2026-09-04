import {
  EDITORIAL_RUN_SCHEMA_VERSION,
  validateEditorialRunManifest,
  type AuthorKernel,
  type ClaimOwnership,
  type EditorialClaim,
  type ValidationResult,
} from './editorial-run-manifest';

export const SEMANTIC_THOUGHT_SCHEMA_VERSION = 1 as const;

export const THOUGHT_STATUSES = [
  'seed',
  'developing',
  'blocked',
  'ready-for-material-audit',
  'resolved',
  'rejected',
  'dormant',
] as const;

export type ThoughtStatus = (typeof THOUGHT_STATUSES)[number];

export type ThoughtOriginType =
  | 'inbox-spark'
  | 'interview-answer'
  | 'direct-author-input'
  | 'current-position'
  | 'archived-position'
  | 'external-source'
  | 'model-hypothesis'
  | 'author-correction'
  | 'rejection-record'
  | 'article-claim';

export type ThoughtVisibility = 'public' | 'private' | 'confidential';

export interface ThoughtOrigin {
  id: string;
  type: ThoughtOriginType;
  ref: string;
  summary?: string;
  visibility?: ThoughtVisibility;
}

export interface ThoughtUncertainty {
  id: string;
  text: string;
  targetClaimIds?: string[];
}

export interface ThoughtAssumption {
  id: string;
  text: string;
  ownership: ClaimOwnership;
  targetClaimIds?: string[];
}

export interface AlternativeMechanism {
  id: string;
  text: string;
  ownership: ClaimOwnership;
  targetClaimIds?: string[];
}

export interface EvidenceGap {
  id: string;
  text: string;
  targetClaimIds?: string[];
  answerableBy: 'research' | 'author' | 'either';
}

export interface ThoughtDecision {
  id: string;
  createdAt: string;
  type: 'adopt' | 'reject' | 'narrow' | 'leave-unresolved' | 'block' | 'resume';
  targetRefs: string[];
  note?: string;
}

export interface ThoughtRelation {
  thoughtId: string;
  type: 'extends' | 'narrows' | 'contradicts' | 'corrects' | 'supports' | 'related';
}

export interface CompilationRecord {
  id: string;
  createdAt: string;
  artifactType: 'note' | 'essay' | 'tracker' | 'unresolved-memo';
  claimIds: string[];
  runId?: string;
  pr?: number;
  translationKey?: string;
  sourceRef?: string;
}

export interface SemanticThoughtPackage {
  schemaVersion: typeof SEMANTIC_THOUGHT_SCHEMA_VERSION;
  thoughtId: string;
  createdAt: string;
  updatedAt: string;
  status: ThoughtStatus;
  origin: ThoughtOrigin[];
  question?: string;
  currentSpine?: string;
  authorKernel?: AuthorKernel;
  claims: EditorialClaim[];
  uncertainties?: ThoughtUncertainty[];
  assumptions?: ThoughtAssumption[];
  alternatives?: AlternativeMechanism[];
  authorDecisions?: ThoughtDecision[];
  rejectionRefs?: string[];
  correctionRefs?: string[];
  evidenceGaps?: EvidenceGap[];
  relatedThoughts?: ThoughtRelation[];
  compilationHistory?: CompilationRecord[];
}

export interface SemanticThoughtCompilationInput {
  schemaVersion: typeof SEMANTIC_THOUGHT_SCHEMA_VERSION;
  thoughtId: string;
  sourceUpdatedAt: string;
  origin: ThoughtOrigin[];
  question?: string;
  currentSpine?: string;
  authorKernel?: AuthorKernel;
  claims: EditorialClaim[];
  uncertainties: ThoughtUncertainty[];
  assumptions: ThoughtAssumption[];
  alternatives: AlternativeMechanism[];
  evidenceGaps: EvidenceGap[];
  rejectionRefs: string[];
  correctionRefs: string[];
}

const ORIGIN_TYPES: ThoughtOriginType[] = [
  'inbox-spark',
  'interview-answer',
  'direct-author-input',
  'current-position',
  'archived-position',
  'external-source',
  'model-hypothesis',
  'author-correction',
  'rejection-record',
  'article-claim',
];

const VISIBILITIES: ThoughtVisibility[] = ['public', 'private', 'confidential'];
const OWNERSHIPS: ClaimOwnership[] = ['Q-explicit', 'Q-derived', 'External', 'Model-hypothesis'];

export function semanticThoughtRepoPath(thoughtId: string): string {
  if (!safeId(thoughtId)) throw new Error('thoughtId contains unsafe path characters');
  return `research/.companion/thoughts/${thoughtId}.json`;
}

/**
 * Returns a deterministic semantic input package for future runtime/model runs.
 * Runtime history and prior compilation outputs are intentionally excluded so
 * they cannot silently become source material for a new compilation.
 */
export function toSemanticThoughtCompilationInput(
  thought: SemanticThoughtPackage,
): SemanticThoughtCompilationInput {
  return cloneJson({
    schemaVersion: thought.schemaVersion,
    thoughtId: thought.thoughtId,
    sourceUpdatedAt: thought.updatedAt,
    origin: thought.origin,
    question: thought.question,
    currentSpine: thought.currentSpine,
    authorKernel: thought.authorKernel,
    claims: thought.claims,
    uncertainties: thought.uncertainties ?? [],
    assumptions: thought.assumptions ?? [],
    alternatives: thought.alternatives ?? [],
    evidenceGaps: thought.evidenceGaps ?? [],
    rejectionRefs: thought.rejectionRefs ?? [],
    correctionRefs: thought.correctionRefs ?? [],
  });
}

export function validateSemanticThoughtPackage(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['thought package must be an object'] };

  const thought = value as Partial<SemanticThoughtPackage>;
  if (thought.schemaVersion !== SEMANTIC_THOUGHT_SCHEMA_VERSION) errors.push('schemaVersion must be 1');
  if (!nonEmpty(thought.thoughtId)) errors.push('thoughtId is required');
  else if (!safeId(thought.thoughtId)) errors.push('thoughtId contains unsafe path characters');
  if (!isIsoDate(thought.createdAt)) errors.push('createdAt must be an ISO date');
  if (!isIsoDate(thought.updatedAt)) errors.push('updatedAt must be an ISO date');
  if (
    isIsoDate(thought.createdAt) &&
    isIsoDate(thought.updatedAt) &&
    Date.parse(thought.updatedAt) < Date.parse(thought.createdAt)
  ) {
    errors.push('updatedAt cannot be before createdAt');
  }
  if (!THOUGHT_STATUSES.includes(thought.status as ThoughtStatus)) errors.push('status is invalid');

  const origins = Array.isArray(thought.origin) ? thought.origin : [];
  if (!origins.length) errors.push('at least one origin is required');
  uniqueIds(origins, 'origin', errors);
  for (const origin of origins) {
    if (!ORIGIN_TYPES.includes(origin.type)) errors.push(`origin ${origin.id || '?'}: type is invalid`);
    if (!nonEmpty(origin.ref)) errors.push(`origin ${origin.id || '?'}: ref is required`);
    if (origin.visibility !== undefined && !VISIBILITIES.includes(origin.visibility)) {
      errors.push(`origin ${origin.id || '?'}: visibility is invalid`);
    }
  }

  const claims = Array.isArray(thought.claims) ? thought.claims : [];
  const claimValidation = validateEditorialRunManifest({
    schemaVersion: EDITORIAL_RUN_SCHEMA_VERSION,
    runId: 'thought-package-claim-validation',
    stage: 'claim-ledger-ready',
    createdAt: thought.createdAt,
    updatedAt: thought.updatedAt,
    claims,
    execution: { status: 'pending', attempt: 1 },
  });
  errors.push(...claimValidation.errors.map((error) => `claims: ${error}`));
  const claimIds = new Set(claims.map((claim) => claim.claimId).filter(nonEmpty));

  const uncertainties = Array.isArray(thought.uncertainties) ? thought.uncertainties : [];
  validateTargetedRecords(uncertainties, 'uncertainties', claimIds, errors);

  const assumptions = Array.isArray(thought.assumptions) ? thought.assumptions : [];
  validateTargetedRecords(assumptions, 'assumptions', claimIds, errors);
  for (const assumption of assumptions) {
    if (!OWNERSHIPS.includes(assumption.ownership)) {
      errors.push(`assumption ${assumption.id || '?'}: ownership is invalid`);
    }
  }

  const alternatives = Array.isArray(thought.alternatives) ? thought.alternatives : [];
  validateTargetedRecords(alternatives, 'alternatives', claimIds, errors);
  for (const alternative of alternatives) {
    if (!OWNERSHIPS.includes(alternative.ownership)) {
      errors.push(`alternative ${alternative.id || '?'}: ownership is invalid`);
    }
  }

  const evidenceGaps = Array.isArray(thought.evidenceGaps) ? thought.evidenceGaps : [];
  validateTargetedRecords(evidenceGaps, 'evidenceGaps', claimIds, errors);
  for (const gap of evidenceGaps) {
    if (!['research', 'author', 'either'].includes(gap.answerableBy)) {
      errors.push(`evidence gap ${gap.id || '?'}: answerableBy is invalid`);
    }
  }

  const decisions = Array.isArray(thought.authorDecisions) ? thought.authorDecisions : [];
  uniqueIds(decisions, 'authorDecisions', errors);
  for (const decision of decisions) {
    if (!isIsoDate(decision.createdAt)) errors.push(`author decision ${decision.id || '?'}: createdAt must be an ISO date`);
    if (!['adopt', 'reject', 'narrow', 'leave-unresolved', 'block', 'resume'].includes(decision.type)) {
      errors.push(`author decision ${decision.id || '?'}: type is invalid`);
    }
    if (!Array.isArray(decision.targetRefs) || decision.targetRefs.some((ref) => !nonEmpty(ref))) {
      errors.push(`author decision ${decision.id || '?'}: targetRefs must contain non-empty refs`);
    }
  }

  validateStringRefs(thought.rejectionRefs, 'rejectionRefs', errors);
  validateStringRefs(thought.correctionRefs, 'correctionRefs', errors);

  const relations = Array.isArray(thought.relatedThoughts) ? thought.relatedThoughts : [];
  for (const relation of relations) {
    if (!nonEmpty(relation.thoughtId)) errors.push('relatedThoughts: thoughtId is required');
    if (relation.thoughtId === thought.thoughtId) errors.push('relatedThoughts cannot reference the package itself');
    if (!['extends', 'narrows', 'contradicts', 'corrects', 'supports', 'related'].includes(relation.type)) {
      errors.push(`related thought ${relation.thoughtId || '?'}: type is invalid`);
    }
  }

  const compilations = Array.isArray(thought.compilationHistory) ? thought.compilationHistory : [];
  uniqueIds(compilations, 'compilationHistory', errors);
  for (const compilation of compilations) {
    if (!isIsoDate(compilation.createdAt)) errors.push(`compilation ${compilation.id || '?'}: createdAt must be an ISO date`);
    if (!['note', 'essay', 'tracker', 'unresolved-memo'].includes(compilation.artifactType)) {
      errors.push(`compilation ${compilation.id || '?'}: artifactType is invalid`);
    }
    if (!Array.isArray(compilation.claimIds)) {
      errors.push(`compilation ${compilation.id || '?'}: claimIds are required`);
      continue;
    }
    for (const claimId of compilation.claimIds) {
      if (!claimIds.has(claimId)) errors.push(`compilation ${compilation.id || '?'}: unknown claim ${claimId}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateTargetedRecords(
  records: Array<{ id: string; text: string; targetClaimIds?: string[] }>,
  label: string,
  claimIds: Set<string>,
  errors: string[],
): void {
  uniqueIds(records, label, errors);
  for (const record of records) {
    if (!nonEmpty(record.text)) errors.push(`${label} ${record.id || '?'}: text is required`);
    for (const claimId of record.targetClaimIds ?? []) {
      if (!claimIds.has(claimId)) errors.push(`${label} ${record.id || '?'}: unknown claim ${claimId}`);
    }
  }
}

function validateStringRefs(value: string[] | undefined, label: string, errors: string[]): void {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.some((ref) => !nonEmpty(ref))) {
    errors.push(`${label} must contain non-empty refs`);
  }
}

function uniqueIds(records: Array<{ id: string }>, label: string, errors: string[]): void {
  const ids = new Set<string>();
  for (const record of records) {
    if (!nonEmpty(record.id)) {
      errors.push(`${label}: id is required`);
      continue;
    }
    if (ids.has(record.id)) errors.push(`${label}: duplicate id ${record.id}`);
    ids.add(record.id);
  }
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function safeId(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoDate(value: unknown): value is string {
  return nonEmpty(value) && !Number.isNaN(Date.parse(value));
}
