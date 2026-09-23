import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/db/schema';

/**
 * Single pooled connection reused across hot reloads in development and across
 * lambdas in production. Server-side only — never import this from a client
 * component.
 */
const globalForPg = globalThis as unknown as { __airportMapsPool?: Pool };

/**
 * Build workers prerender in parallel, so each one holding a full-size pool can
 * push the server past its own `max_connections` (100 by default) — and a server
 * that closes the surplus sockets shows up here as a reset mid-query. Runtime is
 * a single process, so it keeps the full pool; `PGPOOL_MAX` overrides both.
 */
const BUILD_PHASE = process.env.NEXT_PHASE === 'phase-production-build';

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env.local and run `npm run db:reset`.'
    );
  }
  const pool = new Pool({
    connectionString,
    max: Number(process.env.PGPOOL_MAX ?? (BUILD_PHASE ? 4 : 10)),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  pool.on('error', (err) => {
    console.error('[pg] idle client error', err);
  });
  return pool;
}

export function getPool(): Pool {
  if (!globalForPg.__airportMapsPool) {
    globalForPg.__airportMapsPool = createPool();
  }
  return globalForPg.__airportMapsPool;
}

/**
 * Drizzle client over the same pool, with the schema from db/schema.ts attached
 * so `db.query.airports.findMany({ with: … })` works.
 *
 * The query helpers below stay hand-written SQL: the directory listing, the
 * ranked search and the airport detail page rely on window functions, LATERAL
 * json aggregation and `ESCAPE`-escaped ILIKE patterns that read better — and
 * stay reviewable — as SQL. Reach for `getDb()` when writing new queries that
 * do not need them.
 */
const globalForDrizzle = globalThis as unknown as {
  __airportMapsDb?: NodePgDatabase<typeof schema>;
};

export function getDb(): NodePgDatabase<typeof schema> {
  if (!globalForDrizzle.__airportMapsDb) {
    globalForDrizzle.__airportMapsDb = drizzle(getPool(), { schema });
  }
  return globalForDrizzle.__airportMapsDb;
}

/**
 * Transient failures worth retrying. Static export runs one pool per build
 * worker (11 processes × up to 10 clients each) against PostgreSQL's default
 * max_connections of 100, so connection handshakes can briefly queue past the
 * 10s connectionTimeoutMillis — and the server drops the surplus sockets, which
 * surfaces as a socket-level reset rather than a timeout. Without a retry either
 * one aborts the whole build.
 */
const TRANSIENT_DB_ERROR =
  /timeout exceeded when trying to connect|Connection terminated|Connection ended|ECONNREFUSED|ECONNRESET|EPIPE|ETIMEDOUT|socket hang up|Client has encountered a connection error|too many clients/i;

async function withRetry<T>(op: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await op();
    } catch (err) {
      lastError = err;
      if (attempt === attempts || !TRANSIENT_DB_ERROR.test((err as Error).message)) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
  throw lastError;
}

/** Runs a parameterised query and returns the typed rows. */
export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const { rows } = await withRetry(() => getPool().query<T>(text, params));
  return rows;
}

/** Runs a single-row query, or returns null when nothing matched. */
export async function queryOne<T extends QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Runs `fn` inside a transaction, rolling back on any error. */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await withRetry(() => getPool().connect());
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
