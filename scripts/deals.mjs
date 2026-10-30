/**
 * Deal moderation CLI.
 *
 *   node scripts/deals.mjs list [--all] [--limit 30]
 *   node scripts/deals.mjs hide <id>
 *   node scripts/deals.mjs show <id>
 *   node scripts/deals.mjs delete <id>
 *   node scripts/deals.mjs expire
 *
 * Deals publish immediately (there is no pending state by design), so this is
 * the moderation escape hatch: `hide` is reversible and pulls an offer from
 * every listing without deleting the row, `delete` is permanent. `expire` runs
 * the same cutoff the public API applies, so stale rows stop looking active in
 * the table as well.
 *
 * Users and sessions are never touched here.
 */
import pg from 'pg';
import { databaseUrl } from './_env.mjs';

const [command, ...args] = process.argv.slice(2);

function usage() {
  console.error(
    [
      'Usage:',
      '  node scripts/deals.mjs list [--all] [--limit 30]',
      '  node scripts/deals.mjs hide <id>',
      '  node scripts/deals.mjs show <id>',
      '  node scripts/deals.mjs delete <id>',
      '  node scripts/deals.mjs expire',
    ].join('\n')
  );
  process.exitCode = 1;
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) {
    console.error(`Invalid deal id: ${value}`);
    process.exitCode = 1;
    return null;
  }
  return id;
}

if (!['list', 'hide', 'show', 'delete', 'expire'].includes(command)) {
  usage();
} else {
  const client = new pg.Client({ connectionString: databaseUrl() });
  await client.connect();

  try {
    if (command === 'list') {
      const all = args.includes('--all');
      const limitIndex = args.indexOf('--limit');
      const parsedLimit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : 30;
      const limit =
        Number.isSafeInteger(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 200) : 30;

      const { rows } = await client.query(
        `select id, airport_iata, destination, airline, price, currency, status,
                submitter_name, created_at, expires_at
           from deals
          ${all ? '' : "where status = 'visible' and expires_at > now()"}
          order by created_at desc
          limit $1`,
        [limit]
      );

      if (rows.length === 0) {
        console.log(all ? 'No deals.' : 'No active deals (try --all).');
      } else {
        for (const row of rows) {
          const expired = row.expires_at.getTime() < Date.now() ? ' [expired]' : '';
          const flag = row.status === 'visible' ? '' : ` [${row.status}]`;
          const stamp = row.created_at.toISOString().replace('T', ' ').slice(0, 16);
          console.log(
            `#${row.id}${flag}${expired} ${stamp} ${row.airport_iata} → ${row.destination} · ${row.airline} · ${row.price} ${row.currency} — ${row.submitter_name} · expires ${row.expires_at
              .toISOString()
              .slice(0, 10)}`
          );
        }
        console.log(`\n${rows.length} deal(s).`);
      }
    } else if (command === 'expire') {
      const result = await client.query(
        `update deals set status = 'hidden'
          where status = 'visible' and expires_at < now()`
      );
      console.log(`Hid ${result.rowCount ?? 0} expired deal(s).`);
    } else {
      const id = parseId(args[0]);
      if (id !== null) {
        if (command === 'delete') {
          const result = await client.query('delete from deals where id = $1', [id]);
          console.log(result.rowCount ? `Deleted #${id}.` : `No deal #${id}.`);
        } else {
          const status = command === 'hide' ? 'hidden' : 'visible';
          const result = await client.query('update deals set status = $2 where id = $1', [
            id,
            status,
          ]);
          console.log(result.rowCount ? `Deal #${id} is now ${status}.` : `No deal #${id}.`);
        }
      }
    }
  } finally {
    await client.end();
  }
}
