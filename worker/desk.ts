import type { Env } from './types';
import { getFile, putFile, gh, json, collapse, todayIn } from './github';
import { appendProposed, excerpt } from './voice';

/**
 * Desk surface (Companion Phase 3, docs/companion-vision.md §3.3).
 * One card per open content PR, built from the ship gate's output: the
 * verdict comment, the PR body's Voice section (verbatim spine + untraceable
 * opinions), title options, and the branch preview URL. Actions: Ship
 * (merge), One change / voice keep-cut / Downgrade (comments the ship gate or
 * drafter acts on), Kill (close), and apply-slots — the only writer that ever
 * touches src/content/**, constrained to PR branches, the title frontmatter
 * line, and the final paragraph (vision §5).
 */

// A PR qualifies for the Desk only if every changed file is content-shaped.
// This is also the guard on Ship: the phone can never merge a code PR.
const CONTENT_PR_PREFIXES = [
  'src/content/',
  'drafts/',
  'research/',
  'public/images/',
];
const SLOT_WRITABLE_PREFIXES = ['src/content/', 'drafts/'];
const MAX_DESK_PRS = 10;
// One Contents page; a real content PR has a handful of files, so anything
// that fills the page is fail-closed non-content rather than paginated.
const MAX_PR_FILES = 100;
const MAX_COMMENT_LENGTH = 4000;
const MAX_TITLE_LENGTH = 200;
const MAX_LAST_LINE_LENGTH = 1000;
const MAX_AB_WHY_LENGTH = 500;
const MAX_MARKS = 30;
const MAX_MARK_LENGTH = 600;

export interface AbQuestion {
  /** 1-based question number as written in the PR body. */
  n: number;
  /** Where the passage sits ("en opening", "zh closer", …). */
  label: string;
  options: Array<{ letter: string; text: string }>;
}

export interface CandidateHypothesis {
  /** The H-number as written in the PR body ("H1." -> 1). */
  n: number;
  text: string;
  status: string;
}

export interface DeskPr {
  number: number;
  title: string;
  branch: string;
  url: string;
  ageDays: number;
  files: string[];
  contentFiles: string[];
  tier: string | null;
  verdict: string | null;
  previewUrl: string | null;
  voice: { spine: string[]; flags: string[] };
  /** A/B calibration questions from the PR body, minus already-answered ones. */
  ab: { questions: AbQuestion[]; answered: number[] };
  /** Candidate hypotheses from the PR body (docs/pipeline.md §10), plus decided ids. */
  hypotheses: { candidates: CandidateHypothesis[]; adopted: number[]; rejected: number[] };
  titleOptions: string[];
  /** Current last paragraph per content file, for the last-line slot. */
  lastLines: Array<{ path: string; text: string }>;
  /** Author feedback sent after the last verdict, still owed a gate pass. */
  pending: number;
}

interface PrSummary {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  created_at: string;
  draft: boolean;
  head: { ref: string; sha: string; repo: { full_name: string } | null };
}

export async function listOpenContentPrs(
  env: Env
): Promise<Array<{ pr: PrSummary; files: string[] }>> {
  const res = await gh(env, 'GET', 'pulls?state=open&per_page=30');
  if (!res.ok) throw new Error(`GitHub PR list failed (${res.status})`);
  const prs = (await res.json()) as PrSummary[];

  const out: Array<{ pr: PrSummary; files: string[] }> = [];
  for (const pr of prs.filter((p) => !p.draft)) {
    if (out.length >= MAX_DESK_PRS) break;
    const files = await prFiles(env, pr.number);
    if (isContentFileList(files)) {
      out.push({ pr, files });
    }
  }
  return out;
}

