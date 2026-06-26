#!/usr/bin/env node
// Content gate — mechanical half of the Friday ship gate (docs/pipeline.md §5–6),
// run as CI so nothing un-vetted can merge. It checks only the posts this PR
// adds or changes (legacy posts predate the tier/bilingual contract), splitting
// findings into ERRORS (block the merge) and WARNINGS (advisory, never block).
//
// Usage:
//   node scripts/content-gate.mjs [file ...]   # explicit files
//   BASE_SHA=<sha> node scripts/content-gate.mjs   # diff against a base (CI)
//   node scripts/content-gate.mjs               # falls back to all posts
//
// The build (npm run build) is the companion check that enforces the frontmatter
// schema for every post; this script adds the things the schema can't express.

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const POSTS_DIR = 'src/content/posts';
const TIERS = ['note', 'essay', 'tracker'];
const WORD_BANDS = { note: [300, 700], essay: [800, 1500] }; // tracker: any
const EM_DASH_PER_WORDS = 150; // flag denser than ~1 em dash / 150 words
const RUN_ON_WORDS = 60; // flag a single sentence longer than this

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

// --- Build an index of every post on disk (for pair lookups) ---------------
function parse(path) {
  const raw = readFileSync(path, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { path, frontmatter: null, body: raw };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    fm[kv[1]] = kv[2].trim();
  }
  const tagsRaw = fm.tags ?? '';
  fm.tagList = [...tagsRaw.matchAll(/["']([^"']+)["']/g)].map((t) => t[1]);
  return { path, frontmatter: fm, body: m[2] };
}

const allFiles = existsSync(POSTS_DIR)
  ? readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')).map((f) => join(POSTS_DIR, f))
  : [];
const index = new Map(); // translationKey -> { en?, zh? }
for (const f of allFiles) {
  const p = parse(f);
  const key = p.frontmatter?.translationKey;
  const lang = p.frontmatter?.lang;
  if (key && (lang === 'en' || lang === 'zh')) {
    const e = index.get(key) ?? {};
    e[lang] = p;
    index.set(key, e);
  }
}

// --- Decide which files to check -------------------------------------------
function changedFiles() {
  if (process.argv.length > 2) return process.argv.slice(2);
  const base = process.env.BASE_SHA;
  if (base) {
    try {
      const out = execSync(
        `git diff --name-only --diff-filter=AM ${base} HEAD -- ${POSTS_DIR}`,
        { encoding: 'utf8' }
      );
      return out.split('\n').map((s) => s.trim()).filter(Boolean);
    } catch {
      console.warn('content-gate: git diff failed, checking all posts');
    }
  }
  return allFiles;
}

const targets = changedFiles().filter((f) => f.endsWith('.md') && existsSync(f));
if (targets.length === 0) {
  console.log('content-gate: no changed posts to check. ✅');
  process.exit(0);
}

// --- Checks -----------------------------------------------------------------
const REQUIRED = ['title', 'date', 'excerpt', 'lang', 'translationKey', 'maturity'];

for (const file of targets) {
  const name = basename(file);
  const post = parse(file);
  const fm = post.frontmatter;

  if (!fm) {
    err(name, 'no parseable frontmatter block');
    continue;
  }
  for (const field of REQUIRED) {
    if (!fm[field]) err(name, `missing required frontmatter field "${field}"`);
  }
  if (fm.tagList.length === 0) err(name, 'no tags');

  const tier = fm.tagList.map((t) => t.toLowerCase()).find((t) => TIERS.includes(t));
  if (!tier) {
    err(name, `tags must include a tier (one of ${TIERS.join('/')})`);
  }

  // Bilingual pair must exist on disk (both en and zh for this translationKey).
  const key = fm.translationKey;
  const pair = key ? index.get(key) : null;
  if (key) {
    if (!pair?.en) err(name, `missing English counterpart (translationKey "${key}")`);
    if (!pair?.zh) err(name, `missing Chinese counterpart (translationKey "${key}")`);
    if (pair?.en && pair?.zh) {
      if (pair.en.frontmatter.date !== pair.zh.frontmatter.date)
        warn(name, `date differs between en/zh versions (${pair.en.frontmatter.date} vs ${pair.zh.frontmatter.date})`);
      if (pair.en.frontmatter.maturity !== pair.zh.frontmatter.maturity)
        warn(name, `maturity differs between en/zh versions`);
    }
  }

  // Essays carry current claims — they need at least one source link.
  const hasLink = /\]\(https?:\/\//.test(post.body) || /https?:\/\/\S+/.test(post.body);
  if (tier === 'essay' && !hasLink) {
    err(name, 'essay has no source link (the tier checklist requires linked sources)');
  }

  // --- English-only style warnings (advisory) ---
  if (fm.lang === 'en') {
    const words = post.body.trim().split(/\s+/).filter(Boolean);
    const band = tier ? WORD_BANDS[tier] : null;
    if (band && (words.length < band[0] || words.length > band[1])) {
      warn(name, `${words.length} words is outside the ${tier} band ${band[0]}–${band[1]}`);
    }
    const dashes = (post.body.match(/—/g) || []).length;
    if (dashes > 0 && words.length / dashes < EM_DASH_PER_WORDS) {
      warn(name, `${dashes} em dashes in ${words.length} words (denser than 1/${EM_DASH_PER_WORDS})`);
    }
    const prose = post.body.replace(/```[\s\S]*?```/g, ' ').replace(/\n/g, ' ');
    for (const sentence of prose.split(/(?<=[.!?])\s+/)) {
      const n = sentence.trim().split(/\s+/).filter(Boolean).length;
      if (n > RUN_ON_WORDS) {
        warn(name, `long sentence (${n} words): "${sentence.trim().split(/\s+/).slice(0, 8).join(' ')}…"`);
      }
    }
  }
}

// --- Report -----------------------------------------------------------------
const lines = [];
lines.push(`## Content gate\n`);
lines.push(`Checked ${targets.length} changed post${targets.length === 1 ? '' : 's'}.\n`);
if (errors.length) {
  lines.push(`### ❌ Errors (block merge)\n`);
  for (const e of errors) lines.push(`- ${e}`);
  lines.push('');
}
if (warnings.length) {
  lines.push(`### ⚠️ Warnings (advisory)\n`);
  for (const w of warnings) lines.push(`- ${w}`);
  lines.push('');
}
if (!errors.length && !warnings.length) lines.push('All checks passed. ✅');

const report = lines.join('\n');
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) {
  try {
    execSync(`cat >> "$GITHUB_STEP_SUMMARY"`, { input: report });
  } catch {
    /* summary is best-effort */
  }
}

process.exit(errors.length ? 1 : 0);
