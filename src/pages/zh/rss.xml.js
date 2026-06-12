import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts', ({ data }) => data.lang === 'zh');

  // Sort posts by date (most recent first)
  const sortedPosts = posts.sort((a, b) =>
    new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf()
  );

  return rss({
    title: "Q的笔记",
    description: '关于 AI、技术、商业的笔记、文章与观点，偶尔也写点别的。',
    site: context.site,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt,
      link: `/zh/posts/${post.data.translationKey}/`,
    })),
    customData: `<language>zh-cn</language>`,
  });
}
