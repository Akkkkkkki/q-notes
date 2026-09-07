import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const agents = read('AGENTS.md');
const spine = read('docs/article-spine.md');
const drafter = read('automations/03-drafter.md');
const critic = read('automations/03b-editorial-critic.md');

describe('article spine contract', () => {
  it('places the spine after material/form decisions and before outlining', () => {
    expect(spine).toContain('Material Audit\n→ Form decision\n→ Article spine\n→ Outline');
    expect(spine).toContain('before** outlining or drafting prose');
    expect(spine).toContain('return to the Claim Ledger and rerun Material Audit/Form decision');
  });

  it('allows only thought-led spine types', () => {
    for (const type of [
      'author-claim',
      'firsthand-case',
      'concrete-mechanism',
      'correction',
      'unresolved-question',
    ]) {
      expect(spine).toContain(`**\`${type}\`**`);
    }

    expect(spine).toContain('There is deliberately no `research-trend`');
    expect(spine).toContain('three-papers');
    expect(spine).toContain('industry-consensus');
  });

  it('binds the spine to existing Claim Ledger IDs instead of adding hidden claims', () => {
    expect(spine).toContain('- Claim refs: <one or more Claim Ledger IDs>');
    expect(spine).toContain('must point to claims already present in the shared Claim Ledger');
    expect(spine).toContain('may not introduce a load-bearing claim that is absent from the frozen Claim Ledger');
  });

  it('requires every major section to serve the spine with irreplaceable material', () => {
    expect(spine).toContain('Which part of the spine does this advance, challenge, or delimit?');
    expect(spine).toContain('What irreplaceable material does it add?');
    expect(spine).toContain('What role does any research play?');
    expect(spine).toContain('another recent study says something related');
  });

  it('defines a citation-hiding test without weakening sourcing requirements', () => {
    expect(spine).toContain('## Citation-hiding test');
    expect(spine).toContain('Hide every citation, source name');
    expect(spine).toContain('This is a reasoning test, not permission to publish unsourced claims');
    expect(spine).toContain('paper A\n→ interpretation\n→ paper B');
  });

  it('uses the existing drafter and single critic surfaces', () => {
    expect(drafter).toContain('Only after the audit and form decision are fixed should you create the outline.');
    expect(critic).toContain('article spine and citation-hiding test');
    expect(critic).toContain('#68 owns severity and integration');
    expect(spine).toContain('Do not add another reviewer');
  });

  it('makes the contract live through the repository-wide agent instructions', () => {
    expect(agents).toContain('docs/article-spine.md');
    expect(agents).toContain('Sources support the article spine; they do not become the spine.');
    expect(agents).toContain('citation-hiding test');
    expect(agents).toContain('## Article spine');
  });

  it('carries the issue calibration fixtures', () => {
    expect(spine).toContain('`agent-coordination-debt` (#76)');
    expect(spine).toContain('`pull-requests-are-knowledge-imports` (#84)');
    expect(spine).toContain('`taste-is-a-bet` (#85)');
  });
});