export async function listDesk(env: Env): Promise<Response> {
  const open = await listOpenContentPrs(env);
  const cards: DeskPr[] = [];
  for (const { pr, files } of open) {
    const comments = await prComments(env, pr.number);
    const body = parsePrBody(pr.body ?? '');
    const contentFiles = files.filter((f) =>
      SLOT_WRITABLE_PREFIXES.some((p) => f.startsWith(p)) && f.endsWith('.md')
    );

    // Read by commit SHA, not branch name: a fork PR's branch doesn't exist
    // in this repo, but its commits are reachable in the repo's object
    // network. Writes stay branch-scoped and same-repo-only (applySlots).
    const lastLines: DeskPr['lastLines'] = [];
    for (const path of contentFiles.slice(0, 3)) {
      const file = await getFile(env, path, pr.head.sha);
      if (file) lastLines.push({ path, text: lastParagraph(file.content) });
    }

    cards.push({
      number: pr.number,
      title: pr.title,
      branch: pr.head.ref,
      url: pr.html_url,
      ageDays: Math.floor((Date.now() - Date.parse(pr.created_at)) / 86400000),
      files,
      contentFiles,
      tier: body.tier,
      verdict: latestVerdict(comments),
      previewUrl: extractPreviewUrl(comments),
      voice: { spine: body.spine, flags: body.flags },
      ab: { questions: parseAbQuestions(pr.body ?? ''), answered: answeredAbQuestions(comments) },
      hypotheses: {
        candidates: parseHypotheses(pr.body ?? ''),
        ...decidedHypotheses(comments),
      },
      titleOptions: body.titleOptions,
      lastLines,
      pending: pendingRequests(comments),
    });
  }
  return json({ prs: cards });
}

/** Light PR summary for the Flow overview — no last-line reads, one comment fetch. */
export interface DeskSummary {
  number: number;
  title: string;
  url: string;
  ageDays: number;
  tier: string | null;
  verdict: 'ready' | 'attention' | 'none';
  /** Author feedback sent after the last verdict, still owed a gate pass. */
  pending: number;
}

export async function deskSummaries(env: Env): Promise<DeskSummary[]> {
  const open = await listOpenContentPrs(env);
  const out: DeskSummary[] = [];
  for (const { pr } of open) {
    const comments = await prComments(env, pr.number);
    const verdict = latestVerdict(comments);
    out.push({
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      ageDays: Math.floor((Date.now() - Date.parse(pr.created_at)) / 86400000),
      tier: parsePrBody(pr.body ?? '').tier,
      verdict: verdict ? (/ready to ship/i.test(verdict) ? 'ready' : 'attention') : 'none',
      pending: pendingRequests(comments),
    });
  }
  return out;
}

export async function shipPr(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ number?: number }>(request);
  if (!body) return json({ error: 'Body must be JSON' }, 400);
  const pr = await contentPrOrNull(env, body.number);
  if (!pr) return json({ error: 'Not an open content PR' }, 400);

  const res = await gh(env, 'PUT', `pulls/${pr.number}/merge`, {
    merge_method: 'merge',
  });
  if (res.status === 405 || res.status === 409) {
    return json({ error: 'PR is not mergeable right now' }, 409);
  }
  if (!res.ok) return json({ error: `GitHub API error (${res.status})` }, 502);
  const data = (await res.json()) as { sha?: string };
  return json({ ok: true, merged: true, sha: data.sha });
}

