'use client';

import { useEffect, useState } from 'react';
import { UpIcon } from '@/lib/icons';

/** Floating "back to top" control; appears after the reader scrolls a screen. */
export default function BackToTop({ label }: { label: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`back-top${show ? ' show' : ''}`}
      aria-label={label}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <UpIcon />
    </button>
  );
}
