import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const drafter = read('automations/03-drafter.md');
const critic = read('automations/03b-editorial-critic.md');
const criticDoc = read('docs/editorial-critic.md');
const endpoint = read('docs/natural-endpoint.md');

describe('natural endpoint / third-act contract', () => {
  it('keeps the endpoint check semantic rather than a percentage deletion quota', () => {
    expect(endpoint).toContain('adversarial thought experiment, not a deletion quota');
    expect(endpoint).toContain('Final ~30%');
    expect(endpoint).toContain('Strongest-idea compression');
    expect(critic).toContain('This is not a deletion quota');
    expect(criticDoc).toContain('The percentage is adversarial, not a quota');
  });

  it('prevents the drafter from manufacturing completion furniture', () => {
    expect(drafter).toContain(
      'Do not manufacture a prediction, counterargument,\nsecond act, example, or conclusion to preserve an outline.'
    );
    expect(drafter).toContain('rerun Material Audit and Form decision before keeping the new claim');
    expect(endpoint).toContain('The Drafter must not ask by default');
    expect(endpoint).toContain('what prediction follows?');
  });

  it('makes CUT and SPLIT distinct natural-endpoint outcomes', () => {
    expect(endpoint).toContain('Use **CUT** when late material is expendable completion furniture');
    expect(endpoint).toContain('Use **SPLIT** when the late material contains a genuinely useful second idea');
    expect(critic).toContain('If the strongest honest article ends earlier, return `CUT` or `SPLIT`');
  });

  it('preserves provenance for useful split ideas instead of promoting them', () => {
    expect(endpoint).toContain('return it to the appropriate inbox/backlog source');
    expect(endpoint).toContain('keep it in the existing candidate-hypothesis flow');
    expect(endpoint).toContain('does not inherit the current article\'s evidence, form decision, or author ownership');
    expect(critic).toContain('move the other idea(s) back to inbox/candidate-hypothesis flow with provenance');
  });

  it('allows a natural stop without predictions, counterarguments, or a neat closer', () => {
    expect(endpoint).toContain('It does not owe a prediction, counterargument section, future implications, or aphoristic close');
    expect(critic).toContain('A career implication, business-model implication, taxonomy expansion, prediction');
    expect(criticDoc).toContain('An article is allowed to stop when its idea is complete');
  });

  it('does not force bilingual drafts to share paragraph or section endpoints', () => {
    expect(endpoint).toContain('EN and ZH share the retained Claim Ledger');
    expect(endpoint).toContain('different section counts, order, examples, or closing sentences');
    expect(drafter).toContain('The two files share one semantic source package; they do **not** share one required');
  });

  it('calibrates against known over-completion fixtures and a positive control', () => {
    expect(endpoint).toContain('`taste-is-a-bet` (#85)');
    expect(endpoint).toContain('Historical PR #64');
    expect(endpoint).toContain('`agent-prs-need-traffic-control` (#77)');
    expect(endpoint).toContain('Positive long-form control');
  });

  it('reuses the single integrated critic instead of adding another reviewer', () => {
    expect(endpoint).toContain('Issue #68 remains the only PR-facing critic contract');
    expect(critic).toContain('Issue #68 owns the single integrated editorial-critic surface');
    expect(endpoint).toContain('Do not create another state machine, reviewer, PR section');
  });
});
