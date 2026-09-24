'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

/**
 * Live dual clock for the airport page: current time in the airport's
 * timezone next to the visitor's local time. Times are filled in after
 * mount (and re-rendered every second) so server and client HTML match.
 */
type Reading = { date: string; time: string; suffix: string };

function read(now: Date, locale: string, timeZone?: string): Reading {
  const lang = locale === 'en' ? 'en-GB' : locale === 'tw' ? 'zh-TW' : 'zh-CN';
  const opts = { timeZone } as Intl.DateTimeFormatOptions;
  return {
    date: new Intl.DateTimeFormat(lang, {
      ...opts,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now),
    time: new Intl.DateTimeFormat(lang, {
      ...opts,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now),
    // 12-hour form ("09:48:10 AM") shown as a secondary line, English only.
    suffix:
      locale === 'en'
        ? new Intl.DateTimeFormat(lang, {
            ...opts,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          }).format(now)
        : '',
  };
}

export default function AirportClock({
  locale,
  timeZone,
  airportLabel,
  localLabel,
}: {
  locale: string;
  timeZone: string;
  airportLabel: string;
  localLabel: string;
}) {
  const [airport, setAirport] = useState<Reading | null>(null);
  const [local, setLocal] = useState<Reading | null>(null);
  const [localZone, setLocalZone] = useState('');

  useEffect(() => {
    setLocalZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const tick = () => {
      const now = new Date();
      setAirport(read(now, locale, timeZone));
      setLocal(read(now, locale));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [locale, timeZone]);

  return (
    <div className="clock-grid">
      <Card className="px-[22px] py-[18px]">
        <div className="font-display text-[11.5px] uppercase tracking-[0.14em] text-ink-faint">
          {airportLabel}
        </div>
        <div className="mt-0.5 text-[12.5px] text-ink-soft">{timeZone}</div>
        <div className="mt-2 font-display text-[36px] font-semibold leading-[1.15] text-navy-800 [font-variant-numeric:tabular-nums]">
          {airport?.time ?? '--:--:--'}
        </div>
        <div className="mt-1 text-[13px] text-ink-soft [font-variant-numeric:tabular-nums]">
          {airport ? `${airport.date}${airport.suffix ? ` (${airport.suffix})` : ''}` : ''}
        </div>
      </Card>
      <Card className="px-[22px] py-[18px]">
        <div className="font-display text-[11.5px] uppercase tracking-[0.14em] text-ink-faint">
          {localLabel}
        </div>
        <div className="mt-0.5 text-[12.5px] text-ink-soft">{localZone || '—'}</div>
        <div className="mt-2 font-display text-[36px] font-semibold leading-[1.15] text-navy-800 [font-variant-numeric:tabular-nums]">
          {local?.time ?? '--:--:--'}
        </div>
        <div className="mt-1 text-[13px] text-ink-soft [font-variant-numeric:tabular-nums]">
          {local ? `${local.date}${local.suffix ? ` (${local.suffix})` : ''}` : ''}
        </div>
      </Card>
    </div>
  );
}
