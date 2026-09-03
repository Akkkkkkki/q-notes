export const EDITORIAL_RUN_SCHEMA_VERSION = 1 as const;

export type ClaimOwnership = 'Q-explicit' | 'Q-derived' | 'External' | 'Model-hypothesis';
export type EvidenceRole = 'direct-evidence' | 'example' | 'counterexample' | 'context' | 'analogy' | 'hypothesis-source';
export type InferenceDistance = 0 | 1 | 2 | '3+';
export type LanguageRequirement = 'EN' | 'ZH' | 'EN+ZH';
export type CanonicalStatus = 'current' | 'context-only' | 'superseded' | 'archived';
export type PublicTier = 'note' | 'essay' | 'tracker';
export type CriticVerdict = 'KEEP' | 'CUT' | 'DOWNGRADE' | 'SPLIT' | 'SKIP';

export const EDITORIAL_STAGES = [
  'requested',
  'author-kernel-ready',
  'claim-ledger-ready',
  'material-audit-ready',
  'form-decided',
  'drafts-ready',
  'parity-checked',
  'deterministic-gates-complete',
  'pr-created',
  'critic-complete',
  'complete',
] as const;
export type EditorialStage = (typeof EDITORIAL_STAGES)[number];
export type ExecutionStatus = 'pending' | 'running' | 'blocked' | 'failed' | 'complete';

export interface AuthorKernelItem { text: string; provenance: string }
export interface AuthorKernel {
  positions?: AuthorKernelItem[];
  firsthand?: AuthorKernelItem[];
  domainLimits?: AuthorKernelItem[];
  unresolved?: AuthorKernelItem[];
  verbatimSpine?: AuthorKernelItem[];
}
export interface EditorialClaim {
  claimId: string;
  claim: string;
  ownership: ClaimOwnership;
  sourceProvenance: string[];
  evidenceRole?: EvidenceRole;
  inferenceDistance?: InferenceDistance;
  parentClaims?: string[];
  languageRequirement: LanguageRequirement;
  canonicalStatus?: CanonicalStatus;
}
export interface MaterialAudit { verdict: 'ready' | 'blocked' | 'no-shippable-piece'; notes: string[] }
export interface FormDecision { publicTier: PublicTier; reason: string }
export interface DraftArtifact { path: string; sha?: string; presentClaimIds: string[] }
export interface CalibrationQuestion { id: string; label: string; options: Array<{ id: string; text: string }> }
export interface CandidateHypothesis { id: string; claim: string; status: 'not-adopted' | 'adopted' | 'rejected' }
export interface CriticFinding { message: string; claimIds?: string[] }
export interface CriticResult {
  reviewedSemanticHeadSha: string;
  verdict: CriticVerdict;
  strongestIdea: string;
  blockingFailures: CriticFinding[];
  requiredCuts: CriticFinding[];
  optionalWarnings?: CriticFinding[];
}
export type AuthorDecision =
  | { id: string; sequence: number; type: 'ab-choice'; questionId: string; optionId: string }
  | { id: string; sequence: number; type: 'hypothesis-adopt'; hypothesisId: string }
  | { id: string; sequence: number; type: 'hypothesis-reject'; hypothesisId: string }
  | { id: string; sequence: number; type: 'one-change'; text: string };

export interface EditorialRunManifest {
  schemaVersion: typeof EDITORIAL_RUN_SCHEMA_VERSION;
  runId: string;
  translationKey?: string;
  stage: EditorialStage;
  createdAt: string;
  updatedAt: string;
  semanticHeadSha?: string;
  source?: { briefPath?: string; backlogItemId?: string; sourceRef?: string };
  authorKernel?: AuthorKernel;
  claims?: EditorialClaim[];
  materialAudit?: MaterialAudit;
  formDecision?: FormDecision;
  drafts?: { en?: DraftArtifact; zh?: DraftArtifact };
  calibration?: CalibrationQuestion[];
  hypotheses?: CandidateHypothesis[];
  titleOptions?: string[];
  voice?: { verbatimSpine: string[]; untraceableFlags: string[] };
  critic?: CriticResult;
  authorDecisions?: AuthorDecision[];
  lastProcessedDecisionSequence?: number;
  execution: {
    status: ExecutionStatus;
    attempt: number;
    lastEvent?: string;
    error?: { code: string; message: string; retryable?: boolean };
  };
  legacy?: { reconstructedFromPrBody: true };
}

export interface ValidationResult { valid: boolean; errors: string[] }

