-- ============================================================================
--  Objects Drizzle cannot express.
--
--  Tables, columns, indexes and constraints live in db/schema.ts and are managed
--  by drizzle-kit. Two objects have no Drizzle representation, so they stay here
--  and are applied by `npm run db:custom` AFTER the schema exists:
--
--    1. the trigger keeping airports.search_blob in sync,
--    2. the directory_stats rollup view.
--
--  (The pg_trgm extension they depend on lives in db/extensions.sql, which runs
--  BEFORE the schema because the index definitions need it.)
--
--  Every statement is idempotent, so this file is safe to re-run after any
--  `db:push` or `db:migrate`.
-- ============================================================================

-- -------------------------------------------------------------- search blob
-- search_blob carries every locale's names, so one ILIKE query serves all
-- locales (see lib/queries.ts).
CREATE OR REPLACE FUNCTION airports_refresh_search_blob() RETURNS trigger AS $$
BEGIN
  NEW.search_blob :=
    NEW.iata || ' ' || NEW.name || ' ' || coalesce(NEW.name_tw, '') || ' ' || NEW.name_en || ' ' ||
    NEW.city || ' ' || coalesce(NEW.city_tw, '') || ' ' ||
    coalesce(NEW.city_en, '') || ' ' || NEW.slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS airports_search_blob_trg ON airports;
CREATE TRIGGER airports_search_blob_trg
  BEFORE INSERT OR UPDATE OF iata, name, name_tw, name_en, city, city_tw, city_en, slug ON airports
  FOR EACH ROW EXECUTE FUNCTION airports_refresh_search_blob();

-- ------------------------------------------------------------------ reports
-- Server-side rollup used by the homepage "statistics" strip.
CREATE OR REPLACE VIEW directory_stats AS
SELECT
  (SELECT count(*) FROM countries)                          AS country_count,
  (SELECT count(*) FROM airports)                           AS airport_count,
  (SELECT count(*) FROM terminals)                          AS terminal_count,
  (SELECT coalesce(sum(gate_count), 0) FROM airports)       AS gate_count;
