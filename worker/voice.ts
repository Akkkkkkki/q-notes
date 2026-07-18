import type { Env } from './types';
import { getFile, putFile } from './github';

/**
 * Voiceprint recorder (issue #44, Phase 2). When the author answers an A/B
 * question or marks a "我不会这么说" sentence on the Desk, the choice lands in
 * two places: a PR comment (the record the ship gate and drafter act on) and a
 * raw dated line under `research/voice.md ## Proposed` with its source tag.
 * These lines are records of author decisions, not generated rules — the ship
 * gate and gardener refine them, and only the author promotes.
 */

const VOICE_PATH = 'research/voice.md';

export async function appendProposed(env: Env, lines: string[], message: string): Promise<boolean> {
  if (!lines.length) return true;
  for (let attempt = 0; attempt < 2; attempt++) {
    const file = await getFile(env, VOICE_PATH);
    if (!file) return false;
    // Proposed is the file's last section, so appending to the end of the
    // file is appending to the section.
    let content = file.content.replace(/\s+$/, '') + '\n';
    if (!/^## Proposed/m.test(content)) content += '\n## Proposed (gardener)\n\n';
    content += lines.join('\n') + '\n';
    const result = await putFile(env, VOICE_PATH, content, message, file.sha);
    if (result.ok) return true;
    if (result.status !== 409) return false;
  }
  return false;
}

/** One-line, one-record truncation for quoted material inside a voice.md entry. */
export function excerpt(text: string, max = 140): string {
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}
