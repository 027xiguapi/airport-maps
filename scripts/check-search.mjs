/**
 * Ad-hoc relevance check for the /api/search ranking. Mirrors the SQL in
 * lib/queries.ts#searchAirports.
 * Usage: node scripts/check-search.mjs [term ...]
 */
import pg from 'pg';
import { databaseUrl } from './_env.mjs';

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();

const likePattern = (q) => `%${q.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

async function search(term, limit = 6) {
  const { rows } = await client.query(
    `SELECT a.iata, a.name, a.city
       FROM airports a
       JOIN countries c ON c.code = a.country_code
      WHERE a.search_blob ILIKE $2 ESCAPE '\\'
         OR c.name ILIKE $2 ESCAPE '\\'
         OR c.name_en ILIKE $2 ESCAPE '\\'
      ORDER BY
        CASE
          WHEN a.iata = upper($1)                              THEN 0
          WHEN a.iata ILIKE $1 || '%'                          THEN 1
          WHEN a.city = $1 OR c.name = $1
            OR a.city_en ILIKE $1 OR c.name_en ILIKE $1        THEN 2
          WHEN a.city ILIKE $1 || '%' OR a.city_en ILIKE $1 || '%'
            OR c.name ILIKE $1 || '%' OR c.name_en ILIKE $1 || '%' THEN 3
          WHEN a.name ILIKE $1 || '%'                          THEN 4
          WHEN a.name_en ILIKE $1 || '%'                       THEN 5
          ELSE 6
        END,
        a.annual_pax_m DESC NULLS LAST,
        a.iata ASC
      LIMIT $3`,
    [term, likePattern(term), limit]
  );
  console.log(
    `"${term}" -> ${rows.map((r) => `${r.iata}(${r.city})`).join(' ') || '(no match)'}`
  );
}

const terms = process.argv.slice(2);
for (const term of terms.length ? terms : ['lon', 'pek', '伦敦', 'heathrow', 'dubai', '中国', 'jfk', '东京', 'del', 'syd']) {
  await search(term);
}

// wildcard-injection checks: these must not behave like patterns
for (const term of ['%', '_', 'lon%', '%on', 'PEK_']) {
  await search(term, 3);
}

await client.end();
