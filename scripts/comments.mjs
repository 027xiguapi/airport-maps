/**
 * Comment moderation CLI.
 *
 *   node scripts/comments.mjs list [--all] [--limit 30]
 *   node scripts/comments.mjs hide <id>
 *   node scripts/comments.mjs show <id>
 *   node scripts/comments.mjs delete <id>
 *
 * `hide` is the reversible option and the one to use for spam or abuse: the
 * public API only ever returns rows with status = 'visible'. `delete` is
 * permanent, so it asks for no confirmation only because the id must be typed
 * explicitly. Nothing here touches the other content tables.
 */
import pg from 'pg';
import { databaseUrl } from './_env.mjs';

const [command, ...args] = process.argv.slice(2);

function usage() {
  console.error(
    [
      'Usage:',
      '  node scripts/comments.mjs list [--all] [--limit 30]',
      '  node scripts/comments.mjs hide <id>',
      '  node scripts/comments.mjs show <id>',
      '  node scripts/comments.mjs delete <id>',
    ].join('\n')
  );
  process.exitCode = 1;
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) {
    console.error(`Invalid comment id: ${value}`);
    process.exitCode = 1;
    return null;
  }
  return id;
}

if (!['list', 'hide', 'show', 'delete'].includes(command)) {
  usage();
} else {
  const client = new pg.Client({ connectionString: databaseUrl() });
  await client.connect();

  try {
    if (command === 'list') {
      const all = args.includes('--all');
      const limitIndex = args.indexOf('--limit');
      const parsedLimit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : 30;
      const limit = Number.isSafeInteger(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 200) : 30;

      const { rows } = await client.query(
        `select id, page_kind, page_key, locale, author, body, status, created_at
           from comments
          ${all ? '' : "where status = 'visible'"}
          order by created_at desc
          limit $1`,
        [limit]
      );

      if (rows.length === 0) {
        console.log(all ? 'No comments.' : 'No visible comments (try --all).');
      } else {
        for (const row of rows) {
          const flag = row.status === 'visible' ? '' : ` [${row.status}]`;
          const stamp = row.created_at.toISOString().replace('T', ' ').slice(0, 16);
          const body = row.body.replace(/\s+/g, ' ').slice(0, 100);
          console.log(
            `#${row.id}${flag} ${stamp} ${row.page_kind}:${row.page_key} (${row.locale}) — ${row.author}\n    ${body}`
          );
        }
        console.log(`\n${rows.length} comment(s).`);
      }
    } else {
      const id = parseId(args[0]);
      if (id !== null) {
        if (command === 'delete') {
          const result = await client.query('delete from comments where id = $1', [id]);
          console.log(result.rowCount ? `Deleted #${id}.` : `No comment #${id}.`);
        } else {
          const status = command === 'hide' ? 'hidden' : 'visible';
          const result = await client.query('update comments set status = $2 where id = $1', [
            id,
            status,
          ]);
          console.log(result.rowCount ? `Comment #${id} is now ${status}.` : `No comment #${id}.`);
        }
      }
    }
  } finally {
    await client.end();
  }
}
