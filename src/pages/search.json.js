// Build-time search index for the ⌘K palette. One JSON document with every
// post in both languages; the modal fetches it once and filters client-side.
// Static output, so this is generated at build and served as a flat file.
import { getCollection } from 'astro:content';

const TIERS = new Set(['note', 'essay', 'tracker']);

export async function GET() {
  const posts = await getCollection('posts');
  const items = posts
    .sort((a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf())
    .map((p) => ({
      title: p.data.title,
      excerpt: p.data.excerpt,
      tags: (p.data.tags ?? []).map((t) => t.toLowerCase()).filter((t) => !TIERS.has(t)),
      maturity: p.data.maturity,
      editorialStatus: p.data.editorialStatus ?? 'active',
      supersededBy: p.data.supersededBy,
      lang: p.data.lang,
      date: new Date(p.data.date).toISOString().slice(0, 10),
      url:
        p.data.lang === 'zh'
          ? `/zh/posts/${p.data.translationKey}`
          : `/posts/${p.data.translationKey}`,
    }));

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json' },
  });
}
