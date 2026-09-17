-- ============================================================================
--  Global Airport Maps — schema
--  PostgreSQL 13+
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

DROP TABLE IF EXISTS terminal_amenities, airport_facilities, ground_transport,
                     terminals, airport_translations, airports, countries CASCADE;
DROP TYPE IF EXISTS transport_mode;

-- ---------------------------------------------------------------- countries
CREATE TABLE countries (
  code        char(2)      PRIMARY KEY,               -- ISO 3166-1 alpha-2
  name        text         NOT NULL,                  -- 中文名
  name_en     text         NOT NULL,
  region      text         NOT NULL,                  -- 中文区域
  region_en   text         NOT NULL,                  -- English region
  flag_url    text         NOT NULL,
  sort_order  int          NOT NULL DEFAULT 0
);

CREATE INDEX countries_name_trgm_idx    ON countries USING gin (name gin_trgm_ops);
CREATE INDEX countries_name_en_trgm_idx ON countries USING gin (name_en gin_trgm_ops);

-- ----------------------------------------------------------------- airports
CREATE TABLE airports (
  iata           char(3)      PRIMARY KEY,
  slug           text         NOT NULL UNIQUE,
  name           text         NOT NULL,
  name_en        text         NOT NULL,
  city           text         NOT NULL,
  city_en        text,
  country_code   char(2)      NOT NULL REFERENCES countries(code) ON DELETE RESTRICT,
  gate_count     int          NOT NULL DEFAULT 0,
  annual_pax_m   numeric(8,2),                        -- annual passengers, millions
  distance_km    numeric(6,1),                        -- to city centre
  updated_at     timestamptz  NOT NULL DEFAULT now(),
  -- denormalised haystack for /api/search; kept in sync by a trigger.
  -- Holds every locale's names so search works regardless of UI language.
  search_blob    text         NOT NULL DEFAULT '',
  CONSTRAINT airports_iata_upper_chk CHECK (iata = upper(iata)),
  CONSTRAINT airports_slug_chk       CHECK (slug = lower(slug))
);

CREATE INDEX airports_country_idx    ON airports (country_code);
CREATE INDEX airports_city_idx       ON airports (city);
CREATE INDEX airports_updated_idx    ON airports (updated_at DESC);
CREATE INDEX airports_pax_idx        ON airports (annual_pax_m DESC NULLS LAST);
CREATE INDEX airports_slug_idx       ON airports (slug);
CREATE INDEX airports_search_trgm_idx ON airports USING gin (search_blob gin_trgm_ops);

-- ------------------------------------------------------ airport translations
-- Long/short prose per airport and locale, authored in Markdown. The locale
-- list lives in lib/i18n/config.ts; the app validates before writing, so the
-- column is intentionally unconstrained to keep adding a language a
-- data-only change.
CREATE TABLE airport_translations (
  airport_iata  char(3)   NOT NULL REFERENCES airports(iata) ON DELETE CASCADE,
  locale        text      NOT NULL,
  description_md text     NOT NULL,
  PRIMARY KEY (airport_iata, locale)
);

CREATE INDEX airport_translations_locale_idx ON airport_translations (locale);

-- ---------------------------------------------------------------- terminals
-- The `*_en` columns are NULL until a translation exists. The UI then falls
-- back to locale-neutral data (terminal code, gate count, transport mode)
-- rather than displaying the default language's text on another locale's page.
CREATE TABLE terminals (
  id            serial       PRIMARY KEY,
  airport_iata  char(3)      NOT NULL REFERENCES airports(iata) ON DELETE CASCADE,
  code          text         NOT NULL,
  name          text         NOT NULL,
  name_en       text,
  gate_range    text,
  gate_range_en text,
  gate_count    int          NOT NULL DEFAULT 0,
  airlines      text,
  airlines_en   text,
  is_satellite  boolean      NOT NULL DEFAULT false,   -- drawn as a round concourse
  sort_order    int          NOT NULL DEFAULT 0,
  UNIQUE (airport_iata, code)
);

CREATE INDEX terminals_airport_idx ON terminals (airport_iata, sort_order);

-- -------------------------------------------------------- terminal amenities
CREATE TABLE terminal_amenities (
  id           serial  PRIMARY KEY,
  terminal_id  int     NOT NULL REFERENCES terminals(id) ON DELETE CASCADE,
  icon         text    NOT NULL,
  label        text    NOT NULL,
  label_en     text,
  sort_order   int     NOT NULL DEFAULT 0
);

CREATE INDEX terminal_amenities_terminal_idx ON terminal_amenities (terminal_id, sort_order);

-- -------------------------------------------------------- airport facilities
CREATE TABLE airport_facilities (
  id            serial  PRIMARY KEY,
  airport_iata  char(3) NOT NULL REFERENCES airports(iata) ON DELETE CASCADE,
  icon          text    NOT NULL,
  label         text    NOT NULL,
  label_en      text,
  sort_order    int     NOT NULL DEFAULT 0
);

CREATE INDEX airport_facilities_airport_idx ON airport_facilities (airport_iata, sort_order);

-- ---------------------------------------------------------- ground transport
CREATE TABLE ground_transport (
  id            serial  PRIMARY KEY,
  airport_iata  char(3) NOT NULL REFERENCES airports(iata) ON DELETE CASCADE,
  icon          text    NOT NULL,                      -- train|tram|bus|taxi|car|ferry
  name          text    NOT NULL,
  name_en       text,
  description   text    NOT NULL DEFAULT '',
  description_en text,
  sort_order    int     NOT NULL DEFAULT 0
);

CREATE INDEX ground_transport_airport_idx ON ground_transport (airport_iata, sort_order);

-- -------------------------------------------------------------- search blob
CREATE OR REPLACE FUNCTION airports_refresh_search_blob() RETURNS trigger AS $$
BEGIN
  NEW.search_blob :=
    NEW.iata || ' ' || NEW.name || ' ' || NEW.name_en || ' ' ||
    NEW.city || ' ' || coalesce(NEW.city_en, '') || ' ' || NEW.slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER airports_search_blob_trg
  BEFORE INSERT OR UPDATE OF iata, name, name_en, city, city_en, slug ON airports
  FOR EACH ROW EXECUTE FUNCTION airports_refresh_search_blob();

-- ------------------------------------------------------------------ reports
-- Monthly server-side rollup used by the homepage "statistics" strip.
CREATE OR REPLACE VIEW directory_stats AS
SELECT
  (SELECT count(*) FROM countries)                          AS country_count,
  (SELECT count(*) FROM airports)                           AS airport_count,
  (SELECT count(*) FROM terminals)                          AS terminal_count,
  (SELECT coalesce(sum(gate_count), 0) FROM airports)       AS gate_count;