const STAGE_INDEX = new Map(EDITORIAL_STAGES.map((stage, index) => [stage, index]));
const EXECUTION_TRANSITIONS: Record<ExecutionStatus, ExecutionStatus[]> = {
  pending: ['running', 'failed'], running: ['blocked', 'failed', 'complete'], blocked: ['running', 'failed'], failed: ['running'], complete: [],
};

export function manifestRepoPath(runId: string): string {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(runId)) throw new Error('runId contains unsafe path characters');
  return `research/.companion/runs/${runId}.json`;
}

export function canTransitionStage(from: EditorialStage, to: EditorialStage): boolean {
  const a = STAGE_INDEX.get(from)!;
  const b = STAGE_INDEX.get(to)!;
  return b === a || b === a + 1;
}

export function canTransitionExecutionStatus(from: ExecutionStatus, to: ExecutionStatus): boolean {
  return from === to || EXECUTION_TRANSITIONS[from].includes(to);
}

export function pendingAuthorDecisionCount(manifest: EditorialRunManifest): number {
  const processed = manifest.lastProcessedDecisionSequence ?? 0;
  return (manifest.authorDecisions ?? []).filter((decision) => decision.sequence > processed).length;
}

export function isCriticApplicable(manifest: EditorialRunManifest): boolean {
  return Boolean(manifest.critic && manifest.semanticHeadSha && manifest.critic.reviewedSemanticHeadSha === manifest.semanticHeadSha);
}

export function invalidateCriticForSemanticEdit(manifest: EditorialRunManifest, nextSemanticHeadSha: string): EditorialRunManifest {
  return {
    ...manifest,
    updatedAt: new Date().toISOString(),
    semanticHeadSha: nextSemanticHeadSha,
    critic: undefined,
    stage: STAGE_INDEX.get(manifest.stage)! > STAGE_INDEX.get('drafts-ready')! ? 'drafts-ready' : manifest.stage,
  };
}

