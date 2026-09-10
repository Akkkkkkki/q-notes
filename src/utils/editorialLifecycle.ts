export type EditorialStatus = 'active' | 'superseded' | 'archived';

export interface EditorialLifecycleData {
  editorialStatus?: EditorialStatus;
  supersededBy?: string;
  archiveReason?: string;
  statusDate?: Date | string;
}

export const editorialStatusOf = (data: EditorialLifecycleData): EditorialStatus =>
  data.editorialStatus ?? 'active';

export const isActiveEditorial = (data: EditorialLifecycleData): boolean =>
  editorialStatusOf(data) === 'active';

export const isNonActiveEditorial = (data: EditorialLifecycleData): boolean =>
  !isActiveEditorial(data);

export function validateEditorialLifecycle(data: EditorialLifecycleData): string[] {
  const status = editorialStatusOf(data);
  const errors: string[] = [];

  if (status === 'superseded' && !data.supersededBy?.trim()) {
    errors.push('superseded posts must declare supersededBy');
  }
  if (status !== 'superseded' && data.supersededBy) {
    errors.push('supersededBy is only valid for superseded posts');
  }
  if (status === 'active' && data.archiveReason) {
    errors.push('archiveReason is only valid for non-active posts');
  }

  return errors;
}


/** Validate the whole collection, including references affected by edits to a target. */
export function validateEditorialCollection(posts: Array<{ data: EditorialLifecycleData & { translationKey: string; lang: string } }>): string[] {
  const errors: string[] = [];
  const groups = new Map<string, Map<string, EditorialLifecycleData>>();
  for (const { data } of posts) {
    const pair = groups.get(data.translationKey) ?? new Map();
    if (pair.has(data.lang)) errors.push(`${data.translationKey}: duplicate ${data.lang} version`);
    pair.set(data.lang, data);
    groups.set(data.translationKey, pair);
    errors.push(...validateEditorialLifecycle(data).map(e => `${data.translationKey}/${data.lang}: ${e}`));
  }
  const dateKey = (date: Date | string | undefined) => date ? new Date(date).toISOString().slice(0, 10) : '';
  for (const [key, pair] of groups) {
    const en = pair.get('en');
    const zh = pair.get('zh');
    if (!en || !zh) {
      if ([...pair.values()].some(isNonActiveEditorial)) errors.push(`${key}: lifecycle requires both language versions`);
      continue;
    }
    if (editorialStatusOf(en) !== editorialStatusOf(zh)) errors.push(`${key}: editorialStatus differs between en/zh`);
    if (en.supersededBy !== zh.supersededBy) errors.push(`${key}: supersededBy differs between en/zh`);
    if (dateKey(en.statusDate) !== dateKey(zh.statusDate)) errors.push(`${key}: statusDate differs between en/zh`);
    // Reasons are transcreated: require matching presence, not identical prose.
    if (Boolean(en.archiveReason?.trim()) !== Boolean(zh.archiveReason?.trim())) errors.push(`${key}: archiveReason must be present in both languages`);
    for (const data of [en, zh]) {
      if (editorialStatusOf(data) !== 'superseded' || !data.supersededBy) continue;
      const target = groups.get(data.supersededBy);
      if (data.supersededBy === key || !target?.get('en') || !target?.get('zh') ||
          !isActiveEditorial(target.get('en')!) || !isActiveEditorial(target.get('zh')!)) {
        errors.push(`${key}: supersededBy must reference a different active bilingual post`);
      }
    }
  }
  return errors;
}

export function editorialStatusLabel(data: EditorialLifecycleData, lang = 'en'): string {
  if (isActiveEditorial(data)) return '';
  return editorialStatusOf(data) === 'superseded'
    ? (lang === 'zh' ? '较早的观点' : 'Earlier view')
    : (lang === 'zh' ? '已归档' : 'Archived');
}
