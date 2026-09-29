import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Cover file names that differ from `<IATA>.png`. `AUX` is a legacy DOS device
 * name, so on Windows `public/maps/AUX.png` is not a file at all — it resolves
 * to `\\.\AUX`, which the generator cannot create and git cannot index. The
 * table lives in scripts/map-file-aliases.json because the generator and the
 * coverage checker read the same names.
 */
const ALIASES: Record<string, string> = (() => {
  try {
    const file = JSON.parse(
      readFileSync(join(process.cwd(), 'scripts', 'map-file-aliases.json'), 'utf8')
    );
    return Object.fromEntries(
      Object.entries(file).filter(([code, name]) => /^[A-Z]{3}$/.test(code) && typeof name === 'string')
    ) as Record<string, string>;
  } catch {
    return {};
  }
})();

/** The file name a cover for this code uses on disk. */
function fileName(iata: string): string {
  return ALIASES[iata.toUpperCase()] ?? `${iata.toUpperCase()}.png`;
}

/**
 * Cover images shipped in /public/maps, keyed by IATA code (PEK.png). The
 * directory is read once per process and cached; server-side only — never
 * import this from a client component.
 */
let filenames: Set<string> | null = null;

function available(): Set<string> {
  if (!filenames) {
    try {
      filenames = new Set(readdirSync(join(process.cwd(), 'public', 'maps')));
    } catch {
      filenames = new Set();
    }
  }
  return filenames;
}

/** `/source-maps/PEK.png` when a cover exists for the code, else null. */
export function mapImageUrl(iata: string): string | null {
  const file = fileName(iata);
  return available().has(file) ? `/source-maps/${file}` : null;
}

/** The 400px cover the homepage strips and cards render. */
export function coverUrl(iata: string): string {
  return `/maps/${fileName(iata)}`;
}

/** IATA codes that have a cover in /public/maps, sorted alphabetically. */
export function mapImageCodes(): string[] {
  const byFile = new Map(Object.entries(ALIASES).map(([code, file]) => [file, code]));
  return [...available()]
    .filter((file) => file.toLowerCase().endsWith('.png'))
    .map((file) => byFile.get(file) ?? file.slice(0, -4).toUpperCase())
    .sort();
}

/**
 * Covers generated most recently, newest first. The order comes from the index
 * scripts/generate-airport-maps.mjs writes to public/data/latest-maps.json —
 * downloaded covers predate that pipeline and are not in it, so this is exactly
 * "what the generator last produced". Returns [] when the index is absent, which
 * lets the caller drop the section instead of rendering it empty.
 */
export function latestMapCodes(limit = 12): string[] {
  try {
    const index = JSON.parse(
      readFileSync(join(process.cwd(), 'public', 'data', 'latest-maps.json'), 'utf8')
    );
    const available_ = available();
    const codes: string[] = [];
    for (const entry of index.maps ?? []) {
      const code = String(entry.iata ?? '').toUpperCase();
      if (!code || !available_.has(fileName(code)) || codes.includes(code)) continue;
      codes.push(code);
      if (codes.length >= limit) break;
    }
    return codes;
  } catch {
    return [];
  }
}

/**
 * Full terminal-map files downloaded by scripts/fetch-terminal-maps.mjs into
 * /public/terminal-maps, keyed by IATA code (HKG/HKG_large.png + HKG.pdf).
 * Index is built once per process and cached; server-side only — never import
 * this from a client component.
 */
type TerminalMapFiles = { png: string | null; pdf: string | null };

let terminalIndex: Map<string, TerminalMapFiles> | null = null;

function terminalMapsAvailable(): Map<string, TerminalMapFiles> {
  if (!terminalIndex) {
    terminalIndex = new Map();
    try {
      const root = join(process.cwd(), 'public', 'terminal-maps');
      for (const entry of readdirSync(root, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const code = entry.name.toUpperCase();
        const files = readdirSync(join(root, entry.name));
        // The fetcher normally saves {CODE}_large.png, but records the real
        // extension when a source ever serves another image type there.
        const image = files.find((f) =>
          new RegExp(`^${entry.name}_large\\.(?:png|jpe?g|webp)$`, 'i').test(f)
        );
        const pdf = files.find((f) => f === `${entry.name}.pdf`);
        if (image || pdf) {
          terminalIndex.set(code, {
            png: image ? `/terminal-maps/${entry.name}/${image}` : null,
            pdf: pdf ? `/terminal-maps/${entry.name}/${pdf}` : null,
          });
        }
      }
    } catch {
      terminalIndex = new Map();
    }
  }
  return terminalIndex;
}

/**
 * `/terminal-maps/HKG/HKG_large.png` + `/terminal-maps/HKG/HKG.pdf` when the
 * full map files exist for the code, else null per missing artefact.
 */
export function terminalMapDownloads(iata: string): TerminalMapFiles {
  return terminalMapsAvailable().get(iata.toUpperCase()) ?? { png: null, pdf: null };
}
