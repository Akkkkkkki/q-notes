// Compact relative age (e.g. "2d ago", "3w ago") in English or Chinese.
// Computed at build time from a post's date — the site rebuilds on the weekly
// publish loop, so ages stay fresh enough for a "currently tending" signal.
export function relativeTime(date: Date | string, lang: 'en' | 'zh' = 'en'): string {
  const then = new Date(date).getTime();
  const days = Math.max(0, Math.floor((Date.now() - then) / 86_400_000));

  if (lang === 'zh') {
    if (days === 0) return '今天';
    if (days < 7) return `${days}天前`;
    if (days < 30) return `${Math.floor(days / 7)}周前`;
    if (days < 365) return `${Math.floor(days / 30)}个月前`;
    return `${Math.floor(days / 365)}年前`;
  }

  if (days === 0) return 'today';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
