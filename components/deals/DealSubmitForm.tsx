'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import type {
  DealCabin,
  DealErrorCode,
  DealTripType,
  PublicDeal,
} from '@/lib/deal-format';
import { formatDealPrice } from '@/lib/deal-format';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import type { AuthMessages, DealsMessages } from '@/lib/i18n/deals';
import { SearchIcon } from '@/lib/icons';

type Props = {
  locale: string;
  /** BCP 47 tag for price formatting. */
  lang: string;
  labels: DealsMessages;
  authLabels: AuthMessages;
  /** Pre-selected departure airport from `?airport=PEK`. */
  defaultAirport?: string;
  /** Login URL to return to this page (session expired mid-form). */
  signInHref: string;
};

type Hit = {
  iata: string;
  name: string;
  city: string;
  countryName: string;
  flagUrl: string;
};

type FormErrors = Partial<Record<DealErrorCode, string>>;

const ERROR_LABEL: Record<DealErrorCode, keyof DealsMessages> = {
  invalid_airport: 'airportError',
  invalid_destination: 'destinationError',
  invalid_airline: 'airlineError',
  invalid_price: 'priceError',
  invalid_currency: 'currencyError',
  invalid_cabin: 'airlineError',
  invalid_trip_type: 'airlineError',
  invalid_dates: 'dateError',
  invalid_url: 'urlError',
  invalid_notes: 'notesError',
};

const FIELD_LABEL =
  'mb-1.5 block font-display text-[11.5px] uppercase tracking-[0.14em] text-ink-faint';
const FIELD_CLASSES =
  'h-[42px] w-full rounded-[10px] border border-input bg-card px-3.5 text-[14px] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-faint focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 aria-invalid:border-destructive';
const ERROR_CLASSES = 'mt-1 text-[11.5px] leading-[1.5] text-destructive';

const CABINS: DealCabin[] = ['economy', 'premium', 'business', 'first'];
const TRIPS: DealTripType[] = ['oneway', 'roundtrip'];
const CURRENCIES = [
  'CNY', 'USD', 'EUR', 'GBP', 'JPY', 'HKD', 'TWD', 'KRW', 'SGD', 'THB',
  'AUD', 'CAD', 'MYR', 'IDR', 'INR', 'AED', 'TRY', 'CHF',
];

/** Local yyyy-mm-dd, the format the date inputs and the API use. */
function todayInputValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/**
 * The submission form. Everything is validated once on the client for fast
 * feedback and again on the server (lib/deals.ts), which is the authority.
 * Successful submissions stay on this page with a confirmation, so a
 * double-click cannot produce a second offer.
 */
