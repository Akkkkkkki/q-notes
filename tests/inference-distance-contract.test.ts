import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const contract = readFileSync(
  new URL('../docs/inference-distance.md', import.meta.url),
  'utf8',
);

const pipeline = readFileSync(new URL('../docs/pipeline.md', import.meta.url), 'utf8');
const critic = readFileSync(
  new URL('../automations/03b-editorial-critic.md', import.meta.url),
  'utf8',
);

describe('inference-distance editorial contract', () => {
  it('defines a small semantic distance vocabulary rather than sentence counting', () => {
    expect(contract).toContain('`inference_distance`: `0 | 1 | 2 | 3+`');
    expect(contract).toContain('Do not mechanically count arrows or sentences');
    expect(contract).toContain('The classification is semantic');
  });

  it('keeps near inference compatible with the existing Q-derived ownership rule', () => {
    expect(contract).toContain('Distance 1 may be `Q-derived`');
    expect(pipeline).toContain('`Q-derived`');
    expect(pipeline).toContain('near inference');
  });

  it('quarantines model-generated substantive and theory-level inference', () => {
    expect(contract).toContain(
      'Model-generated distance-2 claims default to `Model-hypothesis`',
    );
    expect(contract).toContain(
      'Model-generated distance-3+ claims are always `Model-hypothesis` until explicit author adoption',
    );
  });

  it('requires inspectable parent chains for derived load-bearing claims', () => {
    expect(contract).toContain('`parent_claims`: stable Claim IDs or evidence refs');
    expect(contract).toContain('`parent_claims` must make the load-bearing chain inspectable');
    expect(contract).toContain('parent C1');
    expect(contract).toContain('parent C2');
  });

  it('keeps evidence role and inference distance as separate axes', () => {
    expect(contract).toContain('Evidence role and inference distance are orthogonal');
    expect(contract).toContain('evidence role asks what a source does for a claim');
    expect(contract).toContain(
      'inference distance asks how much new reasoning sits between the supporting material and the claim',
    );
  });

  it('does not let fluent synthesis or source count collapse a reasoning gap', () => {
    expect(contract).toContain(
      'Source count, fluent connective prose, or analogy cannot lower the distance',
    );
    expect(contract).toContain(
      'Words such as `therefore`, `which means`, `the implication is`, or `the same logic transfers` do not reduce inference distance',
    );
  });

  it('forces new load-bearing post-audit claims back through the ledger and audit', () => {
    expect(contract).toContain(
      'If drafting introduces a new load-bearing distance-2+ claim after Material Audit',
    );
    expect(contract).toContain('Re-run the Material Audit/form decision before continuing');
  });

  it('feeds the existing single critic instead of creating another PR protocol', () => {
    expect(contract).toContain('Issue #68 remains the single critic surface');
    expect(contract).toContain(
      'Do not add a permanent `Inference-distance audit` section to PRs',
    );
    expect(critic).toContain('inference distance');
  });

  it('preserves the same semantic distance and ownership across EN and ZH', () => {
    expect(contract).toContain(
      'EN and ZH share the same Claim IDs, ownership, inference distance, and parent relationships',
    );
    expect(contract).toContain(
      'A Chinese rewrite cannot strengthen a distance-2 hypothesis into a declarative current position',
    );
  });

  it('carries the issue calibration fixtures and a non-bureaucratic positive boundary', () => {
    expect(contract).toContain('`consulting-barbell` (#80)');
    expect(contract).toContain('`consulting-coordination` (#81)');
    expect(contract).toContain('`helpful-agents-authorization-bug` (#83)');
    expect(contract).toContain('It does not require every sentence to carry an inference label');
    expect(contract).toContain('It does not prohibit inference or original thinking');
  });
});
