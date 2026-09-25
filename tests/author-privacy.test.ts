import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

describe('author workspace discovery boundary', () => {
  it('keeps all author routes out of the sitemap', () => {
    const config = read('astro.config.mjs');
    for (const route of ['/flow/', '/capture/', '/interview/', '/desk/']) {
      expect(config).toContain(route);
    }
    // Exact pathname match: a public tag or post named `desk` must stay in the sitemap.
    expect(config).toContain('!AUTHOR_ROUTES.has(new URL(page).pathname)');
  });

  it('marks the shared author shell noindex', () => {
    const layout = read('src/layouts/CompanionLayout.astro');
    expect(layout).toContain('<meta name="robots" content="noindex" />');
  });

  it('makes public repository visibility explicit in both UI languages', () => {
    const layout = read('src/layouts/CompanionLayout.astro');
    expect(layout).toContain('public GitHub repository are not private');
    expect(layout).toContain('公开 GitHub 仓库里的草稿和 PR 不是私密内容');
  });

  it('offers a rotation path without a shell command, in every rendering of the connect hint', () => {
    const layout = read('src/layouts/CompanionLayout.astro');
    const hints = layout.split('\n').filter((l) => l.includes("'shell.connectFine':"));
    expect(hints).toHaveLength(2); // EN and ZH strings; the static fallback markup is checked below
    const fallback = layout.slice(layout.indexOf('data-i18n-html="shell.connectFine"'));
    const fallbackText = fallback.slice(0, fallback.indexOf('</p>'));
    for (const text of [...hints, fallbackText]) {
      // No shell command, and no "recover": deployed secrets can't be read back.
      expect(text).not.toMatch(/wrangler|npx|recover/i);
      // Name the binding to rotate: the Worker also holds GITHUB_TOKEN.
      expect(text).toContain('CAPTURE_TOKEN');
      expect(text).toMatch(/Variables and Secrets/);
    }
  });

  it('documents that discovery controls are not privacy controls', () => {
    const boundary = read('docs/author-workspace-privacy.md');
    expect(boundary).toContain('This repository is public');
    expect(boundary).toContain('they are not access control');
  });
});
