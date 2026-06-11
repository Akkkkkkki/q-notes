import type { Env } from './types';
import { getFile, putFile, listDir, todayIn, json } from './github';

/**
 * Interview surface (Companion Phase 2, docs/companion-vision.md §3.2).
 * Renders the week's brief from `research/interviews/` and commits each
 * answer into its `## Author answers` section, attributed per question.
 * The brief format is the routine 02 contract (automations/02-interview-brief.md).
 */

const INTERVIEWS_DIR = 'research/interviews';
const BRIEF_FILE = /^(\d{4}-\d{2}-\d{2})-[a-z0-9-]+\.md$/;
const MAX_ANSWER_LENGTH = 10000;

export interface Brief {
  path: string;
  date: string;
  title: string;
  status: string;
  closed: boolean;
  idea: string;
  questions: Array<{ n: number; text: string; answer: string | null }>;
}

export async function latestBrief(env: Env): Promise<Brief | null> {
  const names = (await listDir(env, INTERVIEWS_DIR))
    .filter((n) => BRIEF_FILE.test(n))
    .sort();
  const name = names[names.length - 1];
  if (!name) return null;
  const file = await getFile(env, `${INTERVIEWS_DIR}/${name}`);
  if (!file) return null;
  return parseBrief(`${INTERVIEWS_DIR}/${name}`, file.content);
}

export async function getBrief(env: Env): Promise<Response> {
  return json({ brief: await latestBrief(env) });
}

