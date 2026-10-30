#!/usr/bin/env node
/**
 * Production build wrapper.
 *
 * `vite build` on this project bundles four environments (client references,
 * server references, RSC server, client, SSR) and V8 happily grows its heap to
 * whatever the machine allows: measured peak RSS was ~950 MB uncapped, even
 * though the build only needs ~630 MB. On the 2C/2GB production box — which
 * also runs PostgreSQL and the app itself — that headroom is what pushes the
 * build into the kernel OOM killer.
 *
 * Capping the old-space heap to 768 MB keeps peak RSS at ~630 MB (measured) and
 * still completes comfortably; V8 just collects more eagerly. Override with
 * BUILD_HEAP_MB when the box has RAM to spare (or when a future change, such as
 * enabling `vinext({ prerender: true })`, legitimately needs more).
 *
 * Usage:
 *   node scripts/build.mjs              # capped build
 *   BUILD_HEAP_MB=1024 npm run build    # larger cap
 *   npm run build:raw                   # plain `vite build`, no cap
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const heapMb = Number(process.env.BUILD_HEAP_MB ?? 768);

if (!Number.isFinite(heapMb) || heapMb < 256) {
  console.error(`[build] BUILD_HEAP_MB must be a number >= 256 (got ${process.env.BUILD_HEAP_MB})`);
  process.exit(1);
}

const existing = (process.env.NODE_OPTIONS ?? '').trim();
// Respect an explicit --max-old-space-size the operator already set.
const nodeOptions = /--max-old-space-size/.test(existing)
  ? existing
  : `${existing} --max-old-space-size=${heapMb}`.trim();

const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
if (!existsSync(viteBin)) {
  console.error(`[build] vite not found at ${viteBin} — run the package manager install first`);
  process.exit(1);
}

console.error(`[build] vite build (NODE_OPTIONS="${nodeOptions}")`);

const child = spawn(process.execPath, [viteBin, 'build', ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, NODE_OPTIONS: nodeOptions },
});

// A Ctrl-C or `systemctl stop` should stop the build, not orphan it.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

child.on('error', (error) => {
  console.error('[build] failed to start vite:', error);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    // Mirror the signal so a supervisor sees the interruption, not a plain 0.
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
