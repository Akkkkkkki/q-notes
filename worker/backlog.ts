import type { Env } from './types';
import { getFile, putFile, json, collapse, todayIn } from './github';

/**
 * Backlog surface — the Today tab's topic-queue actions.
 *
 * The queue itself is groomed by the automations (the scout adds, the
 * interviewer picks, expiry reaps), so the author's verbs here are
 * deliberately small: "add your take" is just a spark (POST /api/spark —
 * author input outranks scouted topics, so it steers Tuesday's pick), and
 * "pass" (below) flips the item's Status line to Rejected so it stops
 * counting down and the interviewer skips it. Declining must be as cheap as
 * answering (docs/companion-vision.md §6).
 */

const BACKLOG_PATH = 'research/backlog.md';
const MAX_REASON_LENGTH = 500;

export async function passBacklogItem(request: Request, env: Env): Promise<Response> {
  let body: { date?: string; title?: string; reason?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Body must be JSON' }, 400);
  }

  const date = body.date ?? '';
  const title = collapse(body.title ?? '');
  const reason = collapse(body.reason ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'Invalid date' }, 400);
  if (!title) return json({ error: 'title is required' }, 400);
  if (reason.length > MAX_REASON_LENGTH) {
    return json({ error: `reason exceeds ${MAX_REASON_LENGTH} characters` }, 400);
  }

  const today = todayIn(env.SPARK_TIMEZONE);
  const statusLine = `**Status:** Rejected (${today}, passed via Today${reason ? `: ${reason}` : ''})`;

  // Retry once on a write conflict (a concurrent automation commit).
  for (let attempt = 0; attempt < 2; attempt++) {
    const file = await getFile(env, BACKLOG_PATH);
    if (!file) return json({ error: 'Backlog not found' }, 502);

    const result = rejectItem(file.content, date, title, statusLine);
    if ('error' in result) return json({ error: result.error }, result.status);

    const short = title.length > 50 ? title.slice(0, 47) + '...' : title;
    const write = await putFile(env, BACKLOG_PATH, result.content, `backlog: pass "${short}"`, file.sha);
    if (write.ok) return json({ ok: true, commit: write.commitUrl });
    if (write.status !== 409) return json({ error: `GitHub API error (${write.status})` }, 502);
  }
  return json({ error: 'Write conflict, please retry' }, 409);
}

/**
 * Replace the Status line of the `## <date> — <title>` item. Pure so the
 * rewrite is testable; only that one line of the file ever changes.
 */
export function rejectItem(
  content: string,
  date: string,
  title: string,
  statusLine: string
): { content: string } | { error: string; status: number } {
  const lines = content.split('\n');
  const start = findItem(lines, date, title);
  if (start === -1) return { error: 'Topic not found in the backlog', status: 404 };

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) { end = i; break; }
  }

  for (let i = start + 1; i < end; i++) {
    const m = lines[i].match(/^\*\*Status:\*\*\s*(.*)$/);
    if (!m) continue;
    if (/^drafted/i.test(m[1])) {
      return { error: 'Already drafted — handle the draft on the Publish tab instead', status: 400 };
    }
    if (/^interviewing/i.test(m[1])) {
      return {
        error: 'This topic is being interviewed — decline it with “not this topic” on the Answer tab instead',
        status: 400,
      };
    }
    if (/^rejected/i.test(m[1])) return { error: 'Already passed', status: 409 };
    lines[i] = statusLine;
    return { content: lines.join('\n') };
  }

  // No Status line in the block (the template always has one) — insert it.
  lines.splice(start + 1, 0, '', statusLine);
  return { content: lines.join('\n') };
}

function findItem(lines: string[], date: string, title: string): number {
  return lines.findIndex((l) => {
    const m = l.match(/^##\s+(\d{4}-\d{2}-\d{2})\s+—\s+(.+)$/);
    return !!m && m[1] === date && m[2].trim() === title;
  });
}

/**
 * The interviewer (routine 02) links a brief to its topic with
 * `**Source:** backlog item <date> — <title>` and marks that item
 * `Interviewing since …`. An interviewing item can't be passed from Today and
 * never expires, so declining the brief has to release the item as well or it
 * stays live forever.
 */
export function briefBacklogSource(brief: string): { date: string; title: string } | null {
  const m = brief.match(/^\*\*Source:\*\*\s*backlog item (\d{4}-\d{2}-\d{2})\s+—\s+(.+?)(?:\s+\|\s.*)?$/m);
  return m ? { date: m[1], title: m[2].trim() } : null;
}

/**
 * Flip an `Interviewing…` item's Status line. Pure, like rejectItem. Any other
 * status (drafted, rejected, expired) is a real outcome and is left alone, as
 * is a missing item: both return null.
 */
export function releaseInterviewedItem(
  content: string,
  date: string,
  title: string,
  statusLine: string
): { content: string } | null {
  const lines = content.split('\n');
  const start = findItem(lines, date, title);
  if (start === -1) return null;
  for (let i = start + 1; i < lines.length && !/^##\s/.test(lines[i]); i++) {
    const m = lines[i].match(/^\*\*Status:\*\*\s*(.*)$/);
    if (!m) continue;
    if (!/^interviewing/i.test(m[1])) return null;
    lines[i] = statusLine;
    return { content: lines.join('\n') };
  }
  return null;
}

/**
 * Release the backlog topic behind a declined brief. Best effort: the brief is
 * already closed, so a failure here is reported to the caller, never thrown.
 */
export async function releaseBacklogForBrief(
  env: Env,
  brief: string,
  date: string
): Promise<'released' | 'unchanged' | 'failed'> {
  const source = briefBacklogSource(brief);
  if (!source) return 'unchanged';
  const statusLine = `**Status:** Rejected (${date}, declined in interview: not this topic)`;
  const short = source.title.length > 50 ? source.title.slice(0, 47) + '...' : source.title;

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const file = await getFile(env, BACKLOG_PATH);
      if (!file) return 'failed';
      const result = releaseInterviewedItem(file.content, source.date, source.title, statusLine);
      if (!result) return 'unchanged';
      const write = await putFile(env, BACKLOG_PATH, result.content, `backlog: release declined "${short}"`, file.sha);
      if (write.ok) return 'released';
      if (write.status !== 409) return 'failed';
    }
  } catch {
    return 'failed';
  }
  return 'failed';
}
