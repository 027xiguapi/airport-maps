-- ============================================================================
--  Extensions.
--
--  Applied BEFORE `db:push` / `db:migrate`: the trigram indexes on
--  countries.name / countries.name_en / airports.search_blob need the
--  `gin_trgm_ops` operator class, which only exists once pg_trgm is installed.
--
--  Idempotent — safe to re-run.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;