export async function commentPr(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{
    number?: number;
    kind?: string;
    text?: string;
    decision?: string;
    question?: number;
    choice?: string;
    why?: string;
    marks?: string[];
  }>(request);
  if (!body) return json({ error: 'Body must be JSON' }, 400);
  const pr = await contentPrOrNull(env, body.number);
  if (!pr) return json({ error: 'Not an open content PR' }, 400);

  const text = collapse(body.text ?? '');
  if (text.length > MAX_COMMENT_LENGTH) {
    return json({ error: `text exceeds ${MAX_COMMENT_LENGTH} characters` }, 400);
  }

  // The Worker, not the client, decides what a Desk comment looks like —
  // each kind maps to a phrasing the ship gate / drafter prompts understand.
  // The voice-learning kinds (ab, marks) also append a raw record to
  // research/voice.md ## Proposed, tagged with its source (issue #44 Phase 2).
  let comment: string;
  let proposed: string[] = [];
  const date = todayIn(env.SPARK_TIMEZONE);
  switch (body.kind) {
    case 'one-change':
      if (!text) return json({ error: 'text is required' }, 400);
      comment = `**One change:** ${text}\n\n_(via Desk)_`;
      break;
    case 'voice': {
      if (body.decision !== 'keep' && body.decision !== 'cut') {
        return json({ error: 'decision must be keep or cut' }, 400);
      }
      if (!text) return json({ error: 'text (the flagged opinion) is required' }, 400);
      comment =
        body.decision === 'keep'
          ? `**Voice flag — keep:** "${text}" is mine; keep it.\n\n_(via Desk)_`
          : `**Voice flag — cut:** "${text}" is not mine; cut or recast it as an open question.\n\n_(via Desk)_`;
      break;
    }
    case 'downgrade':
      comment = `**Downgrade to note** — extract the strongest single idea, re-tier the frontmatter, trim the rest (the documented remedy).${text ? ` ${text}` : ''}\n\n_(via Desk)_`;
      break;
    case 'ab': {
      // The chosen text comes from the PR body on the server side, so the
      // record always quotes what the drafter actually offered.
      const questions = parseAbQuestions(pr.pr.body ?? '');
      const question = questions.find((q) => q.n === Number(body.question));
      const option = question?.options.find((o) => o.letter === body.choice);
      if (!question || !option) {
        return json({ error: 'question/choice does not match an A/B option in this PR' }, 400);
      }
      const why = collapse(body.why ?? '');
      if (why.length > MAX_AB_WHY_LENGTH) {
        return json({ error: `why exceeds ${MAX_AB_WHY_LENGTH} characters` }, 400);
      }
      comment =
        `**A/B calibration — Q${question.n}: ${option.letter}.** “${option.text}”` +
        (why ? `\n\nWhy: ${why}` : '') +
        `\n\n_(via Desk)_`;
      proposed = [
        `- ${date} (A/B choice, PR #${pr.number}) ${question.label}: chose ${option.letter} — “${excerpt(option.text)}”${why ? `; why: ${why}` : ''}`,
      ];
      break;
    }
    case 'marks': {
      const marks = Array.isArray(body.marks) ? body.marks.map((m) => collapse(String(m))).filter(Boolean) : [];
      if (!marks.length) return json({ error: 'marks must be a non-empty array of sentences' }, 400);
      if (marks.length > MAX_MARKS) return json({ error: `at most ${MAX_MARKS} marks per send` }, 400);
      if (marks.some((m) => m.length > MAX_MARK_LENGTH)) {
        return json({ error: `each mark must be under ${MAX_MARK_LENGTH} characters` }, 400);
      }
      comment =
        `**读稿标记 — 我不会这么说：**\n\n` +
        marks.map((m) => `- “${m}”`).join('\n') +
        `\n\n_(via Desk)_`;
      proposed = marks.map(
        (m) => `- ${date} (read-aloud mark, PR #${pr.number}) 不会这么说：“${excerpt(m)}”`
      );
      break;
    }
    default:
      return json({ error: 'kind must be one-change, voice, downgrade, ab, or marks' }, 400);
  }

  const res = await gh(env, 'POST', `issues/${pr.number}/comments`, { body: comment });
  if (!res.ok) return json({ error: `GitHub API error (${res.status})` }, 502);

  // Best-effort: the PR comment is the primary record the automations act on;
  // a failed voiceprint append is reported, never a failed request.
  let voiceprint = true;
  if (proposed.length) {
    voiceprint = await appendProposed(env, proposed, `desk: voice signal (#${pr.number})`).catch(() => false);
  }
  return json({ ok: true, voiceprint });
}

/**
 * The draft's prose for the read-aloud marking UI: frontmatter stripped,
 * paragraphs split, read from the PR's own branch. Read-only.
 */
export async function getDraft(env: Env, url: URL): Promise<Response> {
  const pr = await contentPrOrNull(env, Number(url.searchParams.get('number')));
  if (!pr) return json({ error: 'Not an open content PR' }, 400);
  const path = url.searchParams.get('path') ?? '';
  const slotWritable = SLOT_WRITABLE_PREFIXES.some((p) => path.startsWith(p)) && path.endsWith('.md');
  if (!pr.files.includes(path) || !slotWritable) {
    return json({ error: 'path must be a content file changed by this PR' }, 400);
  }
  const file = await getFile(env, path, pr.pr.head.sha);
  if (!file) return json({ error: 'File not found on PR branch' }, 404);
  const prose = file.content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  const paragraphs = prose
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return json({ path, paragraphs });
}

export async function killPr(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ number?: number; reason?: string }>(request);
  if (!body) return json({ error: 'Body must be JSON' }, 400);
  const pr = await contentPrOrNull(env, body.number);
  if (!pr) return json({ error: 'Not an open content PR' }, 400);

  const reason = collapse(body.reason ?? '');
  if (reason.length > MAX_COMMENT_LENGTH) {
    return json({ error: `reason exceeds ${MAX_COMMENT_LENGTH} characters` }, 400);
  }
  await gh(env, 'POST', `issues/${pr.number}/comments`, {
    body: `Killed ${todayIn(env.SPARK_TIMEZONE)} via Desk${reason ? `: ${reason}` : '.'} Killed is a valid outcome.`,
  });
  const res = await gh(env, 'PATCH', `pulls/${pr.number}`, { state: 'closed' });
  if (!res.ok) return json({ error: `GitHub API error (${res.status})` }, 502);
  return json({ ok: true, closed: true });
}

