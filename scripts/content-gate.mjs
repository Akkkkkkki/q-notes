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
// Posts published before the tier/bilingual contract existed (docs/pipeline.md §5–6).
// The gate already meant to grandfather these — its scoping comment says so — but it
// did that by only checking *changed* posts, which silently revoked the exemption the
// moment anyone edited one. A copy-edit pass would have forced a retroactive re-tier
// and a source-link hunt on three 2,000-word essays, so the exemption is named here
// instead. It covers the structural checks only: these posts still get every style
// warning, and the list is closed — a post written under the contract can never join
// it. Retiring an entry means doing the editorial work, not deleting the line.
// Keyed by file stem *and* publication date, not by translationKey: the key is
// author-controlled frontmatter, so keying on it would let any new post inherit the
// exemption just by claiming the name. Both halves have to match, so replacing one of
// these files with new content also means backdating it — a deliberate act, not an
// accident. That is what makes the list closed in practice and not just by assertion.
const LEGACY_POSTS = new Map([
  ['consulting-barbell', '2026-04-18'],
  ['consulting-coordination', '2026-05-02'],
  ['consulting-outcomes', '2026-04-25'],
]);
const isLegacy = (name, fm) =>
  LEGACY_POSTS.get(name.replace(/\.(en|zh)\.mdx?$/, '')) === fm.date;
const WORD_BANDS = { note: [300, 700], essay: [800, 1500] }; // tracker: any
const EM_DASH_PER_WORDS = 150; // flag denser than ~1 em dash / 150 words
const RUN_ON_WORDS = 60; // flag a single sentence longer than this

// --- English advisory thresholds -------------------------------------------
// The English side of this gate used to check only length, em-dash density, and
// run-ons, while the Chinese side had six check families. Everything else in
// research/human-voice.md was prose guidance aimed at the same LLM that writes
// the drafts. These checks make the §3–§4 rules mechanical, in the spirit of
// ASD-STE100's self-lint: numeric thresholds a script can apply.
//
// What we deliberately do NOT borrow from STE: its sentence-uniformity rules
// (20/25-word caps, max six sentences per paragraph) and its contraction ban.
// STE optimises for a reader following a maintenance procedure; we optimise for
// an essay that does not read as machine-written, and uniform sentence length is
// the machine signature (human-voice.md §1, §3.3). EN_MIN_BURSTINESS below is
// the inverted version of the STE cap: it fails prose that is too even.
//
// Thresholds are calibrated against the nine published English posts so that a
// warning means a real hit rather than background noise. Corpus values are in
// the comment on each constant.
const EN_CONTRACTION_RATIO = 0.5; // contractions / (contractions + expandable). Corpus: 0.00–0.11 (old) vs 1.00 (recent)
const EN_CONTRACTION_MIN_EXPANDED = 6; // don't judge the ratio on a handful of spots
const EN_PIVOT_MAX = 1; // "It is not X. It is Y." — human-voice.md §3.2. Corpus: 0–5
const EN_QUESTION_MAX = 3; // total unanswered-looking questions. Corpus: 0–11
const EN_MIN_BURSTINESS = 0.45; // stddev/mean of sentence length. Corpus: 0.53–0.74
const EN_BURSTINESS_MIN_SENTENCES = 25; // below this, the statistic is noise
const EN_MIN_PARAGRAPH_SPREAD = 3; // longest paragraph minus shortest, in sentences
const EN_MAX_REPORTED = 3; // mirror ZH_MAX_REPORTED

