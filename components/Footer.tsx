import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { formatNumber } from '@/lib/format';
import { getStats } from '@/lib/queries';

/** The three intro columns share one type treatment, so it is written once. */
const COL_TITLE_CLASSES =
  'mb-3.5 font-display text-[13px] font-semibold uppercase tracking-[0.2em] text-amber';
const COL_BODY_CLASSES = 'text-[13.5px] leading-[1.8] text-white/62';
const LINK_CLASSES =
  'text-[13.5px] text-white/72 transition-[color] duration-[140ms] hover:text-amber';

/**
 * Site footer: three intro columns, the brand line with the live counts, and the
 * link row. Like the header (components/Header.tsx) it is styled entirely with
 * utility classes — the footer stays navy in both themes, hence the fixed
 * navy-950 background and white-alpha text rather than the semantic tokens.
 */
export default async function Footer({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const stats = await getStats();

  const links = [
    { href: '/', label: t.nav.home },
    { href: '/airports', label: t.nav.airports },
    { href: '/countries', label: t.nav.countries },
    { href: '/about', label: t.footer.about },
    { href: '/contact', label: t.footer.contact },
    { href: '/privacy', label: t.footer.privacy },
    { href: '/terms', label: t.footer.terms },
  ];

  return (
    <footer className="mt-[72px] bg-navy-950 text-white/78" id="about">
      <div className="mx-auto max-w-[1240px] px-6 pb-[30px] pt-[52px]">
        <div className="mb-9 grid grid-cols-3 gap-9 max-[760px]:grid-cols-1 max-[760px]:gap-6">
          <div>
            <h4 className={COL_TITLE_CLASSES}>{t.footer.mapsTitle}</h4>
            <p className={COL_BODY_CLASSES}>{t.footer.mapsBody}</p>
          </div>
          <div>
            <h4 className={COL_TITLE_CLASSES}>{t.footer.plansTitle}</h4>
            <p className={COL_BODY_CLASSES}>{t.footer.plansBody}</p>
          </div>
          <div>
            <h4 className={COL_TITLE_CLASSES}>{t.footer.transitTitle}</h4>
            <p className={COL_BODY_CLASSES}>{t.footer.transitBody}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-t-white/10 pt-[22px] text-[12.5px] text-white/45">
          <span className="text-[14px] font-bold tracking-[0.01em]">
            {t.site.nameLead}
            <em className="not-italic text-amber">{t.site.nameAccent}</em>
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
        <nav
          className="mt-[22px] flex flex-wrap gap-x-[22px] gap-y-2 border-t border-t-white/10 pt-5"
          aria-label={t.footer.linksLabel}
        >
          {links.map((link, i) => (
            <Link
              className={LINK_CLASSES}
              href={localizedPath(locale, link.href)}
              key={`${link.href}-${i}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
