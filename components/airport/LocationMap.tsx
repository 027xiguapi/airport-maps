'use client';

import { useEffect, useRef } from 'react';
import type * as LeafletNS from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Interactive Leaflet map centred on a single airport, drawn with standard
 * OpenStreetMap tiles. Used by the airport page's "Location map" section.
 *
 * Leaflet is imported lazily inside the effect because its UMD build touches
 * `window` at module scope, which breaks SSR — the same approach the homepage
 * `AirportMap` uses. The host <div> is the Leaflet container; the dark-theme
 * tile inversion and the pin marker are styled in app/globals.css.
 */

// Module-level cache so repeated mounts share one Leaflet load.
let leafletPromise: Promise<typeof import('leaflet')> | null = null;
const getLeaflet = () => (leafletPromise ??= import('leaflet'));

const escHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * Amber teardrop pin with a navy centre, matching the homepage map markers.
 * A divIcon (inline SVG) avoids Leaflet's default PNG markers, whose image
 * paths break under the bundler.
 */
const pinIcon = (L: typeof import('leaflet')) =>
  L.divIcon({
    className: 'loc-pin',
    html:
      '<svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 15 9 15s9-8.25 9-15c0-4.97-4.03-9-9-9z"/>' +
      '<circle cx="12" cy="9" r="3.6"/></svg>',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });

export default function LocationMap({
  lat,
  lng,
  label,
  zoom = 12,
}: {
  lat: number;
  lng: number;
  /** Accessible name and popup/tooltip text — the localized airport name. */
  label: string;
  zoom?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);

  useEffect(() => {
    let disposed = false;
    let sizeObserver: ResizeObserver | undefined;

    getLeaflet().then((L) => {
      if (disposed || !hostRef.current || mapRef.current) return;

      const map = L.map(hostRef.current, {
        center: [lat, lng],
        zoom,
        // An inline map in a long page must not hijack vertical scrolling.
        scrollWheelZoom: false,
        zoomControl: true,
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      L.marker([lat, lng], { icon: pinIcon(L), title: label })
        .addTo(map)
        .bindPopup(`<div class="am-pop"><b>${escHtml(label)}</b></div>`);

      mapRef.current = map;
      // The container can still be unsized at creation time (CSS injection,
      // fonts) — sync Leaflet to the real box and keep it in step on resize.
      map.invalidateSize();
      sizeObserver = new ResizeObserver(() => map.invalidateSize());
      sizeObserver.observe(hostRef.current);
    });

    return () => {
      disposed = true;
      sizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, label, zoom]);

  return <div className="loc-map" ref={hostRef} aria-label={label} />;
}