/**
 * Ship-time slots (vision §4.3): the only writer that ever touches
 * src/content/**. Constrained to the PR's own branch, to files in the PR's
 * diff, and to exactly two edits — the title frontmatter line and the final
 * paragraph. It cannot become a phone editor by accident.
 */
export async function applySlots(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{
    number?: number;
    path?: string;
    title?: string;
    lastLine?: string;
  }>(request);
  if (!body) return json({ error: 'Body must be JSON' }, 400);
  const pr = await contentPrOrNull(env, body.number);
  if (!pr) return json({ error: 'Not an open content PR' }, 400);
  // Never write to a branch in someone else's fork — branch-of-this-repo only.
  if (pr.pr.head.repo && pr.pr.head.repo.full_name !== env.GITHUB_REPO) {
    return json({ error: 'PR head is not a branch of this repo' }, 400);
  }

  const path = body.path ?? '';
  const inDiff = pr.files.includes(path);
  const slotWritable = SLOT_WRITABLE_PREFIXES.some((p) => path.startsWith(p)) && path.endsWith('.md');
  if (!inDiff || !slotWritable) {
    return json({ error: 'path must be a content file changed by this PR' }, 400);
  }

  const title = collapse(body.title ?? '');
  const lastLine = (body.lastLine ?? '').replace(/\r\n/g, '\n').trim();
  if (!title && !lastLine) return json({ error: 'Nothing to apply' }, 400);
  if (title.length > MAX_TITLE_LENGTH) {
    return json({ error: `title exceeds ${MAX_TITLE_LENGTH} characters` }, 400);
  }
  if (
    lastLine.length > MAX_LAST_LINE_LENGTH ||
    /\n\s*\n/.test(lastLine) ||
    /^#{1,6}\s|^---\s*$/m.test(lastLine)
  ) {
    return json({ error: 'lastLine must be one short paragraph' }, 400);
  }

  const branch = pr.pr.head.ref;
  for (let attempt = 0; attempt < 2; attempt++) {
    const file = await getFile(env, path, branch);
    if (!file) return json({ error: 'File not found on PR branch' }, 404);

    let content = file.content;
    if (title) {
      const next = replaceTitle(content, title);
      if (!next) return json({ error: 'No title line found in frontmatter' }, 422);
      content = next;
    }
    if (lastLine) content = replaceLastParagraph(content, lastLine);
    if (content === file.content) return json({ ok: true, changed: false });

    const result = await putFile(
      env,
      path,
      content,
      `desk: ship-time slots (#${pr.number})`,
      file.sha,
      branch
    );
    if (result.ok) return json({ ok: true, changed: true, commit: result.commitUrl });
    if (result.status !== 409) return json({ error: `GitHub API error (${result.status})` }, 502);
  }
  return json({ error: 'Write conflict, please retry' }, 409);
}

// --- helpers ---------------------------------------------------------------

function isContentPath(path: string): boolean {
  return CONTENT_PR_PREFIXES.some((p) => path.startsWith(p)) && !path.includes('..');
}

/**
 * Every file content-shaped, and the listing provably complete: a PR that
 * fills the first Files page could hide code on page two, so it never
 * qualifies — the Desk fails closed rather than paginating.
 */
function isContentFileList(files: string[]): boolean {
  return files.length > 0 && files.length < MAX_PR_FILES && files.every((f) => isContentPath(f));
}

async function prFiles(env: Env, number: number): Promise<string[]> {
  const res = await gh(env, 'GET', `pulls/${number}/files?per_page=${MAX_PR_FILES}`);
  if (!res.ok) throw new Error(`GitHub PR files failed (${res.status})`);
  const data = (await res.json()) as Array<{ filename: string }>;
  return data.map((f) => f.filename);
}

async function prComments(env: Env, number: number): Promise<string[]> {
  const res = await gh(env, 'GET', `issues/${number}/comments?per_page=100`);
  if (!res.ok) return [];
  const data = (await res.json()) as Array<{ body?: string }>;
  return data.map((c) => c.body ?? '');
}

async function contentPrOrNull(
  env: Env,
  number: unknown
): Promise<{ number: number; pr: PrSummary; files: string[] } | null> {
  const n = Number(number);
  if (!Number.isInteger(n) || n < 1) return null;
  const res = await gh(env, 'GET', `pulls/${n}`);
  if (!res.ok) return null;
  const pr = (await res.json()) as PrSummary & { state: string };
  if (pr.state !== 'open') return null;
  const files = await prFiles(env, n);
  if (!isContentFileList(files)) return null;
  return { number: n, pr, files };
}

