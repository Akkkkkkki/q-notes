import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

describe('author workspace discovery boundary', () => {
  it('keeps all author routes out of the sitemap', () => {
    const config = read('astro.config.mjs');
    for (const route of ['/flow/', '/capture/', '/interview/', '/desk/']) {
      expect(config).toContain(route);
    }
    expect(config).toContain('!AUTHOR_ROUTES.some');
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

  it('documents that discovery controls are not privacy controls', () => {
    const boundary = read('docs/author-workspace-privacy.md');
    expect(boundary).toContain('This repository is public');
    expect(boundary).toContain('they are not access control');
  });
});
