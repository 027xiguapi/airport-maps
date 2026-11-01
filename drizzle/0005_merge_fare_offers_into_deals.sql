-- 0005 — merge fare_offers into deals.
--
-- One table now holds every published fare, discriminated by:
--   kind = 'community' | 'official' | 'fare'
--
-- This file is hand-written. `drizzle-kit generate` needs an interactive TTY to
-- resolve the column conflicts, and this repo's de-facto schema path is
-- `db:push` (see the 0004 header: deals/users/sessions only exist because they
-- were pushed, not migrated). Apply with:
--
--   node scripts/db-apply-sql.mjs drizzle/0005_merge_fare_offers_into_deals.sql
--   npm run db:push
--
-- The fare_offers / affiliate_clicks blocks are guarded, so this is safe on a
-- database where the 0004 tables were never created (production as of
-- 2026-10-30: `fare_offers` and `affiliate_clicks` do not exist).

begin;

-- 1. Discriminator -----------------------------------------------------------
alter table deals add column if not exists kind text;
do $$
begin
  -- Only a database created before this migration has is_official.
  if exists (
    select 1
      from information_schema.columns
     where table_schema = 'public'
       and table_name = 'deals'
       and column_name = 'is_official'
  ) then
    update deals
       set kind = case when is_official then 'official' else 'community' end
     where kind is null;
  end if;
end $$;
alter table deals alter column kind set default 'community';
alter table deals alter column kind set not null;

-- 2. Columns absorbed from fare_offers --------------------------------------
alter table deals add column if not exists destination_iata char(3);
alter table deals add column if not exists destination_country char(2);
alter table deals add column if not exists destination_city text;
alter table deals add column if not exists airline_code text;
alter table deals add column if not exists flight_numbers text;
alter table deals add column if not exists stops integer;
alter table deals add column if not exists duration_minutes integer;
alter table deals add column if not exists price_usd numeric(10, 2);
alter table deals add column if not exists fx_rate numeric(12, 6);
alter table deals add column if not exists aff_url text;
alter table deals add column if not exists booking_partner text default 'airline';
alter table deals add column if not exists provider text;
alter table deals add column if not exists fingerprint text;
alter table deals add column if not exists baseline_usd numeric(10, 2);
alter table deals add column if not exists discount_pct integer;
alter table deals add column if not exists deal_score integer;
alter table deals add column if not exists is_deal boolean not null default true;
alter table deals add column if not exists first_seen_at timestamptz not null default now();
alter table deals add column if not exists last_seen_at timestamptz not null default now();
alter table deals add column if not exists verified_at timestamptz;
alter table deals add column if not exists raw jsonb;

-- 3. Relax human-only rules for machine rows --------------------------------
alter table deals alter column submitter_name drop not null;
alter table deals drop constraint if exists deals_booking_url_len_chk;
alter table deals add constraint deals_booking_url_len_chk
  check (booking_url is null or char_length(booking_url) <= 2000);
alter table deals drop constraint if exists deals_airline_len_chk;
alter table deals add constraint deals_airline_len_chk
  check (char_length(airline) between 2 and 80);
alter table deals drop constraint if exists deals_submitter_len_chk;
alter table deals add constraint deals_submitter_len_chk
  check (submitter_name is null or char_length(submitter_name) between 1 and 80);
alter table deals drop constraint if exists deals_price_chk;
alter table deals add constraint deals_price_chk
  check (price > 0 and price <= 99999999);

-- 4. New constraints and indexes --------------------------------------------
alter table deals drop constraint if exists deals_kind_chk;
alter table deals add constraint deals_kind_chk
  check (kind in ('community', 'official', 'fare'));

alter table deals drop constraint if exists deals_destination_iata_upper_chk;
alter table deals add constraint deals_destination_iata_upper_chk
  check (destination_iata is null or destination_iata = upper(destination_iata));

alter table deals drop constraint if exists deals_destination_country_upper_chk;
alter table deals add constraint deals_destination_country_upper_chk
  check (destination_country is null or destination_country = upper(destination_country));

alter table deals drop constraint if exists deals_price_usd_chk;
alter table deals add constraint deals_price_usd_chk
  check (price_usd is null or (price_usd > 0 and price_usd <= 100000));

alter table deals drop constraint if exists deals_stops_chk;
alter table deals add constraint deals_stops_chk
  check (stops is null or stops between 0 and 4);

alter table deals drop constraint if exists deals_aff_url_len_chk;
alter table deals add constraint deals_aff_url_len_chk
  check (aff_url is null or char_length(aff_url) <= 2000);

alter table deals drop constraint if exists deals_human_submitter_chk;
alter table deals add constraint deals_human_submitter_chk
  check (kind = 'fare' or submitter_name is not null);

alter table deals drop constraint if exists deals_fare_identity_chk;
alter table deals add constraint deals_fare_identity_chk
  check (
    kind <> 'fare'
    or (
      provider is not null and fingerprint is not null
      and destination_iata is not null and destination_country is not null
      and price_usd is not null and booking_url is not null
    )
  );

alter table deals drop constraint if exists deals_provider_fingerprint_key;
alter table deals add constraint deals_provider_fingerprint_key unique (provider, fingerprint);

create index if not exists deals_kind_status_idx on deals (kind, status, created_at desc);
create index if not exists deals_fare_origin_idx on deals (airport_iata, status, price_usd);
create index if not exists deals_fare_price_idx on deals (status, price_usd, travel_from);
create index if not exists deals_fare_country_idx
  on deals (destination_country, status, price_usd);
create index if not exists deals_expiry_idx on deals (status, expires_at);
create index if not exists deals_verified_idx on deals (verified_at desc nulls last);

-- 5. Copy machine fares (guarded) -------------------------------------------
do $$
begin
  if to_regclass('public.fare_offers') is not null then
    insert into deals (
      kind, airport_iata, destination, destination_iata, destination_country,
      destination_city, airline, airline_code, flight_numbers, stops,
      duration_minutes, price, currency, price_usd, fx_rate, tax_included,
      cabin, trip_type, travel_from, travel_to, booking_url, booking_partner,
      provider, fingerprint, baseline_usd, discount_pct, deal_score, is_deal,
      status, created_at, first_seen_at, last_seen_at, verified_at, expires_at, raw
    )
    select
      'fare',
      origin_iata,
      coalesce(nullif(destination_city, ''), destination_iata),
      destination_iata,
      destination_country,
      destination_city,
      airline_name,
      airline_code,
      flight_numbers,
      stops,
      duration_minutes,
      price,
      currency,
      price_usd,
      fx_rate,
      tax_included,
      cabin,
      trip_type,
      depart_date,
      return_date,
      deep_link,
      booking_partner,
      provider,
      fingerprint,
      baseline_usd,
      discount_pct,
      deal_score,
      is_deal,
      case when status = 'live' then 'visible' else 'hidden' end,
      first_seen_at,
      first_seen_at,
      last_seen_at,
      verified_at,
      expires_at,
      raw
    from fare_offers
    on conflict do nothing;
  end if;
end $$;

-- 6. Retire the old tables ---------------------------------------------------
-- affiliate_clicks has a foreign key to fare_offers and had no writer; drop it
-- first. Click attribution can return later against deals.id.
drop table if exists affiliate_clicks;
drop table if exists fare_offers;

-- 7. Drop the replaced flag --------------------------------------------------
alter table deals drop column if exists is_official;

commit;
