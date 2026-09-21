import { Icon } from '@/lib/icons';
import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
import { Card } from '@/components/ui/card';
import type { Terminal } from '@/lib/types';

/** Terminal guide: one card per terminal with gates, airlines and amenities. */
export default function TerminalsSection({
  locale,
  airportName,
  terminals,
}: {
  locale: Locale;
  airportName: string;
  terminals: Terminal[];
}) {
  const t = getMessages(locale);

  return (
    <>
      <div className="section-head" id="terminals" style={{ marginTop: 46, marginBottom: 18 }}>
        <div>
          <div className="section-kicker">{t.airport.terminalsKicker}</div>
          <h2 className="section-title">
            {t.airport.terminalsTitle}
            <span className="en">{t.airport.terminalsEn}</span>
          </h2>
          <p className="sec-sub">{t.airport.terminalsSub(airportName)}</p>
        </div>
      </div>
      <div className="mt-[26px] mb-2 flex flex-col gap-3.5">
        {terminals.map((terminal) => (
          <Card
            key={terminal.id}
            className="flex-row items-start gap-5 px-[22px] py-5 transition-[border-color,box-shadow] duration-150 hover:border-sky-400 hover:[box-shadow:var(--shadow-md)] max-[760px]:flex-wrap"
          >
            <div className="terminal-badge">{terminal.code}</div>
            <div className="terminal-main">
              <h3>{terminal.name}</h3>
              <div className="gates">
                {terminal.gateRange
                  ? t.units.gatesLabel(terminal.gateRange)
                  : t.units.gatesCount(terminal.gateCount)}
                {terminal.isSatellite && ` · ${t.units.satellite}`}
              </div>
              {terminal.airlines && (
                <div className="airlines">
                  <b>{t.units.airlinesLabel}</b>
                  {terminal.airlines}
                </div>
              )}
            </div>
            {terminal.amenities.length > 0 && (
              <div className="terminal-fac">
                {terminal.amenities.map((amenity) => (
                  <span key={`${terminal.id}-${amenity.label}`}>
                    <Icon name={amenity.icon} />
                    {amenity.label}
                  </span>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
