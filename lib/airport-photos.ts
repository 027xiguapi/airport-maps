import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SOURCE_LOCALE, type Locale } from './i18n/config';

/**
 * Real-world photos of an airport, shown in the page's photo gallery.
 *
 * Acquisition lives outside the app: third-party photos are downloaded into
 * `public/photos/<IATA>/` (one directory per airport, `<iata>-<source>-<n>.webp`
 * file names) and every file is recorded in `public/photos/manifest.json` with
 * its source page, host and pixel size. That manifest is the provenance record
 * shown as the photo's attribution line — a photo that is not in it never
 * renders, so nothing appears on the site without a traced source.
 *
 * Captions are editorial: `public/photos/captions/<IATA>.json` holds the
 * authored `zh` + `en` one-liners that describe what each photo actually shows
 * (written from the picture, not the file name); `public/photos/captions.tw.json`
 * is the generated Traditional-Chinese copy, produced by
 * `scripts/build-photo-captions.mjs` — the same derived-not-authored split the
 * rest of the site uses for `tw`.
 *
 * The caption doubles as the publication gate: a photo enters the gallery
 * exactly when its caption has been written, and `_skip` takes one back out.
 * A downloaded batch therefore stays invisible until an editor has looked at
 * each picture — nothing reaches a page un-reviewed — and airports whose
 * photos have not been fetched yet simply have no gallery.
 *
 * Server-side only — never import this from a client component.
 */

type ManifestPhoto = {
  file: string;
  width?: number | null;
  height?: number | null;
  source?: string;
  host?: string;
  pageUrl?: string;
  imageUrl?: string;
  title?: string;
};

export type AirportPhoto = {
  /** `/photos/<IATA>/<file>` */
  src: string;
  width: number | null;
  height: number | null;
  /** Editorial one-liner in the requested locale, else the authored source, else null. */
  caption: string | null;
  /** Where the picture came from — always rendered next to it. */
  credit: {
    /** Host shown in the credit line ("maps.flightsfrom.com"), null when unknown. */
    host: string | null;
    /** Source page the credit line links to, null when unknown. */
    url: string | null;
    /** Source page title, used as the link's tooltip. */
    title: string | null;
  };
};

const PHOTOS_DIR = join(process.cwd(), 'public', 'photos');
const CAPTIONS_DIR = join(PHOTOS_DIR, 'captions');

/** manifest.json → the per-airport photo lists, read once per process. */
let manifest: Record<string, ManifestPhoto[]> | null | undefined;

function photos(): Record<string, ManifestPhoto[]> {
  if (manifest === undefined) {
    try {
      const raw = JSON.parse(readFileSync(join(PHOTOS_DIR, 'manifest.json'), 'utf8')) as {
        airports?: Record<string, ManifestPhoto[]>;
      };
      manifest = raw.airports ?? {};
    } catch {
      manifest = {};
    }
  }
  return manifest!;
}

/** File names actually on disk per airport directory (cached per process). */
let filesOnDisk: Map<string, Set<string>> | null = null;

function diskFiles(iata: string): Set<string> {
  if (!filesOnDisk) filesOnDisk = new Map();
  const cached = filesOnDisk.get(iata);
  if (cached) return cached;
  let set = new Set<string>();
  try {
    set = new Set(readdirSync(join(PHOTOS_DIR, iata)));
  } catch {
    // No directory for this airport — an empty set, so nothing renders.
  }
  filesOnDisk.set(iata, set);
  return set;
}

/** Authored captions: IATA → file name → locale → caption. */
let captions: Map<string, Map<string, Record<string, string>>> | null = null;

/**
 * Files an editor deliberately keeps out of the gallery, per `_skip` in the
 * code's captions file. A photo is excluded when it turns out not to show the
 * airport (a stock aircraft shot, a product mock-up): the manifest keeps its
 * provenance, the page simply never shows it.
 */
let skipped: Map<string, Set<string>> | null = null;

function captionIndex(): Map<string, Map<string, Record<string, string>>> {
  if (captions) return captions;
  captions = new Map();
  skipped = new Map();
  try {
    for (const name of readdirSync(CAPTIONS_DIR)) {
      if (!/^[A-Z]{3}\.json$/.test(name)) continue;
      const iata = name.slice(0, 3);
      const rows = JSON.parse(readFileSync(join(CAPTIONS_DIR, name), 'utf8')) as Record<
        string,
        Record<string, string> | string[]
      >;
      captions.set(
        iata,
        new Map(
          Object.entries(rows).filter(
            ([key, value]) => !key.startsWith('_') && typeof value === 'object' && !Array.isArray(value)
          ) as [string, Record<string, string>][]
        )
      );
      const skip = rows._skip;
      if (Array.isArray(skip)) skipped.set(iata, new Set(skip));
    }
  } catch {
    // No captions directory yet — every photo renders without a caption.
  }
  return captions;
}

/** Generated tw captions: IATA → file name → caption. */
let twCaptions: Map<string, Map<string, string>> | null = null;

function twCaptionIndex(): Map<string, Map<string, string>> {
  if (twCaptions) return twCaptions;
  twCaptions = new Map();
  try {
    const raw = JSON.parse(readFileSync(join(PHOTOS_DIR, 'captions.tw.json'), 'utf8')) as Record<
      string,
      Record<string, string>
    >;
    for (const [iata, rows] of Object.entries(raw)) {
      if (iata.startsWith('_')) continue;
      twCaptions.set(iata, new Map(Object.entries(rows)));
    }
  } catch {
    // The derived file is missing; tw falls back to the authored zh caption.
  }
  return twCaptions;
}

/** Requested locale first, then the authored source — the lib/content.ts chain. */
function pickCaption(iata: string, file: string, locale: Locale): string | null {
  if (locale === 'tw') {
    const tw = twCaptionIndex().get(iata)?.get(file);
    if (tw) return tw;
  }
  const authored = captionIndex().get(iata)?.get(file);
  if (!authored) return null;
  return authored[locale] ?? authored[SOURCE_LOCALE] ?? null;
}

/**
 * Photos of one airport, in manifest order, filtered to files on disk. The
 * caption is the publication gate (see the header): only a photo whose
 * editorial caption has been written is returned, so an un-reviewed download
 * batch never reaches a page.
 */
export function getAirportPhotos(locale: Locale, iata: string): AirportPhoto[] {
  const code = iata.toUpperCase();
  const entries = photos()[code] ?? [];
  const onDisk = diskFiles(code);
  const excluded = captionIndex(); // loads `skipped` alongside the captions
  const skip = skipped?.get(code);
  return entries
    .map((entry) => ({ entry, caption: pickCaption(code, entry.file, locale) }))
    .filter(
      ({ entry, caption }) =>
        entry.file && onDisk.has(entry.file) && !skip?.has(entry.file) && caption !== null
    )
    .map(({ entry, caption }) => ({
      src: `/photos/${code}/${entry.file}`,
      width: entry.width ?? null,
      height: entry.height ?? null,
      caption,
      credit: {
        host: entry.host ?? null,
        url: entry.pageUrl ?? null,
        title: entry.title ?? null,
      },
    }));
}

/**
 * The picture that represents the airport on link previews and in the page's
 * structured data — the first gallery photo when the repo holds one, else null
 * (callers fall back to the cover the airport page already ships).
 */
export function airportLeadPhoto(locale: Locale, iata: string): AirportPhoto | null {
  return getAirportPhotos(locale, iata)[0] ?? null;
}
