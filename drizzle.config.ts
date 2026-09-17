/**
 * drizzle-kit configuration for `db:push` / `db:generate` / `db:migrate` /
 * `db:studio`.
 *
 * drizzle-kit does not read `.env.local` (that name is a Next.js convention),
 * so the same minimal loader used by scripts/_env.mjs is inlined here. Keeping
 * it local means the CLI has no dependency on the Next.js runtime or on
 * dotenv.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'drizzle-kit';

/** Loads KEY=VALUE pairs from .env.local then .env; real env vars win. */
function loadEnv(root: string): void {
  for (const file of ['.env.local', '.env']) {
    const path = join(root, file);
    if (!existsSync(path)) continue;
    for (const raw of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq < 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}

const root = process.cwd();
loadEnv(root);

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env.local first.');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: './drizzle',
  dbCredentials: { url },
  // Fail loudly instead of silently generating destructive statements.
  strict: true,
  verbose: true,
});
