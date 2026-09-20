import { Icon, ShopIcon, TrainIcon } from '@/lib/icons';
import { transitLabel } from '@/lib/format';
import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
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

  return (
    <div className="two-col">
      <div className="info-panel" id="transport">
        <h3>
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
      </div>
      <div className="info-panel" id="facilities">
        <h3>
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
      </div>
    </div>
  );
}
