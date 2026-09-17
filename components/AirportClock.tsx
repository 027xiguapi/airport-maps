'use client';

import { useEffect, useState } from 'react';

/**
 * Live dual clock for the airport page: current time in the airport's
 * timezone next to the visitor's local time. Times are filled in after
 * mount (and re-rendered every second) so server and client HTML match.
 */
type Reading = { date: string; time: string; suffix: string };

function read(now: Date, locale: string, timeZone?: string): Reading {
  const lang = locale === 'en' ? 'en-GB' : 'zh-CN';
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
      <div className="clock-card">
        <div className="lbl">{airportLabel}</div>
        <div className="tz">{timeZone}</div>
        <div className="time">{airport?.time ?? '--:--:--'}</div>
        <div className="date">
          {airport ? `${airport.date}${airport.suffix ? ` (${airport.suffix})` : ''}` : ''}
        </div>
      </div>
      <div className="clock-card">
        <div className="lbl">{localLabel}</div>
        <div className="tz">{localZone || '—'}</div>
        <div className="time">{local?.time ?? '--:--:--'}</div>
        <div className="date">
          {local ? `${local.date}${local.suffix ? ` (${local.suffix})` : ''}` : ''}
        </div>
      </div>
    </div>
  );
}
