'use client';

import { useEffect, useRef, useState } from 'react';
import { MaximizeIcon, MinimizeIcon, MinusIcon, PlusIcon, RotateCcwIcon, XIcon } from 'lucide-react';
import type * as LeafletNS from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { greatCirclePoints } from '@/lib/geo-convert';
import { ROUTE_TIERS, routeTier, type RouteTierId } from '@/lib/route-tiers';
import type { RouteDestination } from '@/lib/types';

/**
 * World map of an airport's direct destinations, built on the same
 * Leaflet/OpenStreetMap stack as the location map above it.
 *
 * Each destination is a dot coloured by how many carriers serve it, joined to
 * the airport by an arc along the great circle — a straight lat/lng line would
 * cut a chord and bend the wrong way across a Mercator map. The legend, the
 * reset button and the zoom controls are plain DOM overlays rather than Leaflet
 * controls, so they can use the site's tokens and follow the theme. The dark
 * basemap and the arc colour live in app/globals.css.
 *
 * Destinations the directory covers are links, not just dots: their marker is a
 * divIcon wrapping an `<a>` to that airport's page, so a destination can be
 * opened in a new tab the way any other link on the site can. Destinations the
 * bulk index knows but the directory does not stay plain markers — there is no
 * page to send anyone to.
 *
 * Panning is a plain mouse/touch drag; the wheel zooms about the cursor (which
 * also covers the trackpad pinch, the same event with `ctrlKey`); the themed ±
 * pair disables itself at the ends of the range; and the map can be taken
 * fullscreen — the native Fullscreen API where it exists, a fixed overlay
 * fallback where it does not (iOS Safari).
 */

// Module-level cache so repeated mounts share one Leaflet load.
let leafletPromise: Promise<typeof import('leaflet')> | null = null;
const getLeaflet = () => (leafletPromise ??= import('leaflet'));

const escHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Copy for the legend, the map controls and the destination tooltips. */
export type RouteMapLabels = {
  legendTitle: string;
  legendClose: string;
  reset: string;
  zoomIn: string;
  zoomOut: string;
  fullscreen: string;
  exitFullscreen: string;
  /** One label per tier id, e.g. "6+ airlines". */
  tiers: Record<RouteTierId, string>;
  /** "{n} airlines" — `{n}` is substituted client-side. */
  carriers: string;
  /** Link hint on a clickable dot, e.g. "Open the {iata} airport page". */
  openAirport: string;
  /** BCP-47 tag for the thousands separators in tooltips. */
  numberLocale: string;
};

