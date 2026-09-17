/** Localized output types (camelCase) returned by lib/queries.ts. */

export type Country = {
  code: string;
  name: string;
  nameEn: string;
  region: string;
  flagUrl: string;
  sortOrder: number;
};

export type CountryWithCount = Country & {
  airportCount: number;
  terminalCount: number;
};

export type AirportSummary = {
  iata: string;
  slug: string;
  /** Display name in the requested locale. */
  name: string;
  /** English name, always available; used for secondary lines. */
  nameEn: string;
  city: string;
  cityEn: string | null;
  countryCode: string;
  countryName: string;
  countryNameEn: string;
  region: string;
  flagUrl: string;
  gateCount: number;
  annualPaxM: number | null;
  distanceKm: number | null;
  updatedAt: string;
  terminalCount: number;
};

export type Amenity = { icon: string; label: string };

export type Terminal = {
  id: number;
  code: string;
  name: string;
  gateRange: string | null;
  gateCount: number;
  /** Editorial text; null when the requested locale has no translation. */
  airlines: string | null;
  isSatellite: boolean;
  amenities: Amenity[];
};

/** `name`/`description` are empty when the locale has no translation; the UI
 *  then falls back to the transport mode label. */
export type TransitOption = { icon: string; name: string; description: string };

export type AirportDetail = AirportSummary & {
  descriptionMd: string;
  terminals: Terminal[];
  facilities: Amenity[];
  transit: TransitOption[];
};

export type CityHub = {
  city: string;
  cityEn: string | null;
  countryCode: string;
  countryName: string;
  flagUrl: string;
  airportCount: number;
  totalPaxM: number | null;
  leadIata: string;
  leadName: string;
  leadSlug: string;
  iatas: string[];
};

export type DirectoryStats = {
  countryCount: number;
  airportCount: number;
  terminalCount: number;
  gateCount: number;
};

export type SearchHit = {
  iata: string;
  slug: string;
  name: string;
  nameEn: string;
  city: string;
  countryCode: string;
  countryName: string;
  flagUrl: string;
};

export type AirportSort = 'pax' | 'name' | 'iata' | 'updated';

export type AirportListParams = {
  q?: string;
  country?: string;
  sort?: AirportSort;
  page?: number;
  perPage?: number;
};
