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
};

export default nextConfig;
