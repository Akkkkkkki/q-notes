# q-notes

Source for [Q's Notes](https://notes.qiuyue.dev) — a personal, bilingual (English / 中文)
blog for notes, essays, and opinions on AI, technology, software, business, consulting,
and the occasional aside on games, books, films, or culture.

## What's in this repo

This repo is two things layered together:

1. **A small Astro site** — the blog itself: posts, layouts, pages, and styles.
2. **An editorial pipeline** — automation prompts that scout topics, interview the
   author, draft bilingual posts, and run a weekly publish loop, so writing the
   author's own point of view is the only manual step. If you're an agent (or human)
   working on content here, start with [`AGENTS.md`](./AGENTS.md).

## Stack

- [Astro](https://astro.build/) (static output) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- Astro content collections for posts
- Deployed to Cloudflare Workers via [Wrangler](https://developers.cloudflare.com/workers/wrangler/)

## Development

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # production build to dist/
npm run preview      # preview the production build
npm run deploy:check # build + dry-run Wrangler deploy
```

## Project structure

```
├── automations/        # Editorial pipeline prompts (scout, interview, drafter, ship gate, gardener)
├── docs/
│   ├── pipeline.md          # Editorial pipeline design - source of truth
│   └── companion-vision.md  # Vision for a phone-first companion app
├── research/
│   ├── backlog.md           # Topic backlog
│   ├── inbox.md             # Author's raw idea inbox
│   ├── voice.md             # Voiceprint: stances, signature phrasing, never-say terms
│   ├── glossary.md          # EN <-> 中文 glossary for transcreation
│   └── interviews/          # Interview briefs + author answers
├── src/
│   ├── components/      # Astro components (post cards, lists, dark mode toggle, ...)
│   ├── content/posts/   # Blog posts (Markdown)
│   ├── layouts/         # Base + post layouts
│   ├── pages/           # Routes (home, journal, posts, tags, about, RSS)
│   ├── styles/
│   └── utils/
├── public/              # Static assets (fonts, images, favicon)
├── astro.config.mjs
└── wrangler.jsonc       # Cloudflare Workers deploy config
```

## Writing a post

Posts live in `src/content/posts/` as Markdown, with frontmatter validated by
`src/content.config.ts`:

```yaml
---
title: Post title
date: 2026-06-01
excerpt: One- or two-sentence summary used in lists, RSS, and OG tags.
image: /images/my-image.jpg   # optional
tags: ["English", "AI", "Notes"]
---
```

Images referenced from frontmatter or post content go in `public/images/`.

## Editorial pipeline

Most posts here come out of a weekly automation loop (scout -> interview -> author
braindump -> draft -> ship gate, plus a monthly gardener pass) rather than ad hoc
writing. The full design — content tiers (note / essay / tracker), the bilingual
transcreation contract, and per-tier definitions of done — lives in
[`docs/pipeline.md`](./docs/pipeline.md). [`AGENTS.md`](./AGENTS.md) is the always-on
summary any agent should read before drafting or editing content, and
[`docs/companion-vision.md`](./docs/companion-vision.md) sketches a possible phone-first
companion app for the pipeline's recurring author touchpoints.

## Deployment

The site builds to static files (`npm run build`) and deploys to Cloudflare Workers
using the config in `wrangler.jsonc`. `npm run deploy:check` runs a build and a
dry-run upload to catch configuration issues before a real deploy.
