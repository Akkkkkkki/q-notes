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