const VERDICT_RE = /ready to ship|ready\s*[—–-]\s*queued|needs your call|checklist fails|downgraded/i;

/**
 * Ship-gate verdict: the latest comment carrying one of its phrasings, matched
 * loosely — this one only picks the text the card displays, so a verdict with a
 * preamble is better shown than missed.
 */
function latestVerdict(comments: string[]): string | null {
  for (let i = comments.length - 1; i >= 0; i--) {
    if (VERDICT_RE.test(comments[i])) return comments[i];
  }
  return null;
}

/** The Desk comment shapes the ship gate is obliged to act on (routine 04 step 4). */
const REQUEST_RE =
  /\*\*(?:One change:|读稿标记|A\/B calibration —|Voice flag —|Downgrade to note|Adopt hypothesis —|Reject hypothesis —)/;

/**
 * The same phrasings, but anchored to the top of the comment, where routine 04
 * puts its verdict. The pending cutoff needs the stricter test: a loose match
 * lets an author's own comment ("is this ready to ship?") pose as a verdict and
 * silently zero out their feedback, which is the one error this signal must not
 * make. A Desk request is never a verdict however it reads, so its marker wins.
 */
const VERDICT_OPENING_RE = new RegExp(`^[\\s>#*_]*(?:${VERDICT_RE.source})`, 'i');

function latestVerdictIndex(comments: string[]): number {
  for (let i = comments.length - 1; i >= 0; i--) {
    if (REQUEST_RE.test(comments[i])) continue;
    if (VERDICT_OPENING_RE.test(comments[i])) return i;
  }
  return -1;
}

/**
 * How much author feedback is still owed a gate pass. Issue comments come back
 * in chronological order, so anything the author sent *after* the last verdict
 * has not been answered by one: the gate's contract is to apply the feedback
 * and post a fresh verdict (routine 04), which means a non-zero count is the
 * system owing the author a round, not the author owing the system anything.
 * Without this the phone showed a stale "Ready to ship" over unread feedback,
 * and the only visible difference between "worked in" and "ignored" was the
 * author rereading the draft.
 */
export function pendingRequests(comments: string[]): number {
  return comments
    .slice(latestVerdictIndex(comments) + 1)
    .filter((c) => REQUEST_RE.test(c)).length;
}

/** The branch preview URL the deploy bot buries in a comment (vision §3.3). */
export function extractPreviewUrl(comments: string[]): string | null {
  const re = /https:\/\/[^\s)<>"']+\.(?:workers|pages)\.dev[^\s)<>"']*/g;
  for (let i = comments.length - 1; i >= 0; i--) {
    const matches = comments[i].match(re);
    if (matches) return matches[matches.length - 1];
  }
  return null;
}

/**
 * Pull the Desk's card data out of the drafter's PR body (routine 03 defines
 * the sections; this parser stays tolerant of phrasing drift).
 */
export function parsePrBody(body: string): {
  tier: string | null;
  spine: string[];
  flags: string[];
  titleOptions: string[];
} {
  const tier = body.match(/\btier\b[^a-z]{0,10}(note|essay|tracker)/i)?.[1].toLowerCase() ?? null;

  const spine = bullets(sectionAfter(body, /verbatim[- ]spine|your words|phrases kept/i));
  const flags = bullets(sectionAfter(body, /untraceable|could not trace|not trace/i)).filter(
    (f) => !/^none\b|^empty\b|^—$|^-$/i.test(f)
  );
  const titleOptions = bullets(sectionAfter(body, /title options/i));

  return { tier, spine, flags, titleOptions };
}

/**
 * A/B calibration questions from the drafter's PR body (routine 03 defines
 * the machine-readable shape: numbered question lines, lettered options as
 * list items, the drafted version first). Tolerant of ./)/、 delimiters.
 */
export function parseAbQuestions(body: string): AbQuestion[] {
  const section = sectionAfter(body, /a\s*\/\s*b/i);
  if (!section) return [];
  const questions: AbQuestion[] = [];
  let current: AbQuestion | null = null;
  for (const line of section.split('\n')) {
    const q = line.match(/^\s*(\d+)[.)、]\s+(.*)$/);
    if (q) {
      current = { n: Number(q[1]), label: q[2].trim(), options: [] };
      questions.push(current);
      continue;
    }
    const o = line.match(/^\s*(?:[-*]\s*)?([A-E])[.)、]\s+(.*)$/);
    if (o && current) current.options.push({ letter: o[1], text: o[2].trim() });
  }
  // A question needs a real choice; the drafter's hard cap is three.
  return questions.filter((q) => q.options.length >= 2).slice(0, 3);
}

