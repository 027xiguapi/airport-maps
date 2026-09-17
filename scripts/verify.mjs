/**
 * Smoke-tests the seeded database by running the queries the site depends on.
 * Usage: node scripts/verify.mjs
 */
import pg from 'pg';
import { databaseUrl } from './_env.mjs';

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();

const check = async (label, sql, params = []) => {
  const { rows } = await client.query(sql, params);
  console.log(`\n## ${label}  (${rows.length} rows)`);
  console.table(rows.slice(0, 8));
  return rows;
};

await check('directory stats', 'SELECT * FROM directory_stats');

await check(
  'busiest airport cities',
  `SELECT city, city_en, count(*) AS airports, sum(annual_pax_m) AS pax_m
     FROM airports GROUP BY city, city_en
    ORDER BY pax_m DESC NULLS LAST LIMIT 5`
);

await check(
  'recently updated',
  `SELECT a.iata, a.name, a.city, c.name AS country, a.updated_at::date
     FROM airports a JOIN countries c ON c.code = a.country_code
    ORDER BY a.updated_at DESC LIMIT 5`
);

await check(
  'search: "lon"',
  `SELECT a.iata, a.name, a.city
     FROM airports a JOIN countries c ON c.code = a.country_code
    WHERE a.search_blob ILIKE '%lon%' OR c.name ILIKE '%lon%' OR c.name_en ILIKE '%lon%'
    ORDER BY a.annual_pax_m DESC NULLS LAST LIMIT 8`
);

await check(
  'search: "悉尼" (country/airport name)',
  `SELECT a.iata, a.name, a.city
     FROM airports a JOIN countries c ON c.code = a.country_code
    WHERE a.search_blob ILIKE '%悉尼%' OR c.name ILIKE '%悉尼%'
    LIMIT 8`
);

await check('satellite concourses', `SELECT airport_iata, code, name FROM terminals WHERE is_satellite ORDER BY airport_iata`);

await check(
  'airport detail (PEK)',
  `SELECT a.iata, a.name, a.city, a.gate_count, a.annual_pax_m, a.distance_km,
          (SELECT count(*) FROM terminals t WHERE t.airport_iata = a.iata) AS terminals,
          (SELECT count(*) FROM ground_transport g WHERE g.airport_iata = a.iata) AS transit,
          (SELECT count(*) FROM airport_facilities f WHERE f.airport_iata = a.iata) AS facilities
     FROM airports a WHERE a.iata = 'PEK'`
);

await check(
  'slug lookup works',
  `SELECT iata, slug FROM airports WHERE slug = 'beijing-capital-international-airport-pek'`
);

await check(
  'country counts',
  `SELECT c.code, c.name, count(a.iata) AS airports
     FROM countries c LEFT JOIN airports a ON a.country_code = c.code
    GROUP BY c.code, c.name ORDER BY airports DESC, c.sort_order LIMIT 8`
);

await check('integrity: airports without terminals', `SELECT iata FROM airports WHERE NOT EXISTS (SELECT 1 FROM terminals t WHERE t.airport_iata = airports.iata)`);
await check('integrity: search_blob empty', `SELECT iata FROM airports WHERE search_blob = ''`);

await client.end();
