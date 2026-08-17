import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const critic = read('automations/03b-editorial-critic.md');
const shipGate = read('automations/04-ship-gate.md');
const pipeline = read('docs/pipeline.md');
const pipelineZh = read('docs/pipeline.zh.md');
const criticDoc = read('docs/editorial-critic.md');
const fixtures = read('tests/editorial/critic-v2.md');

describe('editorial critic integration contract', () => {
  it('exposes one compact five-verdict PR contract bound to a head SHA', () => {
    for (const source of [critic, criticDoc]) {
      expect(source).toContain('## Editorial critic');
      expect(source).toContain('KEEP | CUT | DOWNGRADE | SPLIT | SKIP');
      expect(source).toContain('### Strongest single idea');
      expect(source).toContain('### Blocking reasoning failures');
      expect(source).toContain('### Required scope cuts / splits');
      expect(source).toContain('### Optional warnings');
      expect(source).toContain('q-notes: editorial-critic head=<full PR head SHA>');
    }
  });

  it('keeps deterministic checks outside critic blocking severity', () => {
    expect(critic).toContain('Do **not** block for deterministic build failures');
    expect(criticDoc).toContain('**Outside critic / ship or deterministic checks:**');
    expect(critic).toContain('bilingual claim parity');
    expect(critic).toContain('ordinary voice/style preferences');
  });

  it('requires an applicable KEEP before the ship gate can say Ready', () => {
    expect(shipGate).toContain('Require a current editorial-critic KEEP');
    expect(shipGate).toContain('latest applicable verdict must be **`KEEP`**');
    expect(shipGate).toContain('No critic comment → stop');
    expect(shipGate).toContain('CUT`, `DOWNGRADE`, `SPLIT`, or `SKIP`');
  });

  it('invalidates stale semantic approvals without re-running for purely mechanical edits', () => {
    expect(critic).toContain('## Freshness contract');
    expect(critic).toContain('A fresh critic pass is required after changes to any of these');
    expect(shipGate).toContain('purely mechanical/claim-preserving');
    expect(shipGate).toContain('require a fresh Routine 03b pass');
  });

  it('wires the critic between drafter and ship gate in both canonical pipeline docs', () => {
    expect(pipeline).toContain('03b Editorial critic');
    expect(pipeline).toContain('### 4.3b Thursday — Editorial critic');
    expect(pipelineZh).toContain('03b 编辑批评器');
    expect(pipelineZh).toContain('### 4.3b 周四 — 独立编辑批评器');
  });

  it('keeps v3 child signals behind the same integration surface', () => {
    expect(critic).toContain('## Integrated v3 signal rule');
    expect(critic).toContain('#68 owns severity and integration');
    expect(criticDoc).toContain('single integration owner');
  });

  it('ships positive and negative semantic regression fixtures', () => {
    expect(fixtures).toContain('PR #62');
    expect(fixtures).toContain('PR #64');
    expect(fixtures).toContain('PR #58 before deeper game research');
    expect(fixtures).toContain('taste-is-a-bet');
    expect(fixtures).toContain('pure old-framework application');
    expect(fixtures).toContain('A positive fixture is allowed to pass');
  });
});
