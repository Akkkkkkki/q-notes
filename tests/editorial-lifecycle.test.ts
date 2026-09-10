import { describe, expect, it } from 'vitest';
import {
  editorialStatusOf,
  isActiveEditorial,
  isNonActiveEditorial,
  validateEditorialLifecycle,
} from '../src/utils/editorialLifecycle';

describe('editorial lifecycle', () => {
  it('keeps legacy posts active by default', () => {
    expect(editorialStatusOf({})).toBe('active');
    expect(isActiveEditorial({})).toBe(true);
    expect(isNonActiveEditorial({})).toBe(false);
  });

  it('requires a replacement for superseded posts', () => {
    expect(validateEditorialLifecycle({ editorialStatus: 'superseded' })).toEqual([
      'superseded posts must declare supersededBy',
    ]);
    expect(
      validateEditorialLifecycle({ editorialStatus: 'superseded', supersededBy: 'current-view' }),
    ).toEqual([]);
  });

  it('rejects replacement pointers on non-superseded posts', () => {
    expect(validateEditorialLifecycle({ editorialStatus: 'active', supersededBy: 'other' })).toContain(
      'supersededBy is only valid for superseded posts',
    );
    expect(validateEditorialLifecycle({ editorialStatus: 'archived', supersededBy: 'other' })).toContain(
      'supersededBy is only valid for superseded posts',
    );
  });

  it('allows archive reasons only on non-active history', () => {
    expect(validateEditorialLifecycle({ editorialStatus: 'active', archiveReason: 'old view' })).toContain(
      'archiveReason is only valid for non-active posts',
    );
    expect(validateEditorialLifecycle({ editorialStatus: 'archived', archiveReason: 'legacy piece' })).toEqual([]);
  });
});

import { validateEditorialCollection, editorialStatusLabel } from '../src/utils/editorialLifecycle';

const pair = (key: string, data: Record<string, any> = {}) => ['en', 'zh'].map(lang => ({ data: { translationKey: key, lang, ...data } }));
describe('collection lifecycle safety', () => {
  it('blocks one-language withdrawals and mismatched dates or targets', () => {
    expect(validateEditorialCollection([{ data: { translationKey: 'old', lang: 'en', editorialStatus: 'archived' } }, ...pair('old').slice(1)])).toContain('old: editorialStatus differs between en/zh');
    const posts = pair('old', { editorialStatus: 'archived', statusDate: '2026-09-10' });
    posts[1].data.statusDate = '2026-09-11';
    expect(validateEditorialCollection(posts)).toContain('old: statusDate differs between en/zh');
  });
  it('allows translated reasons but rejects a missing counterpart reason', () => {
    const posts = pair('old', { editorialStatus: 'archived', archiveReason: 'Old view' });
    posts[1].data.archiveReason = '较早的观点';
    expect(validateEditorialCollection(posts)).toEqual([]);
    delete posts[1].data.archiveReason;
    expect(validateEditorialCollection(posts)).toContain('old: archiveReason must be present in both languages');
  });
  it.each(['missing', 'old', 'incomplete', 'withdrawn'])('blocks invalid replacement %s', target => {
    expect(validateEditorialCollection([
      ...pair('old', { editorialStatus: 'superseded', supersededBy: target }),
      ...pair('incomplete').slice(0, 1),
      ...pair('withdrawn', { editorialStatus: 'archived' }),
    ])).toContain('old: supersededBy must reference a different active bilingual post');
  });
  it('validates reverse references when a previously active target is withdrawn', () => {
    const posts = [...pair('old', { editorialStatus: 'superseded', supersededBy: 'new' }), ...pair('new')];
    expect(validateEditorialCollection(posts)).toEqual([]);
    posts[3].data.editorialStatus = 'archived';
    expect(validateEditorialCollection(posts)).toContain('old: supersededBy must reference a different active bilingual post');
  });
  it('labels history in each reading language', () => {
    expect(editorialStatusLabel({ editorialStatus: 'archived' }, 'zh')).toBe('已归档');
    expect(editorialStatusLabel({ editorialStatus: 'superseded' })).toBe('Earlier view');
    expect(editorialStatusLabel({})).toBe('');
  });
});
