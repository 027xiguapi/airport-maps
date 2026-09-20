import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { formatDate, formatNumber, formatPax, formatDistance } from '@/lib/format';
import { getMessages } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import type { AirportDetail } from '@/lib/types';

/**
 * Dark navy airport page header: breadcrumb, IATA badge + title, the E-E-A-T
 * byline (author link and freshness dates) and the key-facts grid.
 */
export default function AirportHead({
  locale,
  airport,
  published,
  modified,
}: {
  locale: Locale;
  airport: AirportDetail;
  published?: string;
  modified?: string;
}) {
  const t = getMessages(locale);
  const pax = formatPax(airport.annualPaxM, locale);
  const distance = formatDistance(airport.distanceKm, locale);

  return (
    <div className="ap-head">
      <div className="ap-head-inner">
        <Breadcrumb
          locale={locale}
          items={[
            { label: t.common.home, href: '/' },
            { label: t.nav.airports, href: '/airports' },
            { label: airport.countryName, href: `/country/${airport.countryCode}` },
            { label: airport.name },
          ]}
        />
        <div className="ap-title-row">
          <div className="ap-iata">{airport.iata}</div>
          <div className="ap-title">
            <h1>{airport.name}</h1>
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
          <div className="ap-fact">
            <div className="num">{formatNumber(airport.terminals.length, locale)}</div>
            <div className="lbl">{locale === 'en' ? 'Terminals' : '航站楼'}</div>
          </div>
          <div className="ap-fact">
            <div className="num">{formatNumber(airport.gateCount, locale)}</div>
            <div className="lbl">{locale === 'en' ? 'Gates' : '登机口'}</div>
          </div>
          <div className="ap-fact">
            <div className="num">{pax ?? '—'}</div>
            <div className="lbl">{t.units.paxFull}</div>
          </div>
          <div className="ap-fact">
            <div className="num">{distance ?? '—'}</div>
            <div className="lbl">{t.units.distance}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
