'use client';

import { useEffect, useRef, useState } from 'react';
import type * as LeafletNS from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * World map on the homepage. Two layers of dots share one canvas renderer:
 *
 *   - site airports (props): amber, sized by annual passengers, popup links
 *     to the localized detail page
 *   - every other scheduled IATA airport (fetched from
 *     /data/world-airports.json, ~3k rows distilled from the OurAirports
 *     CSV): small blue dots with country info popups
 *
 * The tabs filter by continent; below zoom 4 only large world airports are
 * drawn to keep the low-zoom view readable. Leaflet is imported lazily
 * inside effects because its UMD build touches `window` at module scope,
 * which breaks SSR.
 */
export type MapAirport = {
  iata: string;
  name: string;
  city: string;
  countryName: string;
  countryCode: string;
  lat: number;
  lng: number;
  /** Annual passengers in millions; null draws a small default dot. */
  paxM: number | null;
  /** Localized region name; only used when the airport is missing from the world data. */
  region: string;
  /** Localized airport page URL, built on the server. */
  url: string;
};

export type MapLabels = {
  all: string;
  groups: Record<string, string>;
  legendSite: string;
  legendWorld: string;
  /** `显示 {n} 座机场` — `{n}` is replaced with the live marker count. */
  countTemplate: string;
  download: string;
  downloadTitle: string;
  openAirport: string;
};

type Dot = {
  iata: string;
  name: string;
  city: string;
  country: string;
  iso2: string;
  lat: number;
  lng: number;
  large: boolean;
  /** Raw CSV continent code (EU/AS/…); empty for airports missing from the world data. */
  cont: string;
  continent: string; // tab group key
  site?: { url: string; paxM: number | null };
};

const GROUP_KEYS = ['europe', 'asia', 'americas', 'africa', 'oceania'] as const;

// CSV continent codes folded into the five tab groups.
const CONTINENT_GROUP: Record<string, string> = {
  EU: 'europe',
  AS: 'asia',
  NA: 'americas',
  SA: 'americas',
  AF: 'africa',
  OC: 'oceania',
};

// countries.region fallback for site airports missing from the world data
// (none today): zh + en values of the old five-group mapping.
const REGION_FALLBACK: Record<string, string> = {
  Europe: 'europe', '欧洲': 'europe',
  'Europe and Asia': 'europe', '欧洲 / 亚洲': 'europe',
  'East Asia': 'asia', '东亚': 'asia',
  'Central Asia': 'asia', '中亚': 'asia',
  'South Asia': 'asia', '南亚': 'asia',
  'Southeast Asia': 'asia', '东南亚': 'asia',
  'North America': 'americas', '北美洲': 'americas',
  'South America': 'americas', '南美洲': 'americas',
  'the Middle East': 'africa', '中东': 'africa',
  'the Middle East and Europe': 'africa', '中东 / 欧洲': 'africa',
  Africa: 'africa', '非洲': 'africa',
  Oceania: 'oceania', '大洋洲': 'oceania',
};

/** Covered airports get a plane marker sized by traffic. */
const planeSize = (paxM: number | null) => Math.round(14 + Math.sqrt(paxM ?? 4) * 1.3);

/** Same silhouette as the site's PlaneIcon, filled for legibility on the map. */
const PLANE_PATH =
  'M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z';

