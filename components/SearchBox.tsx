'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { SearchIcon } from '@/lib/icons';

export type SearchLabels = {
  placeholder: string;
  ariaLabel: string;
  submit: string;
  loading: string;
  empty: string;
};

type Hit = {
  iata: string;
  name: string;
  city: string;
  countryName: string;
  flagUrl: string;
};

type Props = {
  /** `top` sits in the navy header, `hero` inside the hero panel, `mobile` in the small-screen bar. */
  variant?: 'top' | 'hero' | 'mobile';
  labels: SearchLabels;
  /** Locale prefix so result links stay inside the current language. */
  locale?: string;
  autoFocus?: boolean;
};

const API_LIMIT = 7;

/**
 * Per-variant chrome, as utilities (these used to be the `.top-search`,
 * `.mobile-bar` and `.hero-search` descendant rules in globals.css).
 *
 * `top` sits on the always-white bar, so its field uses literal light colours;
 * `mobile` sits on the page itself and keeps the theme tokens; `hero` is left to
 * the `.hero-search` rules because that panel is dark in both themes.
 */
const CHROME = {
  top: {
    root: 'relative ml-auto w-[280px] flex-none max-[1080px]:w-[210px] max-[820px]:hidden',
    input:
      'h-[38px] w-full rounded-[19px] border border-[#d8e4ee] bg-[#f4f8fb] py-0 pl-4 pr-10 text-[14px] text-[#16324b] outline-none transition-[background-color,border-color] duration-150 [font-family:inherit] placeholder:text-[#8ca2b5] focus:border-[#2e7db3] focus:bg-white focus:[box-shadow:0_0_0_3px_rgba(46,125,179,0.15)]',
    icon: 'pointer-events-none absolute right-[13px] top-[9px] text-[#5e768a] opacity-60',
  },
  mobile: {
    root: 'relative mx-auto max-w-[1240px] px-4 py-[10px]',
    input:
      'h-10 w-full rounded-[20px] border border-line bg-card py-0 pl-4 pr-10 text-[14px] text-ink outline-none [font-family:inherit] focus:border-sky-500 focus:[box-shadow:0_0_0_3px_rgba(46,125,179,0.15)]',
    icon: 'pointer-events-none absolute right-[29px] top-[19px] opacity-50',
  },
} as const;

/**
 * Airport search with live suggestions. The dropdown is fed by /api/search
 * (Postgres trigram index) in the current locale; pressing Enter without a
 * highlighted hit falls through to the server-rendered directory page.
 */
export default function SearchBox({ variant = 'top', labels, locale = 'zh', autoFocus }: Props) {
  const router = useRouter();
  const boxId = useId();
  const [term, setTerm] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isHero = variant === 'hero';

  useEffect(() => {
    const q = term.trim();
    if (!q) {
      setHits([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&limit=${API_LIMIT}&locale=${locale}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`search failed: ${res.status}`);
        const data: { results: Hit[] } = await res.json();
        setHits(data.results);
        setActive(-1);
        setOpen(true);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setHits([]);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [term, locale]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const go = (iata: string) => {
    setOpen(false);
    setTerm('');
    inputRef.current?.blur();
    router.push(`/${locale}/airport/${iata}`);
  };

  const submit = () => {
    const q = term.trim();
    if (!q) {
      inputRef.current?.focus();
      return;
    }
    setOpen(false);
    router.push(`/${locale}/airports?q=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && hits.length) {
      event.preventDefault();
      setOpen(true);
      setActive((prev) => (prev + 1) % hits.length);
    } else if (event.key === 'ArrowUp' && hits.length) {
      event.preventDefault();
      setActive((prev) => (prev <= 0 ? hits.length - 1 : prev - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (open && active >= 0 && hits[active]) go(hits[active].iata);
      else submit();
    } else if (event.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  };

  const listId = `${boxId}-list`;
  const chrome = isHero ? null : CHROME[variant];

  const input = (
    <input
      ref={inputRef}
      type="text"
      className={chrome?.input}
      value={term}
      onChange={(e) => setTerm(e.target.value)}
      onKeyDown={onKeyDown}
      onFocus={() => term.trim() && setOpen(true)}
      placeholder={labels.placeholder}
      autoComplete="off"
      autoFocus={autoFocus}
      aria-label={labels.ariaLabel}
      role="combobox"
      aria-expanded={open}
      aria-controls={listId}
      aria-autocomplete="list"
      aria-activedescendant={active >= 0 ? `${boxId}-opt-${active}` : undefined}
    />
  );

  const dropdown = open && (
    <div className={`suggest open${isHero ? ' hero-suggest' : ''}`} id={listId} role="listbox">
      {hits.length === 0 ? (
        <div className="suggest-empty">{loading ? labels.loading : labels.empty}</div>
      ) : (
        hits.map((hit, i) => (
          <div
            key={hit.iata}
            id={`${boxId}-opt-${i}`}
            role="option"
            aria-selected={i === active}
            className="suggest-item"
            style={i === active ? { background: 'var(--sky-100)' } : undefined}
            onMouseEnter={() => setActive(i)}
            onClick={() => go(hit.iata)}
          >
            <span className="iata">{hit.iata}</span>
            <div className="nm">
              <b>{hit.name}</b>
              <span>
                {hit.city} · {hit.countryName}
              </span>
            </div>
            <img className="flag" src={hit.flagUrl} alt="" width={26} height={17} loading="lazy" />
          </div>
        ))
      )}
    </div>
  );

  if (isHero) {
    return (
      <div className="hero-search" ref={rootRef}>
        {input}
        <button type="button" onClick={submit}>
          {labels.submit}
        </button>
        {dropdown}
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={CHROME.mobile.root} ref={rootRef}>
        {input}
        <SearchIcon className={CHROME.mobile.icon} />
        {dropdown}
      </div>
    );
  }

  return (
    <div className={CHROME.top.root} ref={rootRef}>
      {input}
      <SearchIcon className={CHROME.top.icon} />
      {dropdown}
    </div>
  );
}
