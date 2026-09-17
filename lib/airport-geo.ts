/**
 * Approximate coordinates and IANA timezone per airport, keyed by IATA code.
 *
 * Coordinates are rounded to four decimals (~10 m) — plenty for display, map
 * links and embeds, not for navigation. Used by the airport page's time,
 * details and interactive-map sections; codes without an entry simply skip
 * those sections.
 */
export type AirportGeo = { lat: number; lng: number; tz: string };

const GEO: Record<string, AirportGeo> = {
  DXB: { lat: 25.2532, lng: 55.3657, tz: 'Asia/Dubai' },
  VIE: { lat: 48.1103, lng: 16.5697, tz: 'Europe/Vienna' },
  SYD: { lat: -33.9399, lng: 151.1753, tz: 'Australia/Sydney' },
  GRU: { lat: -23.4356, lng: -46.4731, tz: 'America/Sao_Paulo' },
  YVR: { lat: 49.1967, lng: -123.1815, tz: 'America/Vancouver' },
  YYZ: { lat: 43.6777, lng: -79.6248, tz: 'America/Toronto' },
  ZRH: { lat: 47.4647, lng: 8.5492, tz: 'Europe/Zurich' },
  CAN: { lat: 23.3924, lng: 113.2988, tz: 'Asia/Shanghai' },
  HKG: { lat: 22.308, lng: 113.9185, tz: 'Asia/Hong_Kong' },
  PEK: { lat: 40.0799, lng: 116.6031, tz: 'Asia/Shanghai' },
  PVG: { lat: 31.1443, lng: 121.8083, tz: 'Asia/Shanghai' },
  FRA: { lat: 50.0379, lng: 8.5622, tz: 'Europe/Berlin' },
  MUC: { lat: 48.3537, lng: 11.775, tz: 'Europe/Berlin' },
  CPH: { lat: 55.618, lng: 12.656, tz: 'Europe/Copenhagen' },
  CAI: { lat: 30.1219, lng: 31.4056, tz: 'Africa/Cairo' },
  BCN: { lat: 41.2971, lng: 2.0785, tz: 'Europe/Madrid' },
  MAD: { lat: 40.4839, lng: -3.568, tz: 'Europe/Madrid' },
  CDG: { lat: 49.0097, lng: 2.5479, tz: 'Europe/Paris' },
  ORY: { lat: 48.7233, lng: 2.3794, tz: 'Europe/Paris' },
  LGW: { lat: 51.1537, lng: -0.1821, tz: 'Europe/London' },
  LHR: { lat: 51.47, lng: -0.4543, tz: 'Europe/London' },
  STN: { lat: 51.886, lng: 0.2389, tz: 'Europe/London' },
  ATH: { lat: 37.9364, lng: 23.9445, tz: 'Europe/Athens' },
  CGK: { lat: -6.1256, lng: 106.6558, tz: 'Asia/Jakarta' },
  DUB: { lat: 53.4213, lng: -6.2701, tz: 'Europe/Dublin' },
  DEL: { lat: 28.5562, lng: 77.1, tz: 'Asia/Kolkata' },
  FCO: { lat: 41.8003, lng: 12.2389, tz: 'Europe/Rome' },
  MXP: { lat: 45.6306, lng: 8.7281, tz: 'Europe/Rome' },
  HND: { lat: 35.5494, lng: 139.7798, tz: 'Asia/Tokyo' },
  KIX: { lat: 34.4273, lng: 135.244, tz: 'Asia/Tokyo' },
  NRT: { lat: 35.772, lng: 140.3929, tz: 'Asia/Tokyo' },
  ICN: { lat: 37.4602, lng: 126.4407, tz: 'Asia/Seoul' },
  MEX: { lat: 19.4363, lng: -99.0721, tz: 'America/Mexico_City' },
  KUL: { lat: 2.7456, lng: 101.7099, tz: 'Asia/Kuala_Lumpur' },
  AMS: { lat: 52.3105, lng: 4.7683, tz: 'Europe/Amsterdam' },
  AKL: { lat: -37.0082, lng: 174.785, tz: 'Pacific/Auckland' },
  MNL: { lat: 14.5086, lng: 121.0198, tz: 'Asia/Manila' },
  LIS: { lat: 38.7756, lng: -9.1354, tz: 'Europe/Lisbon' },
  DOH: { lat: 25.2731, lng: 51.6081, tz: 'Asia/Qatar' },
  SVO: { lat: 55.9726, lng: 37.4146, tz: 'Europe/Moscow' },
  RUH: { lat: 24.9576, lng: 46.6988, tz: 'Asia/Riyadh' },
  ARN: { lat: 59.6519, lng: 17.9186, tz: 'Europe/Stockholm' },
  SIN: { lat: 1.3644, lng: 103.9915, tz: 'Asia/Singapore' },
  BKK: { lat: 13.69, lng: 100.7501, tz: 'Asia/Bangkok' },
  IST: { lat: 41.2753, lng: 28.7519, tz: 'Europe/Istanbul' },
  ATL: { lat: 33.6407, lng: -84.4277, tz: 'America/New_York' },
  EWR: { lat: 40.6895, lng: -74.1745, tz: 'America/New_York' },
  HPN: { lat: 41.067, lng: -73.7074, tz: 'America/New_York' },
  IAD: { lat: 38.9531, lng: -77.4565, tz: 'America/New_York' },
  JFK: { lat: 40.6413, lng: -73.7781, tz: 'America/New_York' },
  LAX: { lat: 33.9416, lng: -118.4085, tz: 'America/Los_Angeles' },
  LGA: { lat: 40.7769, lng: -73.874, tz: 'America/New_York' },
  MIA: { lat: 25.7959, lng: -80.287, tz: 'America/New_York' },
  OKC: { lat: 35.3931, lng: -97.6007, tz: 'America/Chicago' },
  ORD: { lat: 41.9742, lng: -87.9073, tz: 'America/Chicago' },
  SEA: { lat: 47.4502, lng: -122.3088, tz: 'America/Los_Angeles' },
  SFO: { lat: 37.6213, lng: -122.379, tz: 'America/Los_Angeles' },
  TAS: { lat: 41.2579, lng: 69.2812, tz: 'Asia/Tashkent' },
  SGN: { lat: 10.8188, lng: 106.6519, tz: 'Asia/Ho_Chi_Minh' },
  CPT: { lat: -33.9689, lng: 18.6017, tz: 'Africa/Johannesburg' },
};

export function getAirportGeo(iata: string): AirportGeo | null {
  return GEO[iata.toUpperCase()] ?? null;
}
