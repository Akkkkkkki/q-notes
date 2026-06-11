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
├── public/              # Static assets (fonts, images, favicon, Capture PWA manifest + SW)
├── worker/              # Companion API (Cloudflare Worker: append-spark endpoint)
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

## Companion — Capture (Phase 1 MVP)

The phone-first companion app from [`docs/companion-vision.md`](./docs/companion-vision.md)
exists as its Phase 1 slice: **Capture**, at `/capture`. A single installable page (PWA)
with one text box — type or dictate a thought, hit send, and it lands as a dated line in
`research/inbox.md` via a commit (`spark: <first words>`), where the editorial pipeline
treats it as first-class material. Repo-as-backend: the app owns no data.

What it does:

- **<15-second capture**: opens into the text box; OS keyboard dictation works as-is.
  English, 中文, or mixed — one line per thought.
- **Offline queue**: sparks queue in the browser and send when back online.
- **Share target**: on Android, share a URL or quote from any app into Capture; the
  source lands as provenance (`… ← <url>`). On iOS, an Apple Shortcut can POST to the
  same endpoint (see below).
- **Reward loop**: after sending, the last three sparks are shown, including any
  `→ where it went` annotations once automations consume them.

### One-time setup

1. Create a fine-grained GitHub PAT scoped to **this repo only**, with
   **Contents: read and write** as its only permission.
2. Set the Worker secrets:
   ```bash
   npx wrangler secret put GITHUB_TOKEN    # the PAT
   npx wrangler secret put CAPTURE_TOKEN   # any long random string, e.g. `openssl rand -hex 24`
   ```
3. Deploy (`npm run build && npx wrangler deploy`), open `/capture` on the phone,
   paste the `CAPTURE_TOKEN` once (stored on-device), and add to home screen.
4. Optional hardening: put Cloudflare Access in front of `/capture` and `/api/*`.
5. Optional iOS share sheet: an Apple Shortcut that sends
   `POST /api/spark` with header `Authorization: Bearer <CAPTURE_TOKEN>` and JSON body
   `{"text": "...", "url": "..."}`.

The API surface is deliberately tiny: `POST /api/spark` (the only writer, hard-coded to
`research/inbox.md`) and `GET /api/sparks` (last three, for the reward loop). Local dev:
put the two secrets in `.dev.vars` and run `npx wrangler dev` after a build.

## Deployment

The site builds to static files (`npm run build`) and deploys to Cloudflare Workers
using the config in `wrangler.jsonc`. `npm run deploy:check` runs a build and a
dry-run upload to catch configuration issues before a real deploy.
