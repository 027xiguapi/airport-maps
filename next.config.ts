import type { NextConfig } from "next";

/**
 * Vinext reads this file as well as Vite, and honours `allowedDevOrigins`.
 *
 * The file used to carry two Next-only build switches, dropped when the project
 * moved to Vinext:
 *
 *  - `experimental.cpus` capped Next's per-worker prerender pool. `vite build`
 *    runs in a single process and only prerenders when asked to, so there is no
 *    worker pool to size.
 *  - `turbopack.ignoreIssue` silenced a Turbopack file-tracing warning.
 *    Vinext bundles with Vite/Rolldown, which has no equivalent diagnostic.
 */
const nextConfig: NextConfig = {
  /**
   * Hosts that may load dev-only resources (Vite's HMR client, /@vite/*) while
   * `vite dev` runs behind the public domain. Dev-only — production ignores it.
   * The wildcard covers www and any other subdomain; localhost and the host the
   * server was started with are always allowed.
   */
  allowedDevOrigins: ['worldairportmap.com', '*.worldairportmap.com'],
};

export default nextConfig;
