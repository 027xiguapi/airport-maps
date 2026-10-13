'use client';

import { useEffect, useRef } from 'react';
import { ADSTERRA_NATIVE_CONTAINER_ID, ADSTERRA_NATIVE_SRC } from '@/lib/ads';

/**
 * Adsterra native banner: their async script scans the DOM for the container
 * id below and fills it. The script is injected after mount, immediately ahead
 * of the container — the same script-then-div order as Adsterra's own snippet.
 * Nothing about the snippet supports a second container, so a page must render
 * at most one instance (each content page has exactly one slot).
 */
export default function AdsterraNative({ className }: { className?: string }) {
  const holder = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = holder.current;
    if (!container) return;

    const script = document.createElement('script');
    script.src = ADSTERRA_NATIVE_SRC;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    container.before(script);

    // Client-side navigation unmounts the page: drop the old script and the
    // creatives it injected so the next page starts from an empty container.
    return () => {
      script.remove();
      container.innerHTML = '';
    };
  }, []);

  return <div className={className} id={ADSTERRA_NATIVE_CONTAINER_ID} ref={holder} />;
}
