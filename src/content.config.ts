import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    excerpt: z.string(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['en', 'zh']),
    translationKey: z.string(),
    maturity: z.enum(['seedling', 'growing', 'evergreen']),
  }),
});

export const collections = {
  posts: postsCollection,
};
