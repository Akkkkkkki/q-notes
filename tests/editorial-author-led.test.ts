import { mkdtempSync, readFileSync, rmSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

// Run real bilingual text through CI's mechanical gate. This is deliberately NOT
// an editorial-quality test: the unsupported pair demonstrates why critic KEEP
// and author approval remain separate from a successful build/content gate.
function mechanicalGate(stem: string) {
  const dir = mkdtempSync(join(tmpdir(), 'author-led-'));
  try {
    const paths = ['en', 'zh'].map((lang) => {
      const target = join(dir, `${stem}.${lang}.md`);
      copyFileSync(new URL(`./editorial/author-led/${stem}.${lang}.md`, import.meta.url), target);
      return target;
    });
    return spawnSync(process.execPath, ['scripts/content-gate.mjs', ...paths], { encoding: 'utf8' });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('author-led writing: mechanical versus editorial evidence', () => {
  it('accepts a complete short bilingual observation with no prediction or theory', () => {
    const en = readFileSync(new URL('./editorial/author-led/short-observation.en.md', import.meta.url), 'utf8');
    const body = en.split('---')[2];
    expect(body.trim().split(/\s+/).length).toBeLessThan(250);
    const run = mechanicalGate('short-observation');
    expect(run.error).toBeUndefined();
    expect(run.status, run.stdout + run.stderr).toBe(0);
  });

  it('does not mistake structural acceptance of unsupported claims for editorial review', () => {
    const run = mechanicalGate('unsupported-inference');
    expect(run.error).toBeUndefined();
    // Semantic verdict for this exact fixture is CUT/blocked in author-led-v1.md.
    // Passing this structural gate cannot establish source support or Q ownership.
    expect(run.status, run.stdout + run.stderr).toBe(0);
  });
});