export default function DealSubmitForm({
  locale,
  lang,
  labels,
  authLabels,
  defaultAirport = '',
  signInHref,
}: Props) {
  const uid = useId();
  const dealsHref = localizedPath(locale as Locale, '/deals');

  const [airportText, setAirportText] = useState(defaultAirport.toUpperCase());
  const [airportIata, setAirportIata] = useState(
    /^[A-Za-z]{3}$/.test(defaultAirport) ? defaultAirport.toUpperCase() : ''
  );
  const [airportHits, setAirportHits] = useState<Hit[]>([]);
  const [airportOpen, setAirportOpen] = useState(false);
  const airportBox = useRef<HTMLDivElement>(null);

  const [destination, setDestination] = useState('');
  const [airline, setAirline] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState(
    locale === 'zh' || locale === 'tw'
      ? 'CNY'
      : locale === 'ko'
        ? 'KRW'
        : locale === 'de' || locale === 'fr' || locale === 'it'
          ? 'EUR'
          : 'USD'
  );
  const [cabin, setCabin] = useState<DealCabin>('economy');
  const [tripType, setTripType] = useState<DealTripType>('oneway');
  const [travelFrom, setTravelFrom] = useState('');
  const [travelTo, setTravelTo] = useState('');
  const [bookingUrl, setBookingUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [website, setWebsite] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [notice, setNotice] = useState<'rate_limited' | 'sign_in' | 'generic' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<PublicDeal | null>(null);
  // Filled after mount: the server and the visitor may be in different time
  // zones, and a `min` attribute that disagrees would be a hydration mismatch.
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(todayInputValue());
  }, []);

  // Airport suggestions from the same trigram search the header uses.
  useEffect(() => {
    const term = airportText.trim();
    if (!term || airportIata) {
      setAirportHits([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(term)}&limit=6&locale=${locale}`,
          { signal: controller.signal, headers: { Accept: 'application/json' } }
        );
        if (!response.ok) return;
        const data = (await response.json()) as { results?: Hit[] };
        setAirportHits(Array.isArray(data.results) ? data.results : []);
        setAirportOpen(true);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setAirportHits([]);
      }
    }, 180);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [airportText, airportIata, locale]);

  useEffect(() => {
    if (!airportOpen) return;
    const onDown = (event: MouseEvent) => {
      if (!airportBox.current?.contains(event.target as Node)) setAirportOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [airportOpen]);

  const clearError = (code: DealErrorCode) =>
    setErrors((current) => {
      if (!current[code]) return current;
      const next = { ...current };
      delete next[code];
      return next;
    });

  function validate(): FormErrors {
    const next: FormErrors = {};
    const iata = airportIata || (/^[A-Za-z]{3}$/.test(airportText.trim()) ? airportText.trim().toUpperCase() : '');
    if (!/^[A-Z]{3}$/.test(iata)) next.invalid_airport = labels.airportError;
    if ([...destination.trim()].length < 2) next.invalid_destination = labels.destinationError;
    if ([...airline.trim()].length < 2) next.invalid_airline = labels.airlineError;
    const amount = Number(price.replace(/[,\s]/g, ''));
    if (!Number.isFinite(amount) || amount <= 0) next.invalid_price = labels.priceError;
    if (!/^[A-Za-z]{3}$/.test(currency.trim())) next.invalid_currency = labels.currencyError;
    if (travelFrom && travelTo && travelTo < travelFrom) next.invalid_dates = labels.dateError;
    if (travelFrom && travelFrom < todayInputValue()) next.invalid_dates = labels.dateError;
    if (travelTo && travelTo < todayInputValue()) next.invalid_dates = labels.dateError;
    if (bookingUrl.trim()) {
      try {
        const url = new URL(bookingUrl.trim());
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          next.invalid_url = labels.urlError;
        }
      } catch {
        next.invalid_url = labels.urlError;
      }
    } else {
      next.invalid_url = labels.urlError;
    }
    if ([...notes].length > 600) next.invalid_notes = labels.notesError;
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const found = validate();
    setErrors(found);
    setNotice(null);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          locale,
          airportIata:
            airportIata ||
            (/^[A-Za-z]{3}$/.test(airportText.trim()) ? airportText.trim().toUpperCase() : ''),
          destination,
          airline,
          price,
          currency,
          cabin,
          tripType,
          travelFrom,
          travelTo,
          bookingUrl,
          notes,
          website,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        deal?: PublicDeal | null;
        duplicate?: boolean;
        error?: DealErrorCode | 'rate_limited' | 'sign_in_required' | 'deals_unavailable';
      };

      if (response.status === 401) {
        setNotice('sign_in');
        return;
      }
      if (response.status === 429 || data.error === 'rate_limited') {
        setNotice('rate_limited');
        return;
      }
      if (!response.ok) {
        if (data.error && data.error in ERROR_LABEL) {
          const code = data.error as DealErrorCode;
          setErrors({ [code]: labels[ERROR_LABEL[code]] } as FormErrors);
        } else {
          setNotice('generic');
        }
        return;
      }

      if (data.deal) {
        setSubmitted(data.deal);
      } else {
        // Duplicate submission: the server returned the existing id instead of
        // a full row. Treat it as success and show the confirmation.
        setSubmitted({
          id: 0,
          airport: { iata: airportIata, name: '', city: '', countryCode: '', flagUrl: null },
          destination,
          destinationAlt: null,
          airline,
          price: Number(price) || 0,
          currency: currency.toUpperCase(),
          cabin,
          tripType,
          travelFrom: travelFrom || null,
          travelTo: travelTo || null,
          bookingUrl,
          notes,
          taxIncluded: true,
          isOfficial: false,
          submitterName: '',
          createdAt: new Date().toISOString(),
          expiresAt: new Date().toISOString(),
        });
      }

      // The dialog and the list are separate components; this event lets the
      // board refetch immediately so a just-posted fare appears behind the
      // confirmation without a full page reload.
      window.dispatchEvent(new Event('deals:submitted'));
    } catch {
      setNotice('generic');
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSubmitted(null);
    setDestination('');
    setAirline('');
    setPrice('');
    setTravelFrom('');
    setTravelTo('');
    setBookingUrl('');
    setNotes('');
    setErrors({});
    setNotice(null);
  }

  if (submitted) {
    return (
      <div className="border border-line bg-card p-6 [box-shadow:var(--shadow-sm)]">
        <div className="font-display text-[18px] font-bold text-sky-600">{labels.success}</div>
        <p className="mt-2 text-[14px] leading-[1.8] text-ink">
          {submitted.airport.iata} → {submitted.destination}
          {submitted.price > 0 && ` · ${formatDealPrice(submitted.price, submitted.currency, lang)}`}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            className="inline-flex items-center gap-1.5 bg-amber px-4 py-2.5 text-[13.5px] font-bold text-navy-900 transition-[filter] hover:brightness-[1.06]"
            href={dealsHref}
          >
            {labels.all}
          </Link>
          <Button type="button" variant="outline" onClick={resetForm}>
            {labels.submit}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="relative border border-line bg-card p-5 [box-shadow:var(--shadow-sm)] sm:p-6"
      onSubmit={handleSubmit}
      noValidate
    >
      <p className="text-[13px] leading-[1.75] text-ink-soft">{labels.submitNote}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {/* departure airport with live suggestions */}
        <div className="relative" ref={airportBox}>
          <label className={FIELD_LABEL} htmlFor={`${uid}-airport`}>
            {labels.from}
          </label>
          <div className="relative">
            <input
              id={`${uid}-airport`}
              className={`${FIELD_CLASSES} pr-10`}
              value={airportText}
              onChange={(event) => {
                const value = event.target.value;
                setAirportText(value);
                setAirportIata(
                  /^[A-Za-z]{3}$/.test(value.trim()) ? value.trim().toUpperCase() : ''
                );
                clearError('invalid_airport');
              }}
              onFocus={() => airportHits.length > 0 && setAirportOpen(true)}
              placeholder={labels.airportPlaceholder}
              autoComplete="off"
              role="combobox"
              aria-expanded={airportOpen}
              aria-controls={`${uid}-airport-list`}
              aria-autocomplete="list"
              aria-invalid={Boolean(errors.invalid_airport) || undefined}
              maxLength={60}
            />
            <span className="pointer-events-none absolute right-3 top-[12px] text-ink-faint">
              <SearchIcon />
            </span>
          </div>
          {airportIata && (
            <p className="mt-1 text-[11.5px] text-sky-600">{airportIata}</p>
          )}
          {airportOpen && airportHits.length > 0 && (
            <div
              id={`${uid}-airport-list`}
              className="absolute left-0 right-0 top-[70px] z-[130] max-h-[300px] overflow-y-auto border border-line bg-card [box-shadow:var(--shadow-lg)]"
              role="listbox"
            >
              {airportHits.map((hit) => (
                <button
                  key={hit.iata}
                  type="button"
                  role="option"
                  aria-selected={hit.iata === airportIata}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-sky-100"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    setAirportIata(hit.iata);
                    setAirportText(`${hit.iata} · ${hit.name}`);
                    setAirportOpen(false);
                    clearError('invalid_airport');
                  }}
                >
                  <span className="w-[44px] flex-none font-display text-[14px] font-semibold text-ink-heading">
                    {hit.iata}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ink">
                      {hit.name}
                    </span>
                    <span className="block truncate text-[11.5px] text-ink-soft">
                      {hit.city} · {hit.countryName}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
          {errors.invalid_airport && (
            <p className={ERROR_CLASSES}>{errors.invalid_airport}</p>
          )}
        </div>

        <div>
          <label className={FIELD_LABEL} htmlFor={`${uid}-destination`}>
            {labels.to}
          </label>
          <input
            id={`${uid}-destination`}
            className={FIELD_CLASSES}
            value={destination}
            onChange={(event) => {
              setDestination(event.target.value);
              clearError('invalid_destination');
            }}
            placeholder={labels.destinationPlaceholder}
            maxLength={60}
            aria-invalid={Boolean(errors.invalid_destination) || undefined}
          />
          {errors.invalid_destination && (
            <p className={ERROR_CLASSES}>{errors.invalid_destination}</p>
          )}
        </div>

        <div>
          <label className={FIELD_LABEL} htmlFor={`${uid}-airline`}>
            {labels.airline}
          </label>
          <input
            id={`${uid}-airline`}
            className={FIELD_CLASSES}
            value={airline}
            onChange={(event) => {
              setAirline(event.target.value);
              clearError('invalid_airline');
            }}
            placeholder={labels.airlinePlaceholder}
            maxLength={60}
            aria-invalid={Boolean(errors.invalid_airline) || undefined}
          />
          {errors.invalid_airline && <p className={ERROR_CLASSES}>{errors.invalid_airline}</p>}
        </div>

        <div className="grid grid-cols-[1fr_110px] gap-3">
          <div>
            <label className={FIELD_LABEL} htmlFor={`${uid}-price`}>
              {labels.price}
            </label>
            <input
              id={`${uid}-price`}
              className={FIELD_CLASSES}
              value={price}
              onChange={(event) => {
                setPrice(event.target.value);
                clearError('invalid_price');
              }}
              placeholder={labels.pricePlaceholder}
              inputMode="decimal"
              aria-invalid={Boolean(errors.invalid_price) || undefined}
            />
            {errors.invalid_price && <p className={ERROR_CLASSES}>{errors.invalid_price}</p>}
          </div>
          <div>
            <label className={FIELD_LABEL} htmlFor={`${uid}-currency`}>
              {labels.currency}
            </label>
            <input
              id={`${uid}-currency`}
              className={FIELD_CLASSES}
              value={currency}
              onChange={(event) => {
                setCurrency(event.target.value.toUpperCase().slice(0, 3));
                clearError('invalid_currency');
              }}
              placeholder={labels.currencyPlaceholder}
              list={`${uid}-currencies`}
              maxLength={3}
              aria-invalid={Boolean(errors.invalid_currency) || undefined}
            />
            <datalist id={`${uid}-currencies`}>
              {CURRENCIES.map((code) => (
                <option key={code} value={code} />
              ))}
            </datalist>
            {errors.invalid_currency && (
              <p className={ERROR_CLASSES}>{errors.invalid_currency}</p>
            )}
          </div>
        </div>

        <div>
          <label className={FIELD_LABEL} htmlFor={`${uid}-cabin`}>
            {labels.cabin}
          </label>
          <select
            id={`${uid}-cabin`}
            className={FIELD_CLASSES}
            value={cabin}
            onChange={(event) => setCabin(event.target.value as DealCabin)}
          >
            {CABINS.map((value) => (
              <option key={value} value={value}>
                {labels[value]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={FIELD_LABEL} htmlFor={`${uid}-trip`}>
            {labels.trip}
          </label>
          <select
            id={`${uid}-trip`}
            className={FIELD_CLASSES}
            value={tripType}
            onChange={(event) => setTripType(event.target.value as DealTripType)}
          >
            {TRIPS.map((value) => (
              <option key={value} value={value}>
                {value === 'oneway' ? labels.oneWay : labels.roundTrip}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={FIELD_LABEL} htmlFor={`${uid}-from`}>
            {labels.dateFromLabel}
          </label>
          <input
            id={`${uid}-from`}
            type="date"
            className={FIELD_CLASSES}
            value={travelFrom}
            min={today}
            onChange={(event) => {
              setTravelFrom(event.target.value);
              clearError('invalid_dates');
            }}
            aria-invalid={Boolean(errors.invalid_dates) || undefined}
          />
        </div>

        <div>
          <label className={FIELD_LABEL} htmlFor={`${uid}-to`}>
            {labels.dateToLabel}
          </label>
          <input
            id={`${uid}-to`}
            type="date"
            className={FIELD_CLASSES}
            value={travelTo}
            min={travelFrom || today}
            onChange={(event) => {
              setTravelTo(event.target.value);
              clearError('invalid_dates');
            }}
            aria-invalid={Boolean(errors.invalid_dates) || undefined}
          />
        </div>
        {errors.invalid_dates && (
          <p className={`${ERROR_CLASSES} sm:col-span-2`}>{errors.invalid_dates}</p>
        )}

        <div className="sm:col-span-2">
          <label className={FIELD_LABEL} htmlFor={`${uid}-booking`}>
            {labels.booking}
          </label>
          <input
            id={`${uid}-booking`}
            className={FIELD_CLASSES}
            value={bookingUrl}
            onChange={(event) => {
              setBookingUrl(event.target.value);
              clearError('invalid_url');
            }}
            placeholder={labels.bookingPlaceholder}
            type="url"
            inputMode="url"
            maxLength={600}
            aria-invalid={Boolean(errors.invalid_url) || undefined}
          />
          {errors.invalid_url && <p className={ERROR_CLASSES}>{errors.invalid_url}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={FIELD_LABEL} htmlFor={`${uid}-notes`}>
            {labels.notes}
          </label>
          <textarea
            id={`${uid}-notes`}
            className="block min-h-[92px] w-full resize-y rounded-[10px] border border-input bg-card px-3.5 py-2.5 text-[14px] leading-[1.7] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-faint focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 aria-invalid:border-destructive"
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              clearError('invalid_notes');
            }}
            placeholder={labels.notesPlaceholder}
            maxLength={600}
            rows={3}
            aria-invalid={Boolean(errors.invalid_notes) || undefined}
          />
          <div className="mt-1 flex justify-end text-[11.5px] text-ink-faint">
            <span>{notes.length}/600</span>
          </div>
          {errors.invalid_notes && <p className={ERROR_CLASSES}>{errors.invalid_notes}</p>}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? labels.submitting : labels.submit}
        </Button>
        <p className="m-0 text-[12.5px] text-destructive" role="status" aria-live="polite">
          {notice === 'rate_limited'
            ? labels.rateLimited
            : notice === 'generic'
              ? labels.genericError
              : ''}
        </p>
      </div>

      {notice === 'sign_in' && (
        <div className="mt-4 border border-dashed border-line bg-paper px-4 py-3">
          <b className="block text-[13.5px] text-ink-heading">{labels.signInTitle}</b>
          <p className="mt-1 text-[12.5px] leading-[1.7] text-ink-soft">{labels.signInBody}</p>
          <a
            className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-sky-600"
            href={signInHref}
          >
            {authLabels.signInWithGoogle}
          </a>
        </div>
      )}

      {/* Honeypot: off-screen, never focusable, must stay empty. */}
      <div className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input
          id={`${uid}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <p className="mt-4 text-[11.5px] leading-[1.7] text-ink-faint">{labels.disclaimer}</p>
    </form>
  );
}
