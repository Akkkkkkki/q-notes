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

    // --- Optional structured features surfaced by the reading layout ----------
    // All optional so the required contract (and the content gate) is unchanged;
    // a post opts into each block by adding it. translationKeys, not URLs, keep
    // connections language-agnostic — the layout resolves them per language.

    // Note graph. `linksTo` = pieces this one builds on / points at; `citedBy` =
    // pieces that reference this one. Rendered in the post aside as "Connections".
    connections: z
      .object({
        linksTo: z.array(z.string()).default([]),
        citedBy: z.array(z.string()).default([]),
      })
      .optional(),

    // A single tracked, falsifiable prediction (the essay tier's payoff). Shown
    // as the "Prediction · tracked" card near the end of the piece.
    prediction: z
      .object({
        statement: z.string(),
        confidence: z.enum(['low', 'medium', 'high']),
        falsifier: z.string().optional(),
        status: z.enum(['open', 'right', 'wrong', 'partial']).default('open'),
        by: z.string().optional(), // human-readable horizon, e.g. "end of 2027"
      })
      .optional(),

    // A coined term this piece defines on first use (glossary discipline, per
    // AGENTS.md). Rendered as the "Defined term" callout.
    definedTerm: z
      .object({
        term: z.string(),
        pos: z.string().optional(), // part of speech, e.g. "n."
        definition: z.string(),
      })
      .optional(),

    // Curated source list, numbered in order. The prose keeps its inline links;
    // this is the collected, scannable bibliography shown under "Sources".
    sources: z
      .array(
        z.object({
          label: z.string(), // short attribution, e.g. "openai.com"
          title: z.string(), // what it is, e.g. "How agents are transforming work"
          url: z.string().optional(),
        }),
      )
      .default([])
      .optional(),
  }),
});

export const collections = {
  posts: postsCollection,
};
