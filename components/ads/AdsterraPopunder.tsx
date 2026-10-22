'use client';

import { useEffect } from 'react';
import { ADSTERRA_POPUNDER_SRC, DEV_HOST } from '@/lib/ads';

const SCRIPT_ID = 'adsterra-popunder';

/**
 * The Adsterra popunder (lib/ads.ts): one script per page load, no visible
 * slot. Injected after hydration rather than written into <head> so the same
 * DEV_HOST gate as the banners keeps the dev server ad-free; the id guard
 * keeps it single-shot across effect re-runs. data-cfasync="false" is kept
 * from Adsterra's snippet — Cloudflare Rocket Loader must not rewrite it.
 * Rendered in app/[locale]/layout.tsx, so client-side navigation within a
 * locale does not re-arm it for the same view.
 */
export default function AdsterraPopunder() {
  useEffect(() => {
    if (DEV_HOST.test(window.location.hostname)) return;
    if (document.getElementById(SCRIPT_ID)) return;
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.dataset.cfasync = 'false';
    script.src = ADSTERRA_POPUNDER_SRC;
    document.body.appendChild(script);
  }, []);

  return null;
}