// Words the voiceprint never-list and STE's marketing-adjective rule both ban.
// The corpus scores zero on all of these — the drafter already avoids them — so
// this is a regression guard, not a source of routine warnings.
const EN_LEXICON = [
  'delve', 'underscore', 'intricate', 'crucial', 'pivotal', 'myriad', 'tapestry',
  'landscape', 'seamless', 'seamlessly', 'robust', 'cutting-edge', 'world-class',
  'best-in-class', 'next-generation', 'revolutionary', 'effortless', 'unparalleled',
  'holistic', 'turnkey', 'it is important to note', "it's important to note",
  'in today\'s fast-paced', 'ever-evolving', 'testament to',
];
// The never-list bans "leverage" as a verb only. The noun is ordinary consulting
// vocabulary and appears four times in the corpus ("leverage ratios", "a real
// source of leverage"), so matching the bare word would be a false positive.
const EN_VERB_LEVERAGE = /\b(?:leverages|leveraging|leveraged|to leverage)\b/gi;
// Fabricated intellectual autobiography (docs/pipeline.md §10, human-voice.md §1/§3.5):
// a factual claim about the author's own mental history, not a style choice. These
// match only the mental-history construction, never plain present-tense opinion
// ("I think X" is untouched) — a real hit still needs the claim ledger to say whether
// the source material actually contains the change-of-mind story.
const EN_MENTAL_HISTORY = [
  /\bI\s+used\s+to\s+(?:think|believe|buy)\b/i,
  /\bI(?:'ve|\s+have)\s+come\s+to\s+(?:think|believe)\b/i,
  /\bI\s+changed\s+my\s+mind\b/i,
  /\bwhat\s+(?:convinced|changed)\s+me\s+was\b/i,
  /\bthe\s+correction\s+came\b/i,
  /\bI\s+was\s+wrong\s+because\b/i,
];
// STE's "use a verb, not a nominalisation" rule. The article is required on
// purpose: without it the pattern fires on ordinary prose ("makes judgment
// cheap"), which is why the corpus scores zero here too.
const EN_NOMINALIZATION =
  /\b(perform|performs|conduct|conducts|undertake|undertakes|provide|provides|make|makes|carry out|carries out)\s+(an?|the)\s+(\w+(?:tion|sion|ment|ance|ence|ysis))\b/gi;
// human-voice.md §8: "but"/"so" over "however"/"therefore", including at sentence start.
const EN_STIFF_CONNECTIVE =
  /(?:^|[.!?]\s+|\n\n)(However|Therefore|Moreover|Furthermore|Additionally|Consequently|Nevertheless)\b/g;
// Contractions, listed explicitly so possessive "'s" never inflates the count.
const EN_CONTRACTION =
  /\b(?:\w+n't|it's|that's|there's|here's|what's|let's|I'm|you're|we're|they're|I've|you've|we've|they've|I'll|you'll|we'll|they'll|it'll|I'd|you'd|we'd|they'd|he's|she's|who's)\b/gi;
const EN_EXPANDABLE =
  /\b(?:do not|does not|did not|is not|are not|was not|were not|it is|that is|there is|cannot|can not|will not|would not|should not|could not|you are|we are|they are|have not|has not|had not|let us|I am)\b/gi;
// The corrective pivot in both its forms: the two-sentence cleft and "not just X
// but Y". The copulas cover contracted forms too — a draft that follows the
// contractions rule writes "This isn't X. It's Y.", and matching only the expanded
// forms would blind this check on exactly the posts that follow the rest of §3.
const DEMONSTRATIVE = '(?:it|this|that|these|those)';
const COPULA_NEG = "(?:\\s+(?:is|are|was|were)\\s+not|\\s*'(?:s|re)\\s+not|\\s+(?:isn't|aren't|wasn't|weren't))";
const COPULA_POS = "(?:\\s+(?:is|are|was|were)|\\s*'(?:s|re))";
const EN_PIVOT = [
  new RegExp(`\\b${DEMONSTRATIVE}${COPULA_NEG}\\s+[^.!?;]{1,70}[.;]\\s+${DEMONSTRATIVE}${COPULA_POS}\\b`, 'gi'),
  /\bnot\s+(?:just|only|merely|simply)\s+[^.!?;]{1,50}?,?\s+but\s+/gi,
];

// --- 中文 nominalisation (万能动词) -----------------------------------------
// The Chinese half of STE's "use a verb" rule, and 余光中's first 欧化 symptom
// (human-voice.md §12). Previously prose-only guidance.
// 来/去 are excluded: 做出来 is a directional complement ("managed to make"), not
// the 万能动词 pattern.
const ZH_EMPTY_VERB = /(进行|作出|做出|加以|予以|给予|开展)[了过]?(?!来|去)([一-鿿]{2,4})/g;
const ZH_EMPTY_VERB_MAX = 2; // a couple are idiomatic; a habit is not

// --- Chinese advisory thresholds (lenient: warn only, never block) ----------
// These mirror the English style warnings for zh posts, where the gate was
// previously silent. Tuned loose on purpose — they exist to make a reviewer
// look, not to dictate prose. See docs/pipeline.md §5–6.
const ZH_RUN_ON_CHARS = 90; // a single sentence longer than this (Han chars)
const ZH_ABSTRACT_PER_SENTENCE = 4; // distinct abstract nouns stacked in one sentence
const ZH_SCENE_PER_CHARS = 900; // expect at least one concrete-scene word per this many Han chars
const ZH_DASH_PER_CHARS = 200; // —— denser than one per this many Han chars
const ZH_MAX_REPORTED = 3; // cap repeat warnings of the same kind to keep the report readable
// Abstract nouns that, stacked, read as translation-ese rather than a concrete claim.
const ZH_ABSTRACT = ['机制', '能力', '系统', '组织', '价值', '模式', '边界', '结构', '流程', '框架', '逻辑'];
// Concrete work-scene words — their presence is the signal a stretch is grounded.
const ZH_SCENE = ['团队', '客户', '会议', 'PR', '代码', '报告', '老板', '董事会', '工单', '原型', '同事', 'Slack', '项目', '工具'];
// English left in running zh prose that usually has a natural Chinese rendering.
// Kept short on purpose; glossary terms and sanctioned non-translations are exempt.
const ZH_ENGLISH_RESIDUE = ['dashboard', 'PoC', 'roadmap', 'backlog', 'stakeholder', 'alignment'];
// Fabricated intellectual autobiography, zh half of the EN_MENTAL_HISTORY check above
// (docs/pipeline.md §10). Plain present-tense opinion ("我觉得 X") is untouched.
const ZH_MENTAL_HISTORY = [
  /我(?:以前|曾经|一开始)(?:以为|认为)/,
  /后来(?:我)?(?:才)?(?:发现|意识到)/,
  /改变了我的看法/,
  /(?:说服|让)我(?:改变看法|想通)的是/,
];
// Template sentences that signal the draft is "proving" rather than thinking.
const ZH_TEMPLATE = [
  { re: /这很重要，因为/, label: '"这很重要，因为…"' },
  { re: /这并不矛盾。\s*这正是/, label: '"这并不矛盾。这正是…"' },
  { re: /更好的[^，。、]{0,8}很简单/, label: '"更好的…很简单"' },
];
const countHan = (s) => (s.match(/[一-鿿]/g) || []).length;

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
  // `definedTerm` is a nested mapping, so the line-based loop above only sees the
  // bare key. Pull the coined term itself out of the raw block.
  fm.coinedTerm = (m[1].match(/^definedTerm:\s*\n\s+term:\s*["']([^"']+)["']/m) || [])[1] ?? null;
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

  const legacy = isLegacy(name, fm);
  const tier = fm.tagList.map((t) => t.toLowerCase()).find((t) => TIERS.includes(t));
  if (!tier && !legacy) err(name, `tags must include a tier (one of ${TIERS.join('/')})`);

  // Essays carry current claims — they need at least one source link.
  const hasLink = /\]\(https?:\/\//.test(body) || /https?:\/\/\S+/.test(body);
  if (tier === 'essay' && !hasLink && !legacy) {
    err(name, 'essay has no source link (the tier checklist requires linked sources)');
  }
  if (legacy) warn(name, 'pre-contract post: exempt from tier and source-link checks, style checks still apply');

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
    // Block-level text keeps its line breaks (paragraph shape); `prose` is flat.
    // Headings are dropped, not inlined — an unterminated heading otherwise glues
    // itself to the sentence below it and reads as one long run-on.
    const blocks = body
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`]*`/g, ' ')
      .replace(/^#+ .*$/gm, '');
    // Emphasis markers come off before any sentence-level analysis: an italicised
    // question "*Who owns this?*" ends in "*", so the splitter never sees the
    // question mark and the volley check misses it entirely. `blocks` keeps the
    // markers because the paragraph filter needs list bullets at line start.
    const prose = blocks
      .replace(/\*+/g, '')
      .replace(/(^|\s)_+|_+(?=[\s.,;:!?]|$)/gm, '$1')
      .replace(/\n/g, ' ');
    const sentences = prose
      // A closing quote or bracket may sit after the terminator ("…a new service.")
      // — without it here, quoted sentences merge and report as one long run-on.
      .split(/(?<=[.!?]["'”’)\]]?)\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const sentence of sentences) {
      const n = sentence.split(/\s+/).filter(Boolean).length;
      if (n > RUN_ON_WORDS) {
        warn(name, `long sentence (${n} words): "${sentence.split(/\s+/).slice(0, 8).join(' ')}…"`);
      }
    }

    // 1. Contractions by default (human-voice.md §1 "No contractions, ever", §3.7).
    // The strongest single tell in our own published posts, and until now unchecked.
    const contracted = (prose.match(EN_CONTRACTION) || []).length;
    const expandable = (prose.match(EN_EXPANDABLE) || []).length;
    const ratio = contracted / (contracted + expandable || 1);
    if (expandable >= EN_CONTRACTION_MIN_EXPANDED && ratio < EN_CONTRACTION_RATIO) {
      warn(
        name,
        `uncontracted English: ${expandable} expandable form(s) ("do not", "it is") vs ${contracted} contraction(s) — contract by default, expand only for emphasis`
      );
    }

    // 2. Corrective pivots — signature move, capped at one per post (§3.2).
    // Counted per paragraph: the move is "X isn't A. It's B" inside one breath, so
    // a sentence ending one paragraph and a sentence opening the next are unrelated.
    // Matching across the blank line reported ordinary prose as a pivot.
    const pivots = blocks
      .split(/\n\s*\n/)
      .reduce((n, para) => {
        const flat = para.replace(/\*+/g, '').replace(/\n/g, ' ');
        return n + EN_PIVOT.reduce((m, re) => m + (flat.match(re) || []).length, 0);
      }, 0);
    if (pivots > EN_PIVOT_MAX) {
      warn(name, `${pivots} corrective pivots ("It is not X. It is Y." / "not just X but Y") — cap is ${EN_PIVOT_MAX} per post`);
    }

    // 3. Rhetorical-question volleys. A run of three is the tell §1 quotes; a
    // contrastive pair ("is this PR correct? should it have started?") is a real
    // device and stays legal, so the run threshold is 3, not 2.
    const questions = sentences.filter((s) => s.endsWith('?')).length;
    let run = 0;
    let volley = false;
    for (const s of sentences) {
      run = s.endsWith('?') ? run + 1 : 0;
      if (run >= 3) volley = true;
    }
    if (volley) warn(name, 'three questions in a row — humans ask one and answer it (§3.2)');
    else if (questions > EN_QUESTION_MAX) {
      warn(name, `${questions} questions — at most one should go unanswered (§3.2)`);
    }

    // 4. Burstiness. Uniform sentence length is the measurable machine signature
    // (human-voice.md §1 "Uniform burstiness"), and the rule STE inverts.
    const lengths = sentences
      .map((s) => s.split(/\s+/).filter(Boolean).length)
      .filter((n) => n > 2);
    if (lengths.length >= EN_BURSTINESS_MIN_SENTENCES) {
      const mean = lengths.reduce((a, n) => a + n, 0) / lengths.length;
      const sd = Math.sqrt(lengths.reduce((a, n) => a + (n - mean) ** 2, 0) / lengths.length);
      const cv = sd / mean;
      if (cv < EN_MIN_BURSTINESS) {
        warn(
          name,
          `even sentence rhythm (variation ${cv.toFixed(2)}, want ≥ ${EN_MIN_BURSTINESS}) — vary length on purpose (§3.3)`
        );
      }
    }

    // 5. Paragraph shape — at least one very short paragraph and one long one (§3.3).
    const paragraphs = blocks
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p && !/^[-*>|#\d]/.test(p));
    // Measured as spread, not as a required shape. The first version demanded a
    // 1-sentence paragraph *and* a 5-sentence one, which flagged three posts that
    // read fine — it was enforcing one particular rhythm rather than the absence of
    // uniformity. §3.3 asks for lumpiness, so that is what this measures.
    if (paragraphs.length >= 6) {
      const counts = paragraphs.map((p) => (p.match(/[.!?](?:\s|$)/g) || []).length || 1);
      const spread = Math.max(...counts) - Math.min(...counts);
      if (spread < EN_MIN_PARAGRAPH_SPREAD || !counts.some((n) => n <= 2)) {
        warn(
          name,
          `paragraph lengths cluster (${Math.min(...counts)}–${Math.max(...counts)} sentences) — vary them on purpose, and let at least one paragraph run short (§3.3)`
        );
      }
    }

    // 6. Never-list lexicon and marketing adjectives (voiceprint Never, STE word rules).
    let lexHits = 0;
    for (const w of EN_LEXICON) {
      if (lexHits >= EN_MAX_REPORTED) break;
      if (new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(prose)) {
        lexHits++;
        warn(name, `never-list word "${w}" — say it plainly (voice.md §Never)`);
      }
    }

    for (const m of [...new Set([...prose.matchAll(EN_VERB_LEVERAGE)].map((x) => x[0]))].slice(0, EN_MAX_REPORTED)) {
      warn(name, `"${m}" — "leverage" as a verb is on the never-list; use "use" (the noun is fine)`);
    }

    // 7. Nominalisations and stiff connectives — STE's verb rules, the two that
    // survive contact with essay prose.
    for (const m of [...prose.matchAll(EN_NOMINALIZATION)].slice(0, EN_MAX_REPORTED)) {
      warn(name, `nominalisation "${m[0]}" — use the verb instead`);
    }
    const stiff = [...blocks.matchAll(EN_STIFF_CONNECTIVE)].map((m) => m[1]);
    for (const c of [...new Set(stiff)].slice(0, EN_MAX_REPORTED)) {
      warn(name, `sentence-initial "${c}" — "but"/"so" read more like speech (§3.8)`);
    }

    // 8. One name for one thing: a coined term is defined on first use, then
    // reused on purpose. Defined and never reused means it was decoration.
    if (fm.coinedTerm) {
      const uses = prose.toLowerCase().split(fm.coinedTerm.toLowerCase()).length - 1;
      if (uses < 2) {
        warn(name, `coined term "${fm.coinedTerm}" appears ${uses}× in the body — define it once, then reuse it or drop it`);
      }
    }

    // 9. Fabricated intellectual autobiography (docs/pipeline.md §10). A factual claim
    // about the author's mental history, not a style choice — the ledger, not this
    // script, settles whether the source material actually contains the story.
    let mentalHits = 0;
    for (const s of sentences) {
      if (mentalHits >= EN_MAX_REPORTED) break;
      if (EN_MENTAL_HISTORY.some((re) => re.test(s))) {
        mentalHits++;
        warn(name, `mental-history claim "${s.slice(0, 60)}${s.length > 60 ? '…' : ''}" — must trace to author material (pipeline §10), not narrative glue`);
      }
    }
  }

  // Chinese style warnings (advisory) — the gate used to be silent on zh, which
  // let translation-ese through. All lenient, all warn-only; glossary terms are exempt.
  if (fm.lang === 'zh') {
    const glossary = existsSync('research/glossary.md')
      ? readFileSync('research/glossary.md', 'utf8').toLowerCase()
      : '';
    const prose = body.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');
    const hanTotal = countHan(prose);
    const sentences = prose.split(/(?<=[。！？；\n])/).map((s) => s.trim()).filter(Boolean);

    // 1. Over-long sentences (mirror the English run-on check, by Han count).
    let longCount = 0;
    for (const s of sentences) {
      if (countHan(s) > ZH_RUN_ON_CHARS && longCount < ZH_MAX_REPORTED) {
        longCount++;
        warn(name, `long zh sentence (${countHan(s)} Han chars): "${s.slice(0, 16)}…"`);
      }
    }

    // 2. Abstract-noun stacking inside one sentence — reads as a framework, not a claim.
    let abstractCount = 0;
    for (const s of sentences) {
      const hits = ZH_ABSTRACT.filter((w) => s.includes(w));
      if (hits.length >= ZH_ABSTRACT_PER_SENTENCE && abstractCount < ZH_MAX_REPORTED) {
        abstractCount++;
        warn(name, `abstract-noun stack (${hits.join('/')}) — consider a concrete example: "${s.slice(0, 16)}…"`);
      }
    }

    // 3. "Proving" template sentences.
    for (const t of ZH_TEMPLATE) {
      if (t.re.test(prose)) warn(name, `template phrasing ${t.label} — say it plainer or cut`);
    }
    // Heavily stacked 不是…而是… (the zh form of "It is not X. It is Y." — fine once, noise repeated).
    const cleft = (prose.match(/不是[^，。、]{1,20}而是/g) || []).length;
    if (cleft >= 3) warn(name, `"不是…而是…" used ${cleft}× — vary the rhythm (voice.md §Rhythm)`);

    // 3b. 万能动词 — the Chinese half of STE's "use a verb, not a nominalisation"
    // rule, and 余光中's first 欧化 symptom (human-voice.md §12).
    const emptyVerbs = [...prose.matchAll(ZH_EMPTY_VERB)].map((m) => m[0]);
    if (emptyVerbs.length > ZH_EMPTY_VERB_MAX) {
      const sample = [...new Set(emptyVerbs)].slice(0, 3).join('、');
      warn(name, `万能动词 ${emptyVerbs.length} 处（${sample}）— 还原成动词（"进行研究"→"研究"）`);
    }

    // 4. English residue that has a natural Chinese rendering (glossary terms exempt).
    for (const w of ZH_ENGLISH_RESIDUE) {
      if (new RegExp(`\\b${w}\\b`, 'i').test(prose) && !glossary.includes(w.toLowerCase())) {
        warn(name, `English term "${w}" in zh prose — render it in Chinese or add to glossary`);
      }
    }

    // 5. Concrete-scene density — a grounded piece names real work, not just systems.
    const sceneHits = ZH_SCENE.reduce((n, w) => n + (prose.split(w).length - 1), 0);
    const expected = Math.floor(hanTotal / ZH_SCENE_PER_CHARS);
    if (expected > 0 && sceneHits < expected) {
      warn(name, `only ${sceneHits} concrete-scene word(s) in ${hanTotal} Han chars (≈${expected} expected) — the piece may read abstract`);
    }

    // 6. Dash density — don't mirror English em-dash placement mechanically (voice.md §48).
    const dashes = (prose.match(/——|—/g) || []).length;
    if (dashes > 0 && hanTotal / dashes < ZH_DASH_PER_CHARS) {
      warn(name, `${dashes} dashes in ${hanTotal} Han chars (denser than 1/${ZH_DASH_PER_CHARS}) — 。/，/而/但 often read better in zh`);
    }

    // 7. Fabricated intellectual autobiography, zh half (docs/pipeline.md §10).
    let mentalHits = 0;
    for (const s of sentences) {
      if (mentalHits >= ZH_MAX_REPORTED) break;
      if (ZH_MENTAL_HISTORY.some((re) => re.test(s))) {
        mentalHits++;
        warn(name, `mental-history claim "${s.slice(0, 24)}…" — must trace to author material (pipeline §10), not narrative glue`);
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