export async function saveAnswer(request: Request, env: Env): Promise<Response> {
  let body: { path?: string; question?: number; text?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Body must be JSON' }, 400);
  }

  const path = body.path ?? '';
  const n = Number(body.question);
  const text = (body.text ?? '').replace(/\r\n/g, '\n').trim();
  if (!isBriefPath(path)) return json({ error: 'Invalid brief path' }, 400);
  if (!Number.isInteger(n) || n < 1 || n > 20) return json({ error: 'Invalid question number' }, 400);
  if (!text) return json({ error: 'text is required' }, 400);
  if (text.length > MAX_ANSWER_LENGTH) {
    return json({ error: `text exceeds ${MAX_ANSWER_LENGTH} characters` }, 400);
  }
  // Answers live inside a markdown section; a heading-like line in a dictated
  // answer must not be able to split the file structure.
  const safeText = text.replace(/^(#{1,6}\s)/gm, '\\$1');

  for (let attempt = 0; attempt < 2; attempt++) {
    const file = await getFile(env, path);
    if (!file) return json({ error: 'Brief not found' }, 404);

    let content = upsertAnswer(file.content, n, safeText);
    content = content.replace(
      /^\*\*Status:\*\*[ \t]*Awaiting answers[ \t]*$/m,
      `**Status:** Answers in progress (${todayIn(env.SPARK_TIMEZONE)})`
    );

    const slug = path.split('/').pop()!.replace(/\.md$/, '');
    const result = await putFile(env, path, content, `interview: answer Q${n} (${slug})`, file.sha);
    if (result.ok) return json({ ok: true, commit: result.commitUrl });
    if (result.status !== 409) return json({ error: `GitHub API error (${result.status})` }, 502);
  }
  return json({ error: 'Write conflict, please retry' }, 409);
}

export async function closeBrief(request: Request, env: Env): Promise<Response> {
  let body: { path?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Body must be JSON' }, 400);
  }
  const path = body.path ?? '';
  if (!isBriefPath(path)) return json({ error: 'Invalid brief path' }, 400);

  for (let attempt = 0; attempt < 2; attempt++) {
    const file = await getFile(env, path);
    if (!file) return json({ error: 'Brief not found' }, 404);

    const date = todayIn(env.SPARK_TIMEZONE);
    let content;
    if (/^\*\*Status:\*\*.*$/m.test(file.content)) {
      content = file.content.replace(/^\*\*Status:\*\*.*$/m, `**Status:** Closed (not this topic, ${date})`);
    } else {
      content = file.content.replace(/\n/, `\n\n**Status:** Closed (not this topic, ${date})\n`);
    }

    const slug = path.split('/').pop()!.replace(/\.md$/, '');
    const result = await putFile(env, path, content, `interview: declined (${slug})`, file.sha);
    if (result.ok) return json({ ok: true });
    if (result.status !== 409) return json({ error: `GitHub API error (${result.status})` }, 502);
  }
  return json({ error: 'Write conflict, please retry' }, 409);
}

function isBriefPath(path: string): boolean {
  const parts = path.split('/');
  return (
    parts.length === 3 &&
    parts[0] === 'research' &&
    parts[1] === 'interviews' &&
    BRIEF_FILE.test(parts[2])
  );
}

export function parseBrief(path: string, content: string): Brief {
  const title = content.match(/^#\s*Interview:\s*(.+)$/m)?.[1].trim() ?? path;
  const status = content.match(/^\*\*Status:\*\*\s*(.+)$/m)?.[1].trim() ?? '';
  const date = path.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? '';

  const idea = section(content, /the idea in three sentences/i).trim();
  const answers = parseAnswers(section(content, /author answers/i));

  const questions: Brief['questions'] = [];
  let current: { n: number; lines: string[] } | null = null;
  for (const line of section(content, /questions/i).split('\n')) {
    const start = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (start) {
      if (current) pushQuestion(questions, current, answers);
      current = { n: Number(start[1]), lines: [start[2]] };
    } else if (current && line.trim()) {
      current.lines.push(line.trim());
    }
  }
  if (current) pushQuestion(questions, current, answers);

  return { path, date, title, status, closed: /^closed|^declined/i.test(status), idea, questions };
}

function pushQuestion(
  questions: Brief['questions'],
  q: { n: number; lines: string[] },
  answers: Map<number, string>
) {
  questions.push({ n: q.n, text: q.lines.join(' ').trim(), answer: answers.get(q.n) ?? null });
}

/** Body of the `## <heading>` section matching `pattern` (up to the next `## `). */
function section(content: string, pattern: RegExp): string {
  const lines = content.split('\n');
  const start = lines.findIndex((l) => /^##\s/.test(l) && pattern.test(l));
  if (start === -1) return '';
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) { end = i; break; }
  }
  return lines.slice(start + 1, end).join('\n');
}

function parseAnswers(answersSection: string): Map<number, string> {
  const map = new Map<number, string>();
  const blocks = answersSection.split(/^###\s+Q(\d+)\s*$/m);
  // split() yields [preamble, n1, body1, n2, body2, ...]
  for (let i = 1; i + 1 < blocks.length; i += 2) {
    map.set(Number(blocks[i]), blocks[i + 1].trim());
  }
  return map;
}

/** Replace the `### Q<n>` block in `## Author answers`, or append one. */
function upsertAnswer(content: string, n: number, text: string): string {
  const lines = content.split('\n');
  const sectionStart = lines.findIndex((l) => /^##\s/.test(l) && /author answers/i.test(l));
  if (sectionStart === -1) {
    return content.trimEnd() + `\n\n## Author answers\n\n### Q${n}\n\n${text}\n`;
  }
  let sectionEnd = lines.length;
  for (let i = sectionStart + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) { sectionEnd = i; break; }
  }

  const block = [`### Q${n}`, '', text];
  let blockStart = -1;
  let blockEnd = sectionEnd;
  for (let i = sectionStart + 1; i < sectionEnd; i++) {
    if (blockStart === -1 && new RegExp(`^###\\s+Q${n}\\s*$`).test(lines[i])) {
      blockStart = i;
    } else if (blockStart !== -1 && /^###\s/.test(lines[i])) {
      blockEnd = i;
      break;
    }
  }

  if (blockStart !== -1) {
    lines.splice(blockStart, blockEnd - blockStart, ...block, '');
  } else {
    // Append at the end of the section, before the next `## ` heading.
    while (sectionEnd > sectionStart + 1 && lines[sectionEnd - 1].trim() === '') sectionEnd--;
    lines.splice(sectionEnd, 0, '', ...block);
  }
  return lines.join('\n');
}
