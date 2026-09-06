import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const agents = read('AGENTS.md');
const evidence = read('docs/evidence-roles.md');

describe('evidence-role editorial contract', () => {
  it('defines the six machine-readable evidence roles separately from claim ownership', () => {
    for (const role of [
      'direct-evidence',
      'example',
      'counterexample',
      'context',
      'analogy',
      'hypothesis-source',
    ]) {
      expect(evidence).toContain(`\`${role}\``);
    }

    expect(evidence).toContain('ownership says whose claim it is');
    expect(evidence).toContain('evidence role says what a source can actually establish');
    expect(evidence).toContain('Role is **claim-relative**');
  });

  it('prevents source-count and synthesis prose from upgrading weak evidence', () => {
    expect(evidence).toContain('context + context + analogy != direct-evidence');
    expect(evidence).toContain('Ten context sources do not equal one direct source');
    expect(evidence).toContain('Citation count is not material density');
    expect(evidence).toContain('Do not bridge the gap with synthesis prose');
  });

  it('requires role-gap-driven research and critic mismatch reporting', () => {
    expect(evidence).toContain('Research is role-gap driven');
    expect(evidence).toContain('direct measurement of mechanism M');
    expect(evidence).toContain('blocking reasoning failure');
    expect(evidence).toContain('context -> causal support');
    expect(evidence).toContain('analogy -> target-domain conclusion');
  });

  it('keeps evidence roles internal and preserves the single critic surface', () => {
    expect(evidence).toContain('single `## Editorial critic` surface');
    expect(evidence).toContain('Public articles do not need labels or a');
    expect(evidence).toContain('Firsthand author material keeps its existing Author Kernel');
  });

  it('wires the normative contract into every content agent through AGENTS.md', () => {
    expect(agents).toContain('docs/evidence-roles.md');
    expect(agents).toContain('assign an evidence role before using an external source');
    expect(agents).toContain('search for the missing evidence role');
    expect(agents).toContain('role upgrade');
  });

  it('contains the issue calibration fixtures', () => {
    expect(evidence).toContain('consulting-coordination');
    expect(evidence).toContain('consulting-outcomes');
    expect(evidence).toContain('agent-prs-need-traffic-control');
  });
});
