import { Icon, ShopIcon, TrainIcon } from '@/lib/icons';
import { transitLabel } from '@/lib/format';
import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
import { Card } from '@/components/ui/card';
import type { Amenity, TransitOption } from '@/lib/types';

/** Side-by-side ground transport and airport facilities panels. */
export default function TransitFacilities({
  locale,
  transit,
  facilities,
}: {
  locale: Locale;
  transit: TransitOption[];
  facilities: Amenity[];
}) {
  const t = getMessages(locale);

  // Directory batch airports have no transport/facility data compiled yet.
  if (transit.length === 0 && facilities.length === 0) return null;

  return (
    <div className="two-col">
      {transit.length > 0 && (
        <Card className="p-6" id="transport">
          <h3 className="mb-[18px] flex items-center gap-2.5 text-[16px] font-bold text-navy-900 dark:text-[#E9F2FA] [&>svg]:text-sky-500">
            <TrainIcon />
            {t.airport.transitTitle}
          </h3>
          <div className="transit-list">
            {transit.map((option, i) => (
              <div className="transit-row" key={`${option.icon}-${i}`}>
                <span className="transit-icon">
                  <Icon name={option.icon} />
                </span>
                <div>
                  <b>{transitLabel(locale, option)}</b>
                  {option.description && <span>{option.description}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {facilities.length > 0 && (
        <Card className="p-6" id="facilities">
          <h3 className="mb-[18px] flex items-center gap-2.5 text-[16px] font-bold text-navy-900 dark:text-[#E9F2FA] [&>svg]:text-sky-500">
            <ShopIcon />
            {t.airport.facilitiesTitle}
          </h3>
          <div className="fac-grid">
            {facilities.map((facility, i) => (
              <div className="fac-item" key={`${facility.label}-${i}`}>
                <Icon name={facility.icon} />
                <span>{facility.label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
