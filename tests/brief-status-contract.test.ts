import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { rejectItem } from '../worker/backlog';
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

  it('Routine 03 hands back a no-draft green light as a reopenable, non-ready brief', () => {
    const template = statusTemplate(
      read('automations/03-drafter.md'),
      /`(Answers in progress \(YYYY-MM-DD\))`/
    );
    const status = template.replace('YYYY-MM-DD', daysAgo(0));
    const brief = parseBrief(
      'research/interviews/2026-09-01-example.md',
      `# Interview: Example\n\n**Status:** ${status}\n\n## The idea in three sentences\nIdea.\n\n## Questions\n1. Q?\n\n## Author answers\n\n### Q1\nAn answer.\n`
    );

    expect(brief.ready).toBe(false);
    expect(brief.closed).toBe(false);
    expect(brief.drafted).toBe(false);
  });
});
