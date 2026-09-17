import { readdirSync } from 'node:fs';
import { join } from 'node:path';

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

/** `/maps/PEK.png` when a cover exists for the code, else null. */
export function mapImageUrl(iata: string): string | null {
  const file = `${iata.toUpperCase()}.png`;
  return available().has(file) ? `/maps/${file}` : null;
}
