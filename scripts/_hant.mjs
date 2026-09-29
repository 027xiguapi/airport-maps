/**
 * Simplified → Traditional (Taiwan) conversion, shared by the seed and the `tw`
 * catalog generator. `content/terminology/tw-phrases.json` holds the two
 * exception lists; both are applied here, in this order:
 *
 *   1. `phrases` — Taiwan wording OpenCC would not produce on its own
 *      (希思罗 → 希斯洛, 悉尼 → 雪梨). Applied to the simplified source, longest
 *      key first so 马里兰 wins over 马里.
 *   2. OpenCC `cn -> twp`.
 *   3. `corrections` — undoes OpenCC's over-reach (it rewrites 连接 as 連線 and
 *      绑定 as 繫結, neither of which this site ever means).
 *
 * `toHantName` is the variant for place, terminal and facility names: Taiwan
 * writes 里 in place names (奧爾伯里, 古里提巴) where OpenCC's twp output is 裡.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import opencc from 'opencc-js';
import { ROOT } from './_env.mjs';

const { phrases, corrections } = JSON.parse(
  readFileSync(join(ROOT, 'content', 'terminology', 'tw-phrases.json'), 'utf8')
);

const PHRASE_ENTRIES = Object.entries(phrases).sort((a, b) => b[0].length - a[0].length);
const CORRECTION_ENTRIES = Object.entries(corrections).filter(([key]) => !key.startsWith('_'));

const toTwp = opencc.Converter({ from: 'cn', to: 'twp' });

/** Converts one string; `null`/`undefined` pass through, for optional columns. */
export function toHant(text) {
  if (text === null || text === undefined) return text;
  const phrased = PHRASE_ENTRIES.reduce((acc, [from, to]) => acc.split(from).join(to), String(text));
  return CORRECTION_ENTRIES.reduce((acc, [from, to]) => acc.split(from).join(to), toTwp(phrased));
}

/** Same, for names: Taiwan's place-name form of 里. */
export function toHantName(name) {
  if (name === null || name === undefined) return name;
  return toHant(name).replace(/裡/g, '里');
}

/**
 * Characters that are simplified-only: OpenCC rewrites them, and traditional
 * text never contains them. Built from the converter rather than a hand-written
 * list, minus the two characters OpenCC over-reaches on (里, 干) — both are
 * correct in Taiwan text and both appear in already-converted copy. The seed
 * matches this against every `*_tw` column to report what a phrase entry is
 * still missing.
 */
const CORRECT_IN_TW = new Set(['里', '干']);
export const SIMPLIFIED_ONLY = new RegExp(
  `[${(() => {
    const chars = [];
    for (let cp = 0x3400; cp <= 0x9fff; cp++) {
      const char = String.fromCodePoint(cp);
      if (!CORRECT_IN_TW.has(char) && toTwp(char) !== char) chars.push(char);
    }
    return chars.join('');
  })()}]`,
  'g'
);