const planeIcon = (L: typeof import('leaflet'), paxM: number | null) => {
  const size = planeSize(paxM);
  return L.divIcon({
    className: 'am-plane',
    html:
      `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">` +
      `<path d="${PLANE_PATH}"/></svg>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const escHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const csvCell = (v: unknown) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Module-level cache so the init and marker effects share one Leaflet load.
let leafletPromise: Promise<typeof import('leaflet')> | null = null;
const getLeaflet = () => (leafletPromise ??= import('leaflet'));

/**
 * Chrome for the buttons floating over the map, as utilities rather than the
 * `.am-download` / `.am-tabs button` rules they used to be. Idle and active are
 * separate constants instead of an override: both set the background and the
 * text colour, and the order of two classes in an attribute decides nothing.
 *
 * The marker, popup and Leaflet tile-pane rules (.am-plane, .am-pop,
 * .am-map .leaflet-tile-pane) stay in globals.css — that markup is built by
 * Leaflet, not by this component.
 */
const MAP_BUTTON =
  'cursor-pointer rounded-[14px] border px-3 py-[5px] text-[12px] backdrop-blur-[4px] transition-[background-color,border-color] duration-150 [font:inherit]';
const MAP_BUTTON_IDLE =
  'border-white/25 text-white/82 [background:rgba(10,42,67,0.78)] hover:border-white/50 hover:text-white';
const MAP_BUTTON_ON = 'border-amber bg-amber font-semibold text-[#0A2A43]';

export default function AirportMap({
  airports,
  labels,
  dataUrl = '/data/world-airports.json',
}: {
  airports: MapAirport[];
  labels: MapLabels;
  dataUrl?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const layerRef = useRef<LeafletNS.LayerGroup | null>(null);
  const lastGroupRef = useRef<string>('');
  /** Every airport in the active continent tab — the CSV export reads this,
   *  so the download is not limited by the zoom-density display rule. */
  const exportRef = useRef<Dot[]>([]);
  const [ready, setReady] = useState(false);
  const [group, setGroup] = useState<string>('all');
  const [deepZoom, setDeepZoom] = useState(false);
  const [worldDots, setWorldDots] = useState<Dot[] | null>(null);
  const [shown, setShown] = useState(0);

  // Map + basemap + world-data fetch. Site dots render immediately; the
  // blue context layer appears once the JSON resolves.
  useEffect(() => {
    let disposed = false;
    let sizeObserver: ResizeObserver | undefined;
    getLeaflet().then((L) => {
      if (disposed || !hostRef.current || mapRef.current) return;
      const map = L.map(hostRef.current, {
        preferCanvas: true,
        center: [24, 12],
        zoom: 2,
        minZoom: 2,
        maxZoom: 8,
        worldCopyJump: true,
        zoomControl: false,
        maxBounds: L.latLngBounds([-85, -185], [85, 195]),
        maxBoundsViscosity: 0.6,
      });
      // Standard OSM tiles recoloured dark via a CSS filter on the tile pane
      // (see .am-map .leaflet-tile-pane in globals.css) — no API key needed,
      // unlike the CARTO basemaps which now watermark anonymous use.
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &middot; data &copy; OurAirports',
        maxZoom: 19,
      }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setDeepZoom(map.getZoom() >= 4);
      map.on('zoomend', () => setDeepZoom(map.getZoom() >= 4));
      // The container can still be unsized when the map is created (dev CSS
      // injection, fonts, tab activation) — keep Leaflet's size in sync.
      map.invalidateSize();
      sizeObserver = new ResizeObserver(() => map.invalidateSize());
      sizeObserver.observe(hostRef.current!);
      setReady(true);
    });
    fetch(dataUrl)
      .then((r) => r.json())
      .then((data: { airports: [string, string, string, string, string, string, number, number, number][] }) => {
        if (disposed) return;
        setWorldDots(
          data.airports.map((a) => ({
            iata: a[0],
            name: a[1],
            city: a[2],
            country: a[3],
            iso2: a[4],
            lat: a[6],
            lng: a[7],
            large: a[8] === 1,
            cont: a[5],
            continent: CONTINENT_GROUP[a[5]] ?? 'asia',
          }))
        );
      })
      .catch(() => setWorldDots([]));
    return () => {
      disposed = true;
      sizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, [dataUrl]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    getLeaflet().then((L) => {
      if (cancelled) return;
      const map = mapRef.current;
      const layer = layerRef.current;
      if (!map || !layer) return;

      const siteIatas = new Set(airports.map((a) => a.iata));
      const worldIndex = new Map((worldDots ?? []).map((d) => [d.iata, d]));
      const siteDots: Dot[] = airports.map((a) => ({
        iata: a.iata,
        name: a.name,
        city: a.city,
        country: a.countryName,
        iso2: a.countryCode,
        lat: a.lat,
        lng: a.lng,
        large: true,
        cont: worldIndex.get(a.iata)?.cont ?? '',
        continent: worldIndex.get(a.iata)?.continent ?? REGION_FALLBACK[a.region] ?? 'asia',
        site: { url: a.url, paxM: a.paxM },
      }));

      const worldAll = (worldDots ?? []).filter((d) => !siteIatas.has(d.iata));
      // Everything in the tab (for CSV export) vs. what the zoom level draws.
      const groupDots = [...siteDots, ...worldAll].filter(
        (d) => group === 'all' || d.continent === group
      );
      const visible = groupDots.filter((d) => !!d.site || deepZoom || d.large);
      exportRef.current = groupDots;

      layer.clearLayers();
      for (const d of visible) {
        const isSite = !!d.site;
        const popup =
          isSite
            ? `<div class="am-pop"><b>${d.iata}</b> ${escHtml(d.name)}<br/>` +
              `<span>${escHtml(d.city)} · ${escHtml(d.country)}</span><br/>` +
              `<a href="${escHtml(d.site!.url)}">${escHtml(labels.openAirport)} →</a></div>`
            : `<div class="am-pop"><b>${d.iata}</b> ${escHtml(d.name)}<br/>` +
              `<span>${escHtml(d.city)} · ${escHtml(d.country)}</span></div>`;
        if (isSite) {
          // DOM marker so the plane can be an SVG; ~60 of them is cheap.
          L.marker([d.lat, d.lng], {
            icon: planeIcon(L, d.site!.paxM),
            keyboard: false,
            riseOnHover: true,
            riseOffset: 500,
          })
            .bindPopup(popup)
            .addTo(layer);
        } else {
          L.circleMarker([d.lat, d.lng], {
            radius: d.large ? 3.4 : 2.6,
            color: '#2E7EB3',
            weight: 1.2,
            opacity: 0.9,
            fillColor: '#2E7EB3',
            fillOpacity: 0.5,
          })
            .bindPopup(popup)
            .addTo(layer);
        }
      }
      setShown(visible.length);

      // Re-fit when the tab changes, not on every zoom-driven redraw.
      if (lastGroupRef.current !== group && groupDots.length) {
        map.fitBounds(
          L.latLngBounds(groupDots.map((d) => [d.lat, d.lng] as [number, number])).pad(0.25),
          { animate: false, maxZoom: 4 }
        );
      }
      lastGroupRef.current = group;
    });
    return () => {
      cancelled = true;
    };
  }, [ready, worldDots, group, deepZoom, airports, labels.openAirport]);

  /** Exports every airport in the current tab as CSV — the zoom-density rule
   *  only hides dots on screen, it never hides rows from the data. */
  function downloadCsv() {
    const cols = [
      'iata', 'name', 'city', 'country', 'iso2', 'continent',
      'latitude', 'longitude', 'scale', 'covered', 'pax_m', 'page',
    ];
    const rows = exportRef.current.map((d) => [
      d.iata,
      d.name,
      d.city,
      d.country,
      d.iso2,
      d.cont || d.continent,
      d.lat,
      d.lng,
      d.large ? 'large' : 'medium',
      d.site ? 'yes' : 'no',
      d.site?.paxM ?? '',
      d.site?.url ?? '',
    ]);
    const csv =
      [cols.join(','), ...rows.map((r) => r.map(csvCell).join(','))].join('\n') + '\n';
    // BOM so Excel opens the UTF-8 file with non-ASCII names intact.
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airports-${group}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  return (
    <div className="relative overflow-hidden rounded-[14px] border border-line bg-[#0d1b2a] [box-shadow:var(--shadow-md)]">
      {/* `am-map` stays as the hook the tile-pane filter in globals.css hangs on. */}
      <div className="am-map z-[1] h-[480px] max-[640px]:h-[380px]" ref={hostRef} />
      <button
        className={`${MAP_BUTTON} ${MAP_BUTTON_IDLE} absolute left-3.5 top-3 z-[600] inline-flex items-center gap-1.5`}
        onClick={downloadCsv}
        title={labels.downloadTitle}
      >
        <span className="font-bold text-amber" aria-hidden="true">
          ↓
        </span>
        {labels.download}
      </button>
      <div className="absolute right-3 top-3 z-[600] flex max-w-[72%] flex-wrap justify-end gap-1.5 max-[640px]:max-w-[60%]">
        <button
          className={`${MAP_BUTTON} ${group === 'all' ? MAP_BUTTON_ON : MAP_BUTTON_IDLE}`}
          onClick={() => setGroup('all')}
        >
          {labels.all}
        </button>
        {GROUP_KEYS.map((g) => (
          <button
            key={g}
            className={`${MAP_BUTTON} ${group === g ? MAP_BUTTON_ON : MAP_BUTTON_IDLE}`}
            onClick={() => setGroup(g)}
          >
            {labels.groups[g]}
          </button>
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-3.5 left-3.5 z-[600] flex flex-col gap-1 rounded-lg border border-white/18 px-3 py-2 text-[11.5px] text-white/78 backdrop-blur-[4px] [background:rgba(10,42,67,0.78)] max-[640px]:hidden">
        <span className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1.5">
            <svg
              className="h-3 w-3 flex-none [fill:#F2A33C] [filter:drop-shadow(0_0_1px_rgba(0,0,0,0.7))]"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d={PLANE_PATH} />
            </svg>
            {labels.legendSite}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-[9px] w-[9px] flex-none rounded-[50%] [background:#2E7EB3] [box-shadow:0_0_0_1px_rgba(255,255,255,0.35)]" />
            {labels.legendWorld}
          </span>
        </span>
        <span className="border-t border-t-white/15 pt-1 font-semibold [color:#F2A33C]">
          {labels.countTemplate.replace('{n}', String(shown))}
        </span>
      </div>
    </div>
  );
}
