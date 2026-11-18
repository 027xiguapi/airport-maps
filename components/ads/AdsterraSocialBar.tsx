'use client';

import { useEffect } from 'react';
import { ADSTERRA_SOCIAL_BAR_SRC, DEV_HOST } from '@/lib/ads';

/**
 * Adsterra Social Bar — a site-level script (/14/ path), loaded once per
 * document rather than per slot. The locale layout persists across
 * client-side navigations, so the script tag is injected on mount and the id
 * guard keeps any remount from double-loading it. `data-cfasync="false"`
 * stops Cloudflare Rocket Loader from deferring it; DEV_HOST (lib/ads.ts)
 * keeps dev hosts ad-free.
 */
export default function AdsterraSocialBar() {
  useEffect(() => {
    if (DEV_HOST.test(window.location.hostname)) return;
    if (document.getElementById('adsterra-social-bar')) return;
    const script = document.createElement('script');
    script.id = 'adsterra-social-bar';
    script.src = ADSTERRA_SOCIAL_BAR_SRC;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    document.body.appendChild(script);
  }, []);
  return null;
}
