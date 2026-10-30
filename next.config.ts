import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Hosts that may load dev-only resources (/_next/hmr, /__nextjs_*) while
   * `next dev` runs. Next blocks cross-origin requests to those by default, so
   * reaching the dev server through the public domain otherwise logs
   * "Blocked cross-origin request to Next.js dev resource /_next/hmr" and hot
   * reload stops working.
   *
   * Dev-only — `next build` / `next start` ignore it. The wildcard covers www
   * and any other subdomain; localhost and the host the server was started with
   * are always allowed, so this list only needs the public domains.
   */
  allowedDevOrigins: ['worldairportmap.com', '*.worldairportmap.com'],

  /**
   * Cap the static-generation worker pool.
   *
   * `next build` forks one full Node process per worker to prerender pages, and
   * sizes that pool from the CPU count (Next's default is `cores - 1`). On a
   * high-core / low-RAM box — or one that also runs PostgreSQL and the app, as
   * this deployment does — that is enough concurrent React SSR workers to
   * exhaust memory and take the whole server down mid-build. Each worker also
   * opens its own connection pool, so the worker count multiplies the database
   * connections too (see PGPOOL_MAX in lib/db.ts).
   *
   * Pinning it decouples worker count from core count. `NEXT_BUILD_CPUS` lets an
   * operator tune it per machine without editing this file; the default is
   * deliberately small so a build can never OOM the server it runs on.
   */
  experimental: {
    cpus: Math.max(1, Number(process.env.NEXT_BUILD_CPUS ?? 2)),
  },

  turbopack: {
    /**
     * `lib/blog.ts` deliberately reads `public/blog/<slug>/<slug>.<locale>.md`
     * at build time — the article folder is the content store, not a module
     * import. Turbopack's file-tracing heuristic cannot narrow a path that is
     * assembled from a route slug, so it reports the whole project (10k+ files,
     * mostly article images) as a possible match for every request. The read is
     * bounded to `.md` files by `articleNames()`, so the warning is noise here
     * rather than an over-bundling bug.
     *
     * Suppressed by exact description + source path so unrelated diagnostics
     * from the same file are still reported.
     */
    ignoreIssue: [
      {
        path: '**/lib/blog.ts',
        description: /Overly broad patterns can lead to build performance issues/,
      },
    ],
  },
};

export default nextConfig;