export default function RouteMap({
  lat,
  lng,
  /** Accessible name of the map. */
  label,
  /** Persistent label on the airport itself, e.g. "香港 (HKG)". */
  centerLabel,
  destinations,
  labels,
}: {
  lat: number;
  lng: number;
  label: string;
  centerLabel: string;
  destinations: RouteDestination[];
  labels: RouteMapLabels;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const fitRef = useRef<(() => void) | null>(null);
  const [legendOpen, setLegendOpen] = useState(true);
  // Leaflet owns the zoom, so the ± buttons read their own disabled state back
  // out of it whenever the range moves.
  const [zoomEdges, setZoomEdges] = useState({ atMin: false, atMax: false });
  const [isFullscreen, setIsFullscreen] = useState(false);
  // The CSS-overlay fallback flag lives in a ref as well as the class on the
  // shell, so Escape can leave a fallback fullscreen without a re-render race.
  const cssFsRef = useRef(false);

  // Leaflet builds everything eagerly and its layers cannot be diffed by React,
  // so the map is created once and the data it draws is kept in a ref. That way
  // a re-render with equal-but-new props (a fresh destinations array) never
  // tears the map down and rebuilds it.
  const dataRef = useRef({ destinations, labels, centerLabel });
  useEffect(() => {
    dataRef.current = { destinations, labels, centerLabel };
  });

  useEffect(() => {
    let disposed = false;
    let sizeObserver: ResizeObserver | undefined;

    getLeaflet().then((L) => {
      if (disposed || !hostRef.current || mapRef.current) return;
      const { destinations: points, labels: copy, centerLabel: hubLabel } = dataRef.current;

      const map = L.map(hostRef.current, {
        center: [lat, lng],
        zoom: 3,
        minZoom: 2,
        // The dots never scale with the zoom, so past this there is nothing
        // left to zoom into but the tiles underneath them.
        maxZoom: 9,
        // Panning and zooming behave like every other map app: drag to pan
        // (with Leaflet's inertia), wheel to zoom about the cursor. The wheel
        // listener also covers the trackpad pinch, which arrives as the same
        // event with `ctrlKey` set.
        dragging: true,
        scrollWheelZoom: true,
        // Leaflet's own chrome is replaced by the themed overlay controls.
        zoomControl: false,
        worldCopyJump: true,
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // All arcs in one multi-polyline: a single SVG path rather than one path
      // per route, which matters for hubs with 150+ destinations. Short hops
      // need far fewer points than intercontinental ones to look smooth.
      const arcs = points.map((d) =>
        greatCirclePoints({ lat, lng }, { lat: d.lat, lng: d.lng }, Math.min(48, Math.max(8, Math.round(d.km / 400))))
      );
      L.polyline(arcs, { weight: 1, opacity: 0.45, interactive: false, className: 'rt-line' }).addTo(map);

      const num = new Intl.NumberFormat(copy.numberLocale);
      for (const d of points) {
        const tier = routeTier(d.carriers.length);
        const place = `${d.city} (${d.iata})`;
        const meta = `${copy.carriers.replace('{n}', String(d.carriers.length))} · ${num.format(d.km)} km`;
        const openHint = copy.openAirport.replace('{iata}', d.iata);

        // A divIcon rather than an SVG circleMarker, so a covered destination
        // can be a real <a>: middle-click and right-click then behave like they
        // do on any other link. `tabIndex: -1` keeps the map out of the page's
        // tab order — a hub would otherwise drop 150 link stops into it.
        const dot = `<span class="rt-dot${tier.hollow ? ' hollow' : ''}" style="--rt-dot:${tier.color}"></span>`;
        const icon = L.divIcon({
          className: d.href ? 'rt-dot-wrap linked' : 'rt-dot-wrap',
          html: d.href
            ? `<a href="${escHtml(d.href)}" tabindex="-1" aria-label="${escHtml(openHint)}">${dot}</a>`
            : dot,
          // The 10px dot sits in the middle of a 16px box for a slightly
          // easier target than the dot alone gives.
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        L.marker([d.lat, d.lng], { icon })
          .addTo(map)
          .bindTooltip(
            `<b>${escHtml(place)}</b><br>${escHtml(d.name)}<br>` +
              `<span class="rt-tip-meta">${escHtml(meta)}</span>` +
              (d.href ? `<br><span class="rt-tip-link">${escHtml(openHint)} →</span>` : ''),
            { className: 'rt-tip', direction: 'top', offset: [0, -8], opacity: 1 }
          );
      }

      // The airport itself: amber on navy, the marker colours used across the
      // site, with the label pinned open like a hub badge.
      L.circleMarker([lat, lng], {
        radius: 6,
        color: '#0A2A43',
        weight: 2,
        fillColor: '#F2A33C',
        fillOpacity: 1,
      })
        .addTo(map)
        .bindTooltip(escHtml(hubLabel), {
          className: 'rt-tip rt-tip-hub',
          permanent: true,
          direction: 'right',
          offset: [9, 0],
          opacity: 1,
        });

      const bounds = L.latLngBounds([
        [lat, lng],
        ...points.map((d) => [d.lat, d.lng] as [number, number]),
      ]);
      fitRef.current = () => {
        // Sync Leaflet to the real box first: a container that was still unsized
        // when the map was created would make the fit below measure an empty one
        // and land on minZoom instead of on the destinations.
        map.invalidateSize();
        // maxZoom keeps a single-destination airport from filling the screen
        // with two dots.
        map.fitBounds(bounds, { padding: [36, 36], maxZoom: 5 });
      };
      fitRef.current();

      mapRef.current = map;

      const syncZoomEdges = () => {
        if (disposed) return;
        const atMin = map.getZoom() <= map.getMinZoom();
        const atMax = map.getZoom() >= map.getMaxZoom();
        setZoomEdges((prev) =>
          prev.atMin === atMin && prev.atMax === atMax ? prev : { atMin, atMax }
        );
      };
      map.on('zoomend zoomlevelschange', syncZoomEdges);
      syncZoomEdges();

      // The container can still be unsized at creation time (CSS injection,
      // fonts) — sync Leaflet to the real box and keep it in step on resize. The
      // first fit of an unsized container measured an empty box and landed on
      // minZoom, so redo it once there are real dimensions to fit into. This
      // also covers the size change when fullscreen comes and goes.
      sizeObserver = new ResizeObserver(() => {
        const stale = !map.getSize().x || !map.getSize().y;
        map.invalidateSize();
        if (stale) fitRef.current?.();
      });
      sizeObserver.observe(hostRef.current);
    });

    return () => {
      disposed = true;
      sizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      fitRef.current = null;
    };
  }, [lat, lng]);

  // ---------------------------------------------------------------- fullscreen
  // Native element fullscreen where it exists; a fixed full-viewport overlay
  // (`.rt-cssfs`, styled in globals.css) where it does not — iOS Safari never
  // grew element fullscreen, and a sandboxed iframe or a refused request can
  // deny it anywhere. The overlay keeps the same controls and legend because
  // they live inside the shell being promoted.
  const setCssFullscreen = (on: boolean) => {
    const shell = shellRef.current;
    if (!shell) return;
    shell.classList.toggle('rt-cssfs', on);
    cssFsRef.current = on;
    setIsFullscreen(on);
  };

  useEffect(() => {
    const doc = document as Document & { webkitFullscreenElement?: Element };
    // Both spellings for the older Safari path, one shared handler.
    const onChange = () =>
      setIsFullscreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement) || cssFsRef.current);
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  // Escape leaves the CSS-overlay fullscreen; the native one handles its own.
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && cssFsRef.current) setCssFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    const shell = shellRef.current;
    if (!shell) return;
    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => void;
    };
    const nativeActive = !!(doc.fullscreenElement || doc.webkitFullscreenElement);

    if (nativeActive) {
      if (doc.exitFullscreen) void doc.exitFullscreen();
      else doc.webkitExitFullscreen?.();
      return;
    }
    if (cssFsRef.current) {
      setCssFullscreen(false);
      return;
    }
    const anyShell = shell as HTMLElement & { webkitRequestFullscreen?: () => void };
    if (typeof anyShell.requestFullscreen === 'function') {
      anyShell.requestFullscreen().catch(() => setCssFullscreen(true));
    } else if (typeof anyShell.webkitRequestFullscreen === 'function') {
      anyShell.webkitRequestFullscreen();
    } else {
      setCssFullscreen(true);
    }
  };

  const { labels: copy } = dataRef.current;

  return (
    <div className="rt-shell" ref={shellRef}>
      <div className="rt-map" ref={hostRef} aria-label={label} />

      {/* One column of themed controls where Leaflet's own chrome would be. */}
      <div className="rt-controls">
        <button type="button" className="rt-reset" onClick={() => fitRef.current?.()}>
          <RotateCcwIcon aria-hidden="true" />
          {copy.reset}
        </button>

        <div className="rt-zoom">
          <button
            type="button"
            onClick={() => mapRef.current?.zoomIn()}
            disabled={zoomEdges.atMax}
            aria-label={copy.zoomIn}
          >
            <PlusIcon aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => mapRef.current?.zoomOut()}
            disabled={zoomEdges.atMin}
            aria-label={copy.zoomOut}
          >
            <MinusIcon aria-hidden="true" />
          </button>
          <button
            type="button"
            className="rt-fs"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? copy.exitFullscreen : copy.fullscreen}
            title={isFullscreen ? copy.exitFullscreen : copy.fullscreen}
          >
            {isFullscreen ? <MinimizeIcon aria-hidden="true" /> : <MaximizeIcon aria-hidden="true" />}
          </button>
        </div>
      </div>

      {legendOpen && (
        <div className="rt-legend">
          <div className="hd">
            <span>{copy.legendTitle}</span>
            <button type="button" onClick={() => setLegendOpen(false)} aria-label={copy.legendClose}>
              <XIcon aria-hidden="true" />
            </button>
          </div>
          <div className="rows">
            {ROUTE_TIERS.map((tier) => (
              <span key={tier.id}>
                <i
                  className={tier.hollow ? 'rt-mark hollow' : 'rt-mark'}
                  style={tier.hollow ? { borderColor: tier.color } : { background: tier.color }}
                />
                {copy.tiers[tier.id]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
