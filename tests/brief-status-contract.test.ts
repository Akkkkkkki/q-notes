import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { briefBacklogSource, rejectItem } from '../worker/backlog';
import { parseBacklog } from '../worker/flow';
import { parseBrief } from '../worker/interview';

// The routine prompts write statuses that the phone client parses. These tests
// take the status literal from each prompt and run it through the Worker's own
// parsers, so a prompt rewrite cannot drop or reword a status the client needs.

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const DAY_MS = 86400000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS).toISOString().slice(0, 10);

function statusTemplate(prompt: string, pattern: RegExp): string {
  const m = prompt.match(pattern);
  expect(m, `prompt no longer contains ${pattern}`).not.toBeNull();
  return m![1];
}

describe('routine status writes match the phone client (#152, #153)', () => {
  it('Routine 02 marks a chosen backlog item so it stays live and cannot be rejected', () => {
    const template = statusTemplate(
      read('automations/02-interview-brief.md'),
      /`(Interviewing since YYYY-MM-DD)`/
    );
    const topicDate = daysAgo(40); // well past the 21-day backlog expiry
    const status = template.replace('YYYY-MM-DD', daysAgo(2));
    const backlog = `# Research Backlog\n\n## ${topicDate} — Chosen topic\n\n**Status:** ${status}\n\n**One-line thesis:** Open.\n`;

    expect(parseBacklog(backlog)[0].status).toBe('live');
    const rejected = rejectItem(backlog, topicDate, 'Chosen topic', '**Status:** Rejected');
    expect(rejected).toMatchObject({ status: 400 });
  });

  it('Routine 02 links the brief to its backlog item in the form the close path reads', () => {
    const template = statusTemplate(
      read('automations/02-interview-brief.md'),
      /`(\*\*Source:\*\* backlog item YYYY-MM-DD — <exact backlog title>)`/
    );
    const line = template.replace('YYYY-MM-DD', '2026-09-07').replace('<exact backlog title>', 'A chosen topic');
    expect(briefBacklogSource(`# Interview: X\n\n${line}\n**Status:** Awaiting answers\n`)).toEqual({
      date: '2026-09-07',
      title: 'A chosen topic',
    });
  });

  it('Routine 03 records a no-draft outcome as finished, not as a new prompt to the author', () => {
    const drafter = read('automations/03-drafter.md');
    const briefStatus = statusTemplate(drafter, /`(Closed \(no draft, YYYY-MM-DD\))`/).replace(
      'YYYY-MM-DD',
      daysAgo(0)
    );
    const brief = parseBrief(
      'research/interviews/2026-09-01-example.md',
      `# Interview: Example\n\n**Status:** ${briefStatus}\n\n## The idea in three sentences\nIdea.\n\n## Questions\n1. Q?\n\n## Author answers\n\n### Q1\nAn answer.\n`
    );
    // Closed briefs drop out of Flow's needsYou list and are not re-offered as requests.
    expect(brief.closed).toBe(true);
    expect(brief.ready).toBe(false);
    expect(brief.drafted).toBe(false);
    expect(brief.questions[0].answer).toBe('An answer.');

    const topicStatus = statusTemplate(drafter, /`(Rejected \(YYYY-MM-DD, no draft from interview\))`/).replace(
      'YYYY-MM-DD',
      daysAgo(0)
    );
    const backlog = `# Research Backlog\n\n## ${daysAgo(40)} — Chosen topic\n\n**Status:** ${topicStatus}\n`;
    expect(parseBacklog(backlog)[0].status).toBe('rejected');
  });
});
