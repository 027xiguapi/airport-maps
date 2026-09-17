import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { formatNumber } from '@/lib/format';
import { getStats } from '@/lib/queries';

export default async function Footer({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const stats = await getStats();

  const links = [
    { href: '/', label: t.nav.home },
    { href: '/airports', label: t.nav.airports },
    { href: '/countries', label: t.nav.countries },
    { href: '/about', label: t.footer.about },
    { href: '/privacy', label: t.footer.privacy },
    { href: '/terms', label: t.footer.terms },
  ];

  return (
    <footer className="footer" id="about">
      <div className="footer-inner">
        <div className="footer-cols">
          <div>
            <h4>{t.footer.mapsTitle}</h4>
            <p>{t.footer.mapsBody}</p>
          </div>
          <div>
            <h4>{t.footer.plansTitle}</h4>
            <p>{t.footer.plansBody}</p>
          </div>
          <div>
            <h4>{t.footer.transitTitle}</h4>
            <p>{t.footer.transitBody}</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="brand-name">
            {t.site.nameLead}
            <em style={{ color: 'var(--amber)', fontStyle: 'normal' }}>{t.site.nameAccent}</em>
          </span>
          {stats ? (
            <span>
              {t.footer.stats(
                formatNumber(stats.countryCount, locale),
                formatNumber(stats.airportCount, locale),
                formatNumber(stats.terminalCount, locale)
              )}
            </span>
          ) : (
            <span>{t.footer.fallback}</span>
          )}
          <span>
            © {new Date().getFullYear()} {t.site.name}
          </span>
        </div>
        <nav className="footer-links" aria-label={t.footer.linksLabel}>
          {links.map((link, i) => (
            <Link href={localizedPath(locale, link.href)} key={`${link.href}-${i}`}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
