#!/usr/bin/env node
// Content gate — mechanical half of the Friday ship gate (docs/pipeline.md §5–6),
// run as CI so nothing un-vetted can merge. It checks only the posts this PR
// adds, changes, or deletes (legacy posts predate the tier/bilingual contract),
// splitting findings into ERRORS (block the merge) and WARNINGS (advisory).
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
const POST_RE = /\.(md|mdx)$/; // the collection globs **/*.{md,mdx}
const TIERS = ['note', 'essay', 'tracker'];
const WORD_BANDS = { note: [300, 700], essay: [800, 1500] }; // tracker: any
const EM_DASH_PER_WORDS = 150; // flag denser than ~1 em dash / 150 words
const RUN_ON_WORDS = 60; // flag a single sentence longer than this

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

// --- Frontmatter parsing ----------------------------------------------------
function parseRaw(raw, path) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { path, frontmatter: null, body: raw };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    fm[kv[1]] = kv[2].trim();
  }
  fm.tagList = [...(fm.tags ?? '').matchAll(/["']([^"']+)["']/g)].map((t) => t[1]);
  return { path, frontmatter: fm, body: m[2] };
}
const parse = (path) => parseRaw(readFileSync(path, 'utf8'), path);

// Parse a path as it existed at the PR base (for files this PR deleted).
function parseAtBase(base, path) {
  try {
    return parseRaw(execSync(`git show ${base}:${path}`, { encoding: 'utf8' }), path);
  } catch {
    return null;
  }
}

// --- Index every post currently on disk (for pair lookups) -----------------
const allFiles = existsSync(POSTS_DIR)
  ? readdirSync(POSTS_DIR).filter((f) => POST_RE.test(f)).map((f) => join(POSTS_DIR, f))
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

// --- Decide what to check ---------------------------------------------------
const base = process.env.BASE_SHA;
const explicit = process.argv.slice(2);

function diffPaths(filter) {
  try {
    return execSync(
      `git diff --name-only --diff-filter=${filter} ${base} HEAD -- ${POSTS_DIR}`,
      { encoding: 'utf8' }
    )
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s && POST_RE.test(s));
  } catch {
    console.warn('content-gate: git diff failed');
    return null;
  }
}

// Files to run per-file content checks on (added/modified, still on disk).
let targets;
// translationKeys whose bilingual pairing this PR could have changed — including
// keys touched only by a deletion, so orphaning one side never slips through.
const affectedKeys = new Set();

if (explicit.length) {
  targets = explicit.filter((f) => POST_RE.test(f) && existsSync(f));
  for (const f of targets) {
    const key = parse(f).frontmatter?.translationKey;
    if (key) affectedKeys.add(key);
  }
} else if (base) {
  targets = (diffPaths('AM') ?? []).filter(existsSync);
  const touched = diffPaths('ACMRD') ?? [];
  for (const p of touched) {
    const post = existsSync(p) ? parse(p) : parseAtBase(base, p);
    const key = post?.frontmatter?.translationKey;
    if (key) affectedKeys.add(key);
  }
} else {
  targets = allFiles; // local full run
  for (const key of index.keys()) affectedKeys.add(key);
}

if (targets.length === 0 && affectedKeys.size === 0) {
  console.log('content-gate: no changed posts to check. ✅');
  process.exit(0);
}

// --- Per-file checks (added/modified posts) --------------------------------
const REQUIRED = ['title', 'date', 'excerpt', 'lang', 'translationKey', 'maturity'];

for (const file of targets) {
  const name = basename(file);
  const { frontmatter: fm, body } = parse(file);

  if (!fm) {
    err(name, 'no parseable frontmatter block');
    continue;
  }
  for (const field of REQUIRED) {
    if (!fm[field]) err(name, `missing required frontmatter field "${field}"`);
  }
  if (fm.tagList.length === 0) err(name, 'no tags');

  const tier = fm.tagList.map((t) => t.toLowerCase()).find((t) => TIERS.includes(t));
  if (!tier) err(name, `tags must include a tier (one of ${TIERS.join('/')})`);

  // Essays carry current claims — they need at least one source link.
  const hasLink = /\]\(https?:\/\//.test(body) || /https?:\/\/\S+/.test(body);
  if (tier === 'essay' && !hasLink) {
    err(name, 'essay has no source link (the tier checklist requires linked sources)');
  }

  // English-only style warnings (advisory).
  if (fm.lang === 'en') {
    const words = body.trim().split(/\s+/).filter(Boolean);
    const band = tier ? WORD_BANDS[tier] : null;
    if (band && (words.length < band[0] || words.length > band[1])) {
      warn(name, `${words.length} words is outside the ${tier} band ${band[0]}–${band[1]}`);
    }
    const dashes = (body.match(/—/g) || []).length;
    if (dashes > 0 && words.length / dashes < EM_DASH_PER_WORDS) {
      warn(name, `${dashes} em dashes in ${words.length} words (denser than 1/${EM_DASH_PER_WORDS})`);
    }
    const prose = body.replace(/```[\s\S]*?```/g, ' ').replace(/\n/g, ' ');
    for (const sentence of prose.split(/(?<=[.!?])\s+/)) {
      const n = sentence.trim().split(/\s+/).filter(Boolean).length;
      if (n > RUN_ON_WORDS) {
        warn(name, `long sentence (${n} words): "${sentence.trim().split(/\s+/).slice(0, 8).join(' ')}…"`);
      }
    }
  }
}

// --- Pairing checks (every affected translationKey) ------------------------
// One side present = an orphan (added one side, or deleted one side). Zero
// sides = the whole post was removed, which is allowed.
for (const key of affectedKeys) {
  const pair = index.get(key) ?? {};
  const present = (pair.en ? 1 : 0) + (pair.zh ? 1 : 0);
  if (present === 1) {
    const where = `translationKey "${key}"`;
    if (!pair.en) err(where, 'missing English version (.en.md) — orphaned bilingual pair');
    if (!pair.zh) err(where, 'missing Chinese version (.zh.md) — orphaned bilingual pair');
  } else if (present === 2) {
    if (pair.en.frontmatter.date !== pair.zh.frontmatter.date)
      warn(`translationKey "${key}"`, `date differs between en/zh (${pair.en.frontmatter.date} vs ${pair.zh.frontmatter.date})`);
    if (pair.en.frontmatter.maturity !== pair.zh.frontmatter.maturity)
      warn(`translationKey "${key}"`, 'maturity differs between en/zh versions');
  }
}

// --- Report -----------------------------------------------------------------
const lines = [`## Content gate\n`, `Checked ${targets.length} changed post${targets.length === 1 ? '' : 's'}, ${affectedKeys.size} translation key${affectedKeys.size === 1 ? '' : 's'}.\n`];
if (errors.length) {
  lines.push(`### ❌ Errors (block merge)\n`, ...errors.map((e) => `- ${e}`), '');
}
if (warnings.length) {
  lines.push(`### ⚠️ Warnings (advisory)\n`, ...warnings.map((w) => `- ${w}`), '');
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
