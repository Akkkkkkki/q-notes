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
npm test             # Companion Worker API test suite (vitest)
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
├── scripts/             # One-off helpers (VAPID keygen for web push)
├── tests/               # Companion Worker API tests (vitest, mocked GitHub API)
├── worker/              # Companion API (Cloudflare Worker: capture, interview, desk, push)
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

## Companion — Capture + Interview + Desk (Phases 1–3)

The phone-first companion app from [`docs/companion-vision.md`](./docs/companion-vision.md)
exists as its first three phases, installable as one PWA. Repo-as-backend: the app owns no
data; everything reads and writes the same files the automations use.

**Capture** (`/capture`) — "thought to repo in under 15 seconds":

- One text box; OS keyboard dictation works as-is. English, 中文, or mixed — one line
  per thought, landing as a dated line in `research/inbox.md` (commit message
  `spark: <first words>`).
- **Offline queue**: sparks queue in the browser and send when back online.
- **Share target**: on Android, share a URL or quote from any app into Capture; the
  source lands as provenance (`… ← <url>`). On iOS, an Apple Shortcut can POST to the
  same endpoint (see below).
- **Reward loop**: after sending, the last three sparks are shown, including any
  `→ where it went` annotations once automations consume them.

**Interview** (`/interview`) — "answer five questions on a commute":

- The week's brief from `research/interviews/` rendered as a conversation: the
  three-sentence idea on top, one card per question. Dictate or type; each answer
  commits immediately into the brief's `## Author answers` section, attributed per
  question — resumable across days, exactly as the drafter expects.
- Skipping a question is just not answering it; **Not this topic** closes the whole
  brief in one tap, freeing Thursday's drafter to use the fallback ladder.
- **Tuesday push** (optional): a cron checks every Tuesday 08:30 whether the fresh
  brief is still unanswered and wakes subscribed devices via web push. Enable it from
  the Interview page once VAPID keys are configured.

**Desk** (`/desk`) — "ship from the couch":

- One card per open **content** PR (a PR qualifies only if every changed file lives
  under `src/content/`, `drafts/`, `research/`, or `public/images/` — the phone can
  never see or merge a code PR). Each card shows the ship gate's verdict, tier, age,
  and a link to the rendered branch preview — prose approved as prose, not as a diff.
- **Voice panel**: the drafter's verbatim-spine list (*your words, kept*) and one
  "Says X — yours?" question per untraceable opinion, resolved with one-tap
  **keep** / **cut** (lands as a PR comment the next automation run acts on).
- **Ship** offers the two author-owned slots — pick a title (the drafter's three
  options, or type your own) and dictate a replacement last line — both skippable in
  one tap, then merges. The slots ride `POST /api/desk/slots`, the only writer that
  ever touches `src/content/**`: PR branches only, title frontmatter line and final
  paragraph only.
- **One change** (a dictated sentence as a PR comment), **Downgrade to note** (invokes
  the documented remedy), and a smaller **Kill** (comments and closes — killed is a
  valid outcome).
- **Friday push** (optional): after the ship gate's Friday-morning pass, a 08:30 cron
  wakes subscribed devices if anything is sitting on the desk.

### One-time setup

1. Create a fine-grained GitHub PAT scoped to **this repo only**, with
   **Contents: read and write** and **Pull requests: read and write** as its only
   permissions.
2. Set the Worker secrets:
   ```bash
   npx wrangler secret put GITHUB_TOKEN    # the PAT
   npx wrangler secret put CAPTURE_TOKEN   # any long random string, e.g. `openssl rand -hex 24`
   ```
3. Deploy (`npm run build && npx wrangler deploy`), open `/capture` on the phone,
   paste the `CAPTURE_TOKEN` once (stored on-device), and add to home screen.
4. Optional web push: `node scripts/generate-vapid.mjs`, store the two values with
   `npx wrangler secret put VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_JWK`, redeploy, then tap
   "Enable Tuesday notifications" on `/interview` (requires the PWA to be installed on iOS).
5. Optional hardening: put Cloudflare Access in front of `/capture`, `/interview`,
   `/desk`, and `/api/*`.
6. Optional iOS share sheet: an Apple Shortcut that sends
   `POST /api/spark` with header `Authorization: Bearer <CAPTURE_TOKEN>` and JSON body
   `{"text": "...", "url": "..."}`.

The API surface stays small, and every writable path is hard-coded in the Worker:
`POST /api/spark` → `research/inbox.md`; `GET /api/sparks`; `GET /api/brief`,
`POST /api/answer`, `POST /api/brief/close` → `research/interviews/*.md`;
`GET /api/desk`; `POST /api/desk/{ship,comment,kill}` → content PRs only;
`POST /api/desk/slots` → `src/content/**` / `drafts/**` on PR branches only;
`GET /api/push/key`, `POST /api/push/{subscribe,unsubscribe}` →
`research/.companion/push-subscriptions.json`. Local dev: put the secrets in
`.dev.vars` and run `npx wrangler dev` after a build.

## Deployment

The site builds to static files (`npm run build`) and deploys to Cloudflare Workers
using the config in `wrangler.jsonc`. `npm run deploy:check` runs a build and a
dry-run upload to catch configuration issues before a real deploy.
