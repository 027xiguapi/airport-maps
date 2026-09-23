import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import MobileNav from './MobileNav';
import NavLinks from './NavLinks';
import SearchBox from './SearchBox';
import ThemeToggle from './ThemeToggle';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';

export default function Header({ locale }: { locale: Locale }) {
  const t = getMessages(locale);

  const items = [
    { href: '/', label: t.nav.home },
    { href: '/airports', label: t.nav.airports },
    { href: '/countries', label: t.nav.countries },
    { href: '/tool', label: t.nav.tools },
    { href: '/about', label: t.nav.about },
  ];

  return (
    <>
      {/* Straight utilities rather than the old `.topbar` block in globals.css.
          The bar is deliberately white in both themes, so its colours are
          literals (`bg-[rgba(255,255,255,0.97)]`, `text-navy-900`) instead of the
          flipping tokens — the previous bar was theme-independent navy in the
          same spirit. The breakpoints mirror the old media blocks: 1080px
          tightens the inline nav (in NavLinks) and 820px collapses it into the
          panel (in MobileNav). */}
      <header className="sticky top-0 z-[100] border-b border-b-[rgba(10,42,67,0.1)] bg-[rgba(255,255,255,0.97)] text-navy-900 backdrop-blur-[8px]">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-7 px-6 max-[820px]:h-14 max-[820px]:flex-nowrap max-[820px]:justify-start max-[820px]:gap-2 max-[820px]:px-3.5">
          <Link
            className="flex flex-none items-center gap-2.5 max-[820px]:mr-auto max-[820px]:min-w-0 max-[820px]:flex-[0_1_auto]"
            href={localizedPath(locale, '/')}
          >
            <span className="h-[34px] w-[34px] flex-none overflow-hidden rounded-[9px] bg-white [box-shadow:0_0_0_1px_rgba(10,42,67,0.1)_inset]">
              <img
                className="block h-full w-full object-cover"
                src="/icon.png"
                alt=""
                width={34}
                height={34}
              />
            </span>
            <span className="text-[16.5px] font-bold tracking-[0.01em] max-[820px]:min-w-0 max-[820px]:truncate max-[820px]:text-[15px]">
              {t.site.nameLead}
              <em className="not-italic text-amber">{t.site.nameAccent}</em>
            </span>
          </Link>
          <MobileNav label={t.nav.menu} navLabel={t.nav.label}>
            <NavLinks locale={locale} items={items} />
          </MobileNav>
          <SearchBox
            variant="top"
            labels={{
              placeholder: t.search.placeholder,
              ariaLabel: t.search.ariaLabel,
              submit: t.search.submit,
              loading: t.search.loading,
              empty: t.search.empty,
            }}
          />
          <ThemeToggle label={t.nav.themeToggle} />
          <LanguageSwitcher
            current={locale}
            label={t.nav.languageLabel}
            switchLabel={t.nav.switchLanguage}
          />
        </div>
      </header>
      {/* Small-screen search, hidden from 820px up where `.top-search` (inside
          SearchBox) takes over. Token-based: it sits on the page, not the bar. */}
      <div className="hidden border-b border-b-line bg-paper max-[820px]:block">
        <SearchBox
          variant="mobile"
          labels={{
            placeholder: t.search.placeholder,
            ariaLabel: t.search.ariaLabel,
            submit: t.search.submit,
            loading: t.search.loading,
            empty: t.search.empty,
          }}
        />
      </div>
    </>
  );
}
