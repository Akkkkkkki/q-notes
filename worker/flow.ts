import type { Env } from './types';
import { getFile, gh, json } from './github';
import { latestBrief } from './interview';
import { deskSummaries, type DeskSummary } from './desk';

/**
 * Flow surface — the whole pipeline at a glance (GET /api/flow).
 *
 * Read-only aggregation of the same artifacts the automations use: inbox
 * sparks, backlog candidates, the week's interview brief, open content PRs,
 * and recent publishes. On top it computes "needs you" — a prioritized list
 * derived from the pipeline's clocks (docs/pipeline.md: backlog expires at
 * 21 days, PRs downgrade at 7 and close at 14, the drafter takes whatever
 * interview answers exist on Thursday). No new writable paths.
 */

const INBOX_PATH = 'research/inbox.md';
const BACKLOG_PATH = 'research/backlog.md';
const BACKLOG_EXPIRY_DAYS = 21;
const PR_DOWNGRADE_DAYS = 7;
const PR_KILL_DAYS = 14;
const MAX_RECENT_SPARKS = 5;
const MAX_EXPIRING_CALLOUTS = 3;
const MAX_PUBLISHED = 3;
const DAY_MS = 86400000;

export interface BacklogItem {
  date: string;
  title: string;
  thesis: string;
  draftability: string | null;
  status: 'live' | 'drafted' | 'expired' | 'rejected';
  ageDays: number;
  /** Days until the 21-day expiry; meaningful for live items only. */
  expiresInDays: number;
  /** The author's sparks that reference this topic (“On ‘<title>’: …”). */
  takes: Array<{ date: string; text: string }>;
}

export interface Spark {
  date: string;
  text: string;
  /** An automation annotated the line with `→ <where it went>`. */
  consumed: boolean;
  ageDays: number;
}

export interface Attention {
  urgency: 'now' | 'soon' | 'later';
  text: string;
  href: string;
}

export async function getFlow(env: Env): Promise<Response> {
  const [inbox, backlogFile, brief, desk, published] = await Promise.all([
    getFile(env, INBOX_PATH),
    getFile(env, BACKLOG_PATH),
    latestBrief(env),
    deskSummaries(env),
    recentPublishes(env),
  ]);

  const sparks = parseSparks(inbox?.content ?? '');
  const backlog = parseBacklog(backlogFile?.content ?? '');
  for (const item of backlog) item.takes = takesFor(item.title, sparks);
  const live = backlog.filter((b) => b.status === 'live');

  const interview =
    brief && !brief.closed
      ? {
          path: brief.path,
          title: brief.title,
          date: brief.date,
          answered: brief.questions.filter((q) => q.answer).length,
          total: brief.questions.length,
        }
      : null;

  const weekday = weekdayIn(env.SPARK_TIMEZONE);
  return json({
    schedule: scheduleFrom(weekday),
    sparks: {
      unconsumed: sparks.filter((s) => !s.consumed).length,
      consumed: sparks.filter((s) => s.consumed).length,
      recent: sparks.slice(-MAX_RECENT_SPARKS).reverse(),
    },
    backlog: {
      live,
      draftedCount: backlog.filter((b) => b.status === 'drafted').length,
      expiredCount: backlog.filter((b) => b.status === 'expired').length,
      passedCount: backlog.filter((b) => b.status === 'rejected').length,
    },
    interview,
    desk,
    published,
    needsYou: attention(desk, interview, live, sparks, weekday),
  });
}

/**
 * The prioritized author to-do, derived from the pipeline's clocks.
 * `now` = an action with a deadline this week; `soon` = worth a look;
 * `later` = housekeeping. Order within a tier follows pipeline §4: shipping
 * beats interviewing beats backlog grooming beats capture hygiene.
 */
