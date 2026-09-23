'use client';

import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from '@/lib/icons';

type Theme = 'light' | 'dark';

/** The layout's inline script sets `<html data-theme>` before paint; read it back. */
function activeTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function apply(theme: Theme, remember: boolean) {
  document.documentElement.dataset.theme = theme;
  if (remember) {
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Private browsing may refuse storage; the theme just stays session-only.
    }
  }
}

/**
 * Dark/light switch. The initial render assumes light (the SSR default) and
 * syncs to the real theme on mount, so the only possible flash is the icon.
 */
export default function ThemeToggle({ label }: { label: string }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(activeTheme());
    // With no stored choice the theme follows the OS; track live OS changes.
    const media = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      try {
        if (localStorage.getItem('theme')) return;
      } catch {
        // No storage access — treat as "no stored choice".
      }
      const next: Theme = media.matches ? 'dark' : 'light';
      apply(next, false);
      setTheme(next);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    apply(next, true);
    setTheme(next);
  };

  return (
    <button
      type="button"
      className="inline-flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[18px] border border-[#d8e4ee] bg-white text-[#5e768a] transition-[background-color,border-color] duration-150 hover:border-amber hover:bg-[#f4f8fb] hover:text-navy-900"
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-pressed={theme === 'dark'}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