export function validateEditorialRunManifest(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['manifest must be an object'] };
  const manifest = value as Partial<EditorialRunManifest>;
  if (manifest.schemaVersion !== EDITORIAL_RUN_SCHEMA_VERSION) errors.push('schemaVersion must be 1');
  if (!nonEmpty(manifest.runId)) errors.push('runId is required');
  if (!EDITORIAL_STAGES.includes(manifest.stage as EditorialStage)) errors.push('stage is invalid');
  if (!isIsoDate(manifest.createdAt)) errors.push('createdAt must be an ISO date');
  if (!isIsoDate(manifest.updatedAt)) errors.push('updatedAt must be an ISO date');
  if (!isRecord(manifest.execution)) errors.push('execution is required');
  else {
    if (!['pending', 'running', 'blocked', 'failed', 'complete'].includes(String(manifest.execution.status))) errors.push('execution.status is invalid');
    if (!Number.isInteger(manifest.execution.attempt) || Number(manifest.execution.attempt) < 1) errors.push('execution.attempt must be a positive integer');
  }

  const claims = Array.isArray(manifest.claims) ? manifest.claims : [];
  const claimIds = uniqueIds(claims, 'claimId', 'claims', errors);
  for (const claim of claims) {
    if (!nonEmpty(claim.claim)) errors.push(`claim ${claim.claimId || '?'}: claim text is required`);
    if (!['Q-explicit', 'Q-derived', 'External', 'Model-hypothesis'].includes(claim.ownership)) errors.push(`claim ${claim.claimId || '?'}: ownership is invalid`);
    if (!Array.isArray(claim.sourceProvenance) || claim.sourceProvenance.some((item) => !nonEmpty(item))) errors.push(`claim ${claim.claimId || '?'}: sourceProvenance must contain non-empty refs`);
    if (!['EN', 'ZH', 'EN+ZH'].includes(claim.languageRequirement)) errors.push(`claim ${claim.claimId || '?'}: languageRequirement is invalid`);
    for (const parent of claim.parentClaims ?? []) if (!claimIds.has(parent)) errors.push(`claim ${claim.claimId}: unknown parent claim ${parent}`);
    if ((claim.inferenceDistance === 2 || claim.inferenceDistance === '3+') && !claim.parentClaims?.length) errors.push(`claim ${claim.claimId}: distance-2+ claims require parentClaims`);
  }

  const hypotheses = Array.isArray(manifest.hypotheses) ? manifest.hypotheses : [];
  const hypothesisIds = uniqueIds(hypotheses, 'id', 'hypotheses', errors);
  const calibration = Array.isArray(manifest.calibration) ? manifest.calibration : [];
  const questionIds = uniqueIds(calibration, 'id', 'calibration', errors);
  for (const question of calibration) {
    if (!Array.isArray(question.options) || question.options.length < 2) errors.push(`calibration ${question.id}: at least two options are required`);
    else uniqueIds(question.options, 'id', `calibration ${question.id} options`, errors);
  }

  const decisions = Array.isArray(manifest.authorDecisions) ? manifest.authorDecisions : [];
  uniqueIds(decisions, 'id', 'authorDecisions', errors);
  const sequences = new Set<number>();
  for (const decision of decisions) {
    if (!Number.isInteger(decision.sequence) || decision.sequence < 1 || sequences.has(decision.sequence)) errors.push(`author decision ${decision.id}: sequence must be a unique positive integer`);
    sequences.add(decision.sequence);
    if ((decision.type === 'hypothesis-adopt' || decision.type === 'hypothesis-reject') && !hypothesisIds.has(decision.hypothesisId)) errors.push(`author decision ${decision.id}: unknown hypothesis ${decision.hypothesisId}`);
    if (decision.type === 'ab-choice') {
      const question = calibration.find((candidate) => candidate.id === decision.questionId);
      if (!questionIds.has(decision.questionId) || !question?.options.some((o) => o.id === decision.optionId)) errors.push(`author decision ${decision.id}: invalid A/B target`);
    }
  }
  if (manifest.lastProcessedDecisionSequence !== undefined && (!Number.isInteger(manifest.lastProcessedDecisionSequence) || manifest.lastProcessedDecisionSequence < 0)) errors.push('lastProcessedDecisionSequence must be a non-negative integer');
  if (manifest.execution?.status === 'complete' && pendingAuthorDecisionCount(manifest as EditorialRunManifest) > 0) errors.push('complete runs cannot have pending author decisions');

  if (stageAtLeast(manifest.stage, 'parity-checked')) {
    const enClaims = new Set(manifest.drafts?.en?.presentClaimIds ?? []);
    const zhClaims = new Set(manifest.drafts?.zh?.presentClaimIds ?? []);
    for (const claim of claims.filter((item) => item.languageRequirement === 'EN+ZH')) {
      if (!enClaims.has(claim.claimId)) errors.push(`parity: ${claim.claimId} missing from EN draft record`);
      if (!zhClaims.has(claim.claimId)) errors.push(`parity: ${claim.claimId} missing from ZH draft record`);
    }
  }
  if (manifest.critic) {
    if (!nonEmpty(manifest.critic.reviewedSemanticHeadSha)) errors.push('critic.reviewedSemanticHeadSha is required');
    if (!nonEmpty(manifest.semanticHeadSha)) errors.push('semanticHeadSha is required when critic exists');
    if (!isCriticApplicable(manifest as EditorialRunManifest)) errors.push('critic result is stale for the current semanticHeadSha');
  }
  if (stageAtLeast(manifest.stage, 'material-audit-ready') && !manifest.materialAudit) errors.push('materialAudit is required at this stage');
  if (stageAtLeast(manifest.stage, 'form-decided') && !manifest.formDecision) errors.push('formDecision is required at this stage');
  if (stageAtLeast(manifest.stage, 'drafts-ready') && (!manifest.drafts?.en || !manifest.drafts?.zh)) errors.push('both EN and ZH draft artifacts are required at this stage');
  return { valid: errors.length === 0, errors };
}

