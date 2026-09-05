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