function attention(
  desk: DeskSummary[],
  interview: { title: string; answered: number; total: number } | null,
  live: BacklogItem[],
  sparks: Spark[],
  weekday: number
): Attention[] {
  const out: Attention[] = [];

  for (const pr of desk) {
    if (pr.verdict === 'ready') {
      out.push({
        urgency: 'now',
        text: `#${pr.number} “${pr.title}” — the gate says ready to ship. Five minutes on the Desk.`,
        href: '/desk/',
      });
    } else if (pr.ageDays >= PR_DOWNGRADE_DAYS) {
      out.push({
        urgency: 'now',
        text: `#${pr.number} “${pr.title}” — open ${pr.ageDays}d, past the ${PR_DOWNGRADE_DAYS}-day mark; the gate will cut it down to a note (closed at ${PR_KILL_DAYS}d).`,
        href: '/desk/',
      });
    } else if (pr.ageDays >= PR_DOWNGRADE_DAYS - 2) {
      out.push({
        urgency: 'now',
        text: `#${pr.number} “${pr.title}” — ${PR_DOWNGRADE_DAYS - pr.ageDays}d until it gets downgraded to a note. Ship, one-change, or kill.`,
        href: '/desk/',
      });
    } else {
      out.push({
        urgency: 'soon',
        text: `#${pr.number} “${pr.title}”${pr.tier ? ` (${pr.tier})` : ''} — on the Desk${pr.verdict === 'attention' ? ', the gate needs your call' : ', no gate verdict yet'}.`,
        href: '/desk/',
      });
    }
  }

  if (interview && interview.answered < interview.total) {
    const days = (4 - weekday + 7) % 7; // days until Thursday's drafter
    out.push({
      urgency: days <= 1 ? 'now' : 'soon',
      text: `Interview “${interview.title}” — ${interview.answered} of ${interview.total} answered. The drafter takes whatever exists ${days === 0 ? 'today' : `in ${days}d (Thursday)`}; answers are what turn it into an Essay instead of a Note.`,
      href: '/interview/',
    });
  }

  const expiring = live
    .filter((b) => b.expiresInDays <= 5)
    .sort((a, b) => a.expiresInDays - b.expiresInDays)
    .slice(0, MAX_EXPIRING_CALLOUTS);
  for (const item of expiring) {
    out.push({
      urgency: 'soon',
      text: `Topic “${item.title}” expires in ${Math.max(item.expiresInDays, 0)}d. Add your take to steer Tuesday's questions toward it, or pass on it.`,
      href: '#fold-backlog',
    });
  }

  const unconsumed = sparks.filter((s) => !s.consumed);
  if (unconsumed.length === 0) {
    out.push({
      urgency: 'later',
      text: 'The inbox has no unconsumed sparks — capture one thought today; sparks outrank scouted topics by policy.',
      href: '/capture/',
    });
  } else {
    const oldest = unconsumed.reduce((a, b) => (a.ageDays >= b.ageDays ? a : b));
    if (oldest.ageDays >= BACKLOG_EXPIRY_DAYS) {
      out.push({
        urgency: 'later',
        text: `A spark from ${oldest.date} is still unconsumed: “${truncate(oldest.text, 90)}” — still true?`,
        href: '#fold-sparks',
      });
    }
  }

  const rank = { now: 0, soon: 1, later: 2 };
  return out.sort((a, b) => rank[a.urgency] - rank[b.urgency]);
}

/**
 * Sparks saved from a topic card ("On “<title>”: …", the Today tab's
 * add-your-take flow) — matched back to the topic so the card can show the
 * author what they already said. Display text drops the provenance URL and
 * any `→ where it went` consumption annotation.
 */
