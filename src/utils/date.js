import { format } from 'date-fns';

/**
 * Format a date string or Date object into a human-readable format
 * @param {string|Date} date - The date to format
 * @param {'en'|'zh'} [lang] - The language to format the date for
 * @returns {string} - The formatted date string
 */
export function formatDate(date, lang) {
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  if (lang === 'zh') {
    return format(dateObject, 'yyyy年M月d日');
  }
  return format(dateObject, 'MMMM d, yyyy');
}