export function renderEditorialRunAudit(manifest: EditorialRunManifest): string {
  const lines: string[] = ['## Editorial run', '', `- Run: \`${manifest.runId}\``, `- Stage: ${manifest.stage}`];
  if (manifest.semanticHeadSha) lines.push(`- Semantic head: \`${manifest.semanticHeadSha}\``);
  if (manifest.authorKernel) {
    lines.push('', '## Author Kernel', '');
    renderKernel(lines, 'Positions', manifest.authorKernel.positions);
    renderKernel(lines, 'Firsthand', manifest.authorKernel.firsthand);
    renderKernel(lines, 'Domain limits', manifest.authorKernel.domainLimits);
    renderKernel(lines, 'Unresolved', manifest.authorKernel.unresolved);
  }
  if (manifest.claims?.length) {
    lines.push('', '## Claim Ledger', '', '| ID | Claim | Ownership | Evidence | Distance | Languages |', '|---|---|---|---|---|---|');
    for (const claim of manifest.claims) lines.push(`| ${escapeCell(claim.claimId)} | ${escapeCell(claim.claim)} | ${claim.ownership} | ${claim.evidenceRole ?? '—'} | ${claim.inferenceDistance ?? '—'} | ${claim.languageRequirement} |`);
  }
  if (manifest.materialAudit) {
    lines.push('', '## Material Audit', '', `- Verdict: ${manifest.materialAudit.verdict}`);
    for (const note of manifest.materialAudit.notes) lines.push(`- ${note}`);
  }
  if (manifest.formDecision) lines.push('', '## Form decision', '', `- Public tier: ${manifest.formDecision.publicTier}`, `- Reason: ${manifest.formDecision.reason}`);
  if (manifest.drafts) {
    lines.push('', '## Bilingual parity', '');
    for (const claim of manifest.claims ?? []) {
      if (claim.languageRequirement !== 'EN+ZH') continue;
      const en = manifest.drafts.en?.presentClaimIds.includes(claim.claimId) ? 'yes' : 'no';
      const zh = manifest.drafts.zh?.presentClaimIds.includes(claim.claimId) ? 'yes' : 'no';
      lines.push(`- ${claim.claimId}: EN ${en} / ZH ${zh}`);
    }
  }
  if (manifest.voice?.verbatimSpine.length || manifest.voice?.untraceableFlags.length) {
    lines.push('', '## Voice', '');
    if (manifest.voice.verbatimSpine.length) { lines.push('### Verbatim spine'); manifest.voice.verbatimSpine.forEach((line) => lines.push(`- ${line}`)); }
    if (manifest.voice.untraceableFlags.length) { lines.push('', '### Untraceable / could not trace'); manifest.voice.untraceableFlags.forEach((line) => lines.push(`- ${line}`)); }
  }
  if (manifest.titleOptions?.length) { lines.push('', '## Title options', ''); manifest.titleOptions.forEach((title) => lines.push(`- ${title}`)); }
  if (manifest.hypotheses?.length) {
    lines.push('', '## Candidate hypotheses — not yet yours', '');
    manifest.hypotheses.forEach((h) => lines.push(`${h.id}. ${h.claim}\n   - Status: ${h.status}`));
  }
  if (manifest.calibration?.length) {
    lines.push('', '## A/B calibration', '');
    manifest.calibration.forEach((q, index) => { lines.push(`${index + 1}. ${q.label}`); q.options.forEach((o) => lines.push(`   - ${o.id}. ${o.text}`)); });
  }
  if (manifest.critic) {
    lines.push('', '## Editorial critic', '', '### Verdict', manifest.critic.verdict, '', '### Strongest single idea', manifest.critic.strongestIdea);
    renderFindings(lines, 'Blocking reasoning failures', manifest.critic.blockingFailures);
    renderFindings(lines, 'Required scope cuts / splits', manifest.critic.requiredCuts);
    renderFindings(lines, 'Optional warnings', manifest.critic.optionalWarnings ?? []);
  }
  return `${lines.join('\n').trim()}\n`;
}

function renderKernel(lines: string[], label: string, items: AuthorKernelItem[] | undefined): void {
  if (!items?.length) return;
  lines.push(`### ${label}`); items.forEach((item) => lines.push(`- ${item.text} _(source: ${item.provenance})_`)); lines.push('');
}
function renderFindings(lines: string[], title: string, findings: CriticFinding[]): void {
  lines.push('', `### ${title}`); if (!findings.length) lines.push('- None'); else findings.forEach((f) => lines.push(`- ${f.message}${f.claimIds?.length ? ` (${f.claimIds.join(', ')})` : ''}`));
}
function uniqueIds<T extends object>(items: T[], key: keyof T, label: string, errors: string[]): Set<string> {
  const ids = new Set<string>();
  for (const item of items) {
    const id = item[key] as unknown;
    if (!nonEmpty(id)) { errors.push(`${label}: id is required`); continue; }
    if (ids.has(id)) errors.push(`${label}: duplicate id ${id}`);
    ids.add(id);
  }
  return ids;
}
function stageAtLeast(stage: EditorialStage | undefined, threshold: EditorialStage): boolean {
  return stage !== undefined && STAGE_INDEX.has(stage) && STAGE_INDEX.get(stage)! >= STAGE_INDEX.get(threshold)!;
}
function isRecord(value: unknown): value is Record<string, any> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function nonEmpty(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0; }
function isIsoDate(value: unknown): boolean { return nonEmpty(value) && !Number.isNaN(Date.parse(value)); }
function escapeCell(value: string): string { return value.replace(/\|/g, '\\|').replace(/\n/g, ' '); }
