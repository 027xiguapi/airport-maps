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

  // Directory batch airports have no terminal data compiled yet.
  if (terminals.length === 0) return null;

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
            <div className="flex h-[74px] w-[74px] flex-none items-center justify-center rounded-[14px] bg-navy-900 font-display text-[24px] font-semibold tracking-[0.03em] text-white [box-shadow:var(--shadow-md)]">
              {terminal.code}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[16.5px] font-bold text-ink-heading">{terminal.name}</h3>
              <div className="mt-[3px] font-display text-[13px] font-medium tracking-[0.08em] text-sky-600">
                {terminal.gateRange
                  ? t.units.gatesLabel(terminal.gateRange)
                  : t.units.gatesCount(terminal.gateCount)}
                {terminal.isSatellite && ` · ${t.units.satellite}`}
              </div>
              {terminal.airlines && (
                <div className="mt-2 text-[13px] leading-[1.7] text-ink-soft">
                  <b className="font-semibold text-ink">{t.units.airlinesLabel}</b>
                  {terminal.airlines}
                </div>
              )}
            </div>
            {terminal.amenities.length > 0 && (
              // The rule is left-only: with preflight off, a plain
              // `border-dashed` leaves the other three sides at the UA's 3px
              // dashed width, which drew a box around the amenity rail. The
              // rail is also flex-none, so it would keep its max-content width
              // (every nowrap amenity chip on one line) and push the card past
              // the viewport on phones; below 760px it takes the full row and
              // wraps its chips instead.
              <div className="flex flex-none flex-col gap-2 border-l border-line pl-5 [border-left-style:dashed] max-[760px]:w-full max-[760px]:min-w-0 max-[760px]:flex-row max-[760px]:flex-wrap max-[760px]:border-l-0 max-[760px]:pl-0">
                {terminal.amenities.map((amenity) => (
                  <span
                    className="inline-flex items-center gap-[7px] whitespace-nowrap text-[12.5px] text-ink-soft [&>svg]:flex-none [&>svg]:text-sky-500"
                    key={`${terminal.id}-${amenity.label}`}
                  >
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
