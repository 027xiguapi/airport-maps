'use client';

import { useEffect, useRef, useState } from 'react';
import { MinusIcon, PlusIcon, RotateCcwIcon } from 'lucide-react';
import type * as LeafletNS from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { greatCirclePoints } from '@/lib/geo-convert';
import type { FlightPlace } from '@/lib/flights';

/**
 * Leaflet/OpenStreetMap map of one flight's route.
 *
 * The airport route map (`components/airport/RouteMap.tsx`) is built for dozens
 * of destinations; this one is deliberately smaller: two airport markers, the
 * great-circle line between them and the standard themed reset/zoom controls.
 * The map is fitted to the two airports, so a short hop is not lost in a world
 * view and a long-haul route still shows its whole arc.
 *
 * Leaflet is imported lazily inside the effect (its UMD build touches `window`),
 * and its default attribution control renders "Leaflet | © OpenStreetMap
 * contributors" from the tile layer below. The `.rt-*` classes reuse the route
 * map's styling in app/globals.css, including the dark-theme tile filter.
 */

let leafletPromise: Promise<typeof import('leaflet')> | null = null;
const getLeaflet = () => (leafletPromise ??= import('leaflet'));

const escHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export type FlightRouteMapLabels = {
  /** Accessible name of the map, e.g. "Route map for flight 3U3708". */
  aria: string;
  reset: string;
  zoomIn: string;
  zoomOut: string;
};

export default function FlightRouteMap({
  origin,
  destination,
  labels,
}: {
  origin: FlightPlace;
  destination: FlightPlace;
  labels: FlightRouteMapLabels;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const fitRef = useRef<(() => void) | null>(null);
  const [zoomEdges, setZoomEdges] = useState({ atMin: false, atMax: false });

  const originLat = origin.lat;
  const originLng = origin.lng;
  const destLat = destination.lat;
  const destLng = destination.lng;

  useEffect(() => {
    if (originLat == null || originLng == null || destLat == null || destLng == null) return;

    let disposed = false;
    let sizeObserver: ResizeObserver | undefined;

    getLeaflet().then((L) => {
      if (disposed || !hostRef.current || mapRef.current) return;

      const map = L.map(hostRef.current, {
        center: [originLat, originLng],
        zoom: 4,
        minZoom: 2,
        maxZoom: 10,
        // An inline map in a long article must not capture page scrolling;
        // the themed ± buttons provide the zoom instead.
        scrollWheelZoom: false,
        dragging: true,
        zoomControl: false,
        worldCopyJump: true,
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const line = greatCirclePoints(
        { lat: originLat, lng: originLng },
        { lat: destLat, lng: destLng },
        128
      );
      L.polyline(line, {
        className: 'rt-line',
        weight: 2.5,
        opacity: 0.95,
        interactive: false,
      }).addTo(map);

      const endpoint = (
        place: FlightPlace,
        lat: number,
        lng: number,
        fillColor: string,
        direction: 'top' | 'bottom'
      ) => {
        const placeLabel = place.city ? `${place.city} (${place.iata})` : place.name || place.iata;
        L.circleMarker([lat, lng], {
          radius: 7,
          color: '#0A2A43',
          weight: 2,
          fillColor,
          fillOpacity: 1,
        })
          .addTo(map)
          // The permanent label is just the IATA code so it never runs into
          // the map edge on a phone; the full airport name is a click away.
          .bindTooltip(`<b>${escHtml(place.iata)}</b>`, {
            className: 'rt-tip rt-tip-hub',
            permanent: true,
            direction,
            offset: [0, direction === 'top' ? -9 : 9],
            opacity: 1,
          })
          .bindPopup(
            `<b>${escHtml(place.iata)}</b> ${escHtml(placeLabel)}<br>${escHtml(place.name)}`
          );
      };

      endpoint(origin, originLat, originLng, '#F2A33C', 'top');
      endpoint(destination, destLat, destLng, '#2E7DB3', 'bottom');

      const bounds = L.latLngBounds([
        [originLat, originLng],
        [destLat, destLng],
      ]);
      fitRef.current = () => {
        map.invalidateSize();
        // A very short hop would otherwise zoom to street level, where an
        // air route means nothing; maxZoom keeps both airports meaningful.
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 6 });
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

      // The container can be unsized at creation time (CSS injection/fonts);
      // sync Leaflet to the real box and re-fit once dimensions exist.
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
  }, [originLat, originLng, destLat, destLng]);

  if (originLat == null || originLng == null || destLat == null || destLng == null) {
    return null;
  }

  return (
    <div className="rt-shell fl-route-map">
      <div className="rt-map" ref={hostRef} aria-label={labels.aria} />

      {/* Controls sit in a bar under the map rather than on top of it: a
          permanent airport label can be in any corner, so an overlay would
          occasionally hide an endpoint (or be hidden by its tooltip). */}
      <div className="fl-map-toolbar">
        <button type="button" className="rt-reset" onClick={() => fitRef.current?.()}>
          <RotateCcwIcon aria-hidden="true" />
          {labels.reset}
        </button>

        <div className="rt-zoom">
          <button
            type="button"
            onClick={() => mapRef.current?.zoomIn()}
            disabled={zoomEdges.atMax}
            aria-label={labels.zoomIn}
          >
            <PlusIcon aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => mapRef.current?.zoomOut()}
            disabled={zoomEdges.atMin}
            aria-label={labels.zoomOut}
          >
            <MinusIcon aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
