import Link from 'next/link';
import Breadcrumb, { type Crumb } from '@/components/Breadcrumb';
import { formatDate, formatNumber, formatPax, formatDistance } from '@/lib/format';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import type { AirportDetail } from '@/lib/types';

/** One cell of the header's key-facts grid. */
export type HeadFact = { num: string; label: string };

/**
 * Dark navy airport page header: breadcrumb, IATA badge + title, the E-E-A-T
 * byline (author link and freshness dates) and the key-facts grid.
 *
 * Shared with the standalone route page (/route/<IATA>), which overrides the
 * trail, the h1 and the facts to talk about routes instead of terminals while
 * keeping the same header treatment.
 */
export default function AirportHead({
  locale,
  airport,
  published,
  modified,
  trail,
  title,
  facts,
}: {
  locale: Locale;
  airport: AirportDetail;
  published?: string;
  modified?: string;
  /** Breadcrumb trail; defaults to home › airports › country › airport. */
  trail?: Crumb[];
  /** H1 text; defaults to the airport name. */
  title?: string;
  /** Key-facts cells; defaults to terminals/gates/pax/distance. */
  facts?: HeadFact[];
}) {
  const t = getMessages(locale);
  const pax = formatPax(airport.annualPaxM, locale);
  const distance = formatDistance(airport.distanceKm, locale);
  const crumbs: Crumb[] = trail ?? [
    { label: t.common.home, href: '/' },
    { label: t.nav.airports, href: '/airports' },
    { label: airport.countryName, href: `/country/${airport.countryCode}` },
    { label: airport.name },
  ];
  const cells: HeadFact[] = facts ?? [
    // Directory batch airports have no compiled counts yet; show the same
    // em-dash placeholder as pax/distance rather than "0".
    {
      num: airport.terminals.length > 0 ? formatNumber(airport.terminals.length, locale) : '—',
      label: t.units.terminalsFact,
    },
    {
      num: airport.gateCount > 0 ? formatNumber(airport.gateCount, locale) : '—',
      label: t.units.gatesFact,
    },
    { num: pax ?? '—', label: t.units.paxFull },
    { num: distance ?? '—', label: t.units.distance },
  ];

  return (
    <div className="ap-head">
      <div className="ap-head-inner">
        <Breadcrumb locale={locale} items={crumbs} />
        <div className="ap-title-row">
          <div className="ap-iata">{airport.iata}</div>
          <div className="ap-title">
            <h1>{title ?? airport.name}</h1>
            <div className="city">
              <img className="flag" src={airport.flagUrl} alt={airport.countryName} />
              <span>
                {airport.city} · {airport.countryName}
              </span>
              <span style={{ opacity: 0.55 }}>· {airport.nameEn}</span>
            </div>
          </div>
        </div>
        {/* E-E-A-T byline: visible author attribution and freshness dates. */}
        <p className="ap-byline">
          <span>
            {t.editorial.role}
            <Link href={localizedPath(locale, '/about')}>{t.editorial.authorName}</Link>
          </span>
          {published && published !== modified && (
            <>
              <span className="sep">·</span>
              <span>{t.common.publishedOn(formatDate(published, locale))}</span>
            </>
          )}
          {modified && (
            <>
              <span className="sep">·</span>
              <span>{t.common.updatedOn(formatDate(modified, locale))}</span>
            </>
          )}
        </p>
        <div className="ap-facts">
          {cells.map((cell) => (
            <div className="ap-fact" key={cell.label}>
              <div className="num">{cell.num}</div>
              <div className="lbl">{cell.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