/** Question numbers already answered via Desk comments ("**A/B calibration — Q1: B.**"). */
export function answeredAbQuestions(comments: string[]): number[] {
  const answered = new Set<number>();
  for (const c of comments) {
    for (const m of c.matchAll(/\*\*A\/B[^*]*?Q(\d+)[:：]\s*[A-E]/gi)) {
      answered.add(Number(m[1]));
    }
  }
  return [...answered];
}

/**
 * Candidate hypotheses from the drafter's PR body (routine 03 defines the shape:
 * `## Candidate hypotheses — not yet yours`, items numbered `H1.`, `H2.`, ..., a
 * `Status:` line per item defaulting to "not adopted" when absent).
 */
export function parseHypotheses(body: string): CandidateHypothesis[] {
  const section = sectionAfter(body, /candidate hypothes[ei]s/i);
  if (!section) return [];
  const hypotheses: CandidateHypothesis[] = [];
  let current: CandidateHypothesis | null = null;
  for (const line of section.split('\n')) {
    const h = line.match(/^\s*H?(\d+)[.)、]\s+(.*)$/i);
    if (h) {
      current = { n: Number(h[1]), text: h[2].trim(), status: 'not adopted' };
      hypotheses.push(current);
      continue;
    }
    const s = line.match(/^\s*(?:[-*]\s*)?status[:：]\s*(.*)$/i);
    if (s && current) current.status = s[1].trim().toLowerCase();
  }
  return hypotheses;
}

/** Hypothesis ids the author has decided via Desk/PR comments, split adopted vs rejected. */
export function decidedHypotheses(comments: string[]): { adopted: number[]; rejected: number[] } {
  const adopted = new Set<number>();
  const rejected = new Set<number>();
  for (const c of comments) {
    for (const m of c.matchAll(/\*\*Adopt hypothesis\s*—\s*H?(\d+)/gi)) adopted.add(Number(m[1]));
    for (const m of c.matchAll(/\*\*Reject hypothesis\s*—\s*H?(\d+)/gi)) rejected.add(Number(m[1]));
  }
  return { adopted: [...adopted], rejected: [...rejected] };
}

/** Lines of the body from the heading/label matching `pattern` to the next heading. */
function sectionAfter(body: string, pattern: RegExp): string {
  const lines = body.split('\n');
  const isHeading = (l: string) => /^#{1,6}\s|^\*\*[^*]+\*\*:?\s*$/.test(l.trim());
  const start = lines.findIndex((l) => isHeading(l) && pattern.test(l));
  if (start === -1) return '';
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (isHeading(lines[i])) { end = i; break; }
  }
  return lines.slice(start + 1, end).join('\n');
}

function bullets(section: string): string[] {
  return section
    .split('\n')
    .map((l) => l.match(/^\s*(?:[-*]|\d+[.)])\s+(.*)$/)?.[1].trim() ?? '')
    .filter(Boolean)
    .map((l) => l.replace(/^["“”'`]+|["“”'`]+$/g, ''));
}

/** Replace the `title:` line inside the frontmatter block only. */
export function replaceTitle(content: string, title: string): string | null {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = m[1];
  if (!/^title:/m.test(fm)) return null;
  // JSON string escaping is valid YAML double-quoting.
  const nextFm = fm.replace(/^title:.*$/m, `title: ${JSON.stringify(title)}`);
  return content.slice(0, m.index!) + `---\n${nextFm}\n---` + content.slice(m.index! + m[0].length);
}

export function lastParagraph(content: string): string {
  const blocks = content.replace(/\s+$/, '').split(/\n\s*\n/);
  return blocks[blocks.length - 1]?.trim() ?? '';
}

export function replaceLastParagraph(content: string, text: string): string {
  const trimmed = content.replace(/\s+$/, '');
  const idx = trimmed.search(/(?:\n\s*\n)(?![\s\S]*\n\s*\n)/);
  if (idx === -1) return trimmed + '\n\n' + text + '\n';
  const sepEnd = trimmed.slice(idx).match(/^\n\s*\n/)![0].length;
  return trimmed.slice(0, idx + sepEnd) + text + '\n';
}

async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
