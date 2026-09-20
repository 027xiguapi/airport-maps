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
    { href: '/about', label: t.nav.about },
  ];

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" href={localizedPath(locale, '/')}>
            <span className="brand-mark">
              <img src="/icon.png" alt="" width={34} height={34} />
            </span>
            <span className="brand-name">
              {t.site.nameLead}
              <em>{t.site.nameAccent}</em>
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
      <div className="mobile-bar">
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