export function takesFor(title: string, sparks: Spark[]): Array<{ date: string; text: string }> {
  const esc = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^On [“"]${esc}[”"][:：]\\s*(.+)$`);
  const out: Array<{ date: string; text: string }> = [];
  for (const s of sparks) {
    const m = s.text.match(re);
    if (!m) continue;
    // Consumption first: a consumed line reads `take ← url → destination`,
    // so the provenance URL is only at the end once the `→ …` tail is gone.
    const text = m[1].replace(/\s*→.*$/, '').replace(/\s*←\s*\S+\s*$/, '').trim();
    if (text) out.push({ date: s.date, text });
  }
  return out;
}

export function parseSparks(content: string): Spark[] {
  const out: Spark[] = [];
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    const m = line.match(/^(\d{4}-\d{2}-\d{2})\s+—\s+(.*)$/);
    if (!m) continue;
    out.push({
      date: m[1],
      text: m[2],
      consumed: /→/.test(m[2]),
      ageDays: ageDaysOf(m[1]),
    });
  }
  return out;
}

/**
 * Parse research/backlog.md. Items are `## YYYY-MM-DD — Title` blocks; the
 * template block in the file's preamble has no real date, so it never matches.
 */
export function parseBacklog(content: string): BacklogItem[] {
  const out: BacklogItem[] = [];
  for (const block of content.split(/^## /m).slice(1)) {
    const lines = block.split('\n');
    const head = lines[0].match(/^(\d{4}-\d{2}-\d{2})\s+—\s+(.+)$/);
    if (!head) continue;
    const body = lines.slice(1).join('\n');
    const rawStatus = body.match(/\*\*Status:\*\*\s*(.+)/)?.[1].trim() ?? '';
    const ageDays = ageDaysOf(head[1]);
    out.push({
      date: head[1],
      title: head[2].trim(),
      thesis: body.match(/\*\*One-line thesis:\*\*\s*(.+)/)?.[1].trim() ?? '',
      draftability: body.match(/\*\*Draftability:\*\*\s*(High|Medium|Low)/i)?.[1] ?? null,
      status: deriveStatus(rawStatus, ageDays),
      ageDays,
      expiresInDays: BACKLOG_EXPIRY_DAYS - ageDays,
      takes: [],
    });
  }
  return out;
}

function classifyStatus(raw: string): BacklogItem['status'] {
  if (/^expired/i.test(raw)) return 'expired';
  if (/^drafted/i.test(raw)) return 'drafted';
  if (/^rejected/i.test(raw)) return 'rejected';
  return 'live';
}

/**
 * Status as the surface should show it. The 21-day clock is enforced by the
 * Monday scout, which writes `Status: Expired` into the file — but that's an
 * external routine, so between an item aging out and the next scout run the
 * file can still say `Backlog`. If we trusted the file alone, an aged-out item
 * would sit in the live queue forever showing "expires in 0d" with no action
 * that resolves it. Project the clock here instead: once a still-"live" item
 * reaches its expiry it reads as expired (and drops out of the live queue),
 * whether or not the scout has caught up. Live items therefore always have at
 * least a day on the clock, so the confusing "expires in 0d" card can't occur.
 * The scout still owns the durable write back to the file.
 */
function deriveStatus(raw: string, ageDays: number): BacklogItem['status'] {
  const status = classifyStatus(raw);
  if (status === 'live' && ageDays >= BACKLOG_EXPIRY_DAYS) return 'expired';
  return status;
}

/** The last few commits touching the posts collection — the "shipped" rail. */
async function recentPublishes(env: Env): Promise<Array<{ date: string; summary: string }>> {
  try {
    const res = await gh(env, 'GET', `commits?path=${encodeURIComponent('src/content/posts')}&per_page=10`);
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{
      commit: { message: string; committer?: { date?: string }; author?: { date?: string } };
    }>;
    return data.slice(0, MAX_PUBLISHED).map((c) => ({
      date: (c.commit.committer?.date ?? c.commit.author?.date ?? '').slice(0, 10),
      summary: c.commit.message.split('\n')[0],
    }));
  } catch {
    return []; // the rail is a reward loop, never a blocker
  }
}

function ageDaysOf(date: string): number {
  return Math.max(0, Math.floor((Date.now() - Date.parse(date)) / DAY_MS));
}

/** 0=Sun … 6=Sat in the pipeline's timezone. */
function weekdayIn(timeZone: string): number {
  const wd = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone || 'Asia/Shanghai',
    weekday: 'short',
  }).format(new Date());
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd);
}

/** The weekly routine schedule (pipeline §4), annotated with proximity. */
function scheduleFrom(weekday: number): Array<{ routine: string; day: string; inDays: number }> {
  const routines: Array<[string, string, number]> = [
    ['Scout', 'Mon', 1],
    ['Interviewer', 'Tue', 2],
    ['Drafter', 'Thu', 4],
    ['Ship gate', 'Fri', 5],
  ];
  return routines.map(([routine, day, target]) => ({
    routine,
    day,
    inDays: (target - weekday + 7) % 7,
  }));
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}
