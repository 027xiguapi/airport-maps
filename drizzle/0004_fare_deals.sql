-- 0004 — fare engine tables: fare_offers, fare_price_history, fx_rates,
-- affiliate_clicks, fare_provider_runs.
--
-- Scope note: this migration contains ONLY the five new tables. The generated
-- draft also tried to CREATE "deals", "users", "sessions" and "auth_accounts",
-- because drizzle's 0000–0003 snapshots predate those tables (they were created
-- with `db:push` at the time). All four already exist in production, so those
-- statements were dropped here while `meta/0004_snapshot.json` keeps the full
-- target state — future `db:generate` runs diff against it and stay empty.
--
-- Apply with: npm run db:migrate   (back up first)
--             npm run db:push     (equivalent on this project's seed path)
CREATE TABLE "fare_offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"fingerprint" text NOT NULL,
	"origin_iata" char(3) NOT NULL,
	"destination_iata" char(3) NOT NULL,
	"destination_country" char(2) NOT NULL,
	"destination_city" text,
	"airline_code" text,
	"airline_name" text NOT NULL,
	"flight_numbers" text,
	"stops" integer DEFAULT 0 NOT NULL,
	"duration_minutes" integer,
	"price" numeric(10, 2) NOT NULL,
	"currency" char(3) NOT NULL,
	"price_usd" numeric(10, 2) NOT NULL,
	"fx_rate" numeric(12, 6) NOT NULL,
	"tax_included" boolean DEFAULT true NOT NULL,
	"cabin" text DEFAULT 'economy' NOT NULL,
	"trip_type" text DEFAULT 'oneway' NOT NULL,
	"depart_date" date NOT NULL,
	"return_date" date,
	"deep_link" text NOT NULL,
	"booking_partner" text DEFAULT 'airline' NOT NULL,
	"baseline_usd" numeric(10, 2),
	"discount_pct" integer,
	"deal_score" integer,
	"is_deal" boolean DEFAULT false NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'live' NOT NULL,
	"raw" jsonb,
	CONSTRAINT "fare_offers_provider_fingerprint_key" UNIQUE("provider","fingerprint"),
	CONSTRAINT "fare_offers_iata_upper_chk" CHECK ("fare_offers"."origin_iata" = upper("fare_offers"."origin_iata") and "fare_offers"."destination_iata" = upper("fare_offers"."destination_iata")),
	CONSTRAINT "fare_offers_currency_upper_chk" CHECK ("fare_offers"."currency" = upper("fare_offers"."currency")),
	CONSTRAINT "fare_offers_cabin_chk" CHECK ("fare_offers"."cabin" in ('economy', 'premium', 'business', 'first')),
	CONSTRAINT "fare_offers_trip_type_chk" CHECK ("fare_offers"."trip_type" in ('oneway', 'roundtrip')),
	CONSTRAINT "fare_offers_price_chk" CHECK ("fare_offers"."price_usd" > 0 and "fare_offers"."price_usd" <= 100000),
	CONSTRAINT "fare_offers_stops_chk" CHECK ("fare_offers"."stops" between 0 and 4),
	CONSTRAINT "fare_offers_status_chk" CHECK ("fare_offers"."status" in ('live', 'expired', 'hidden')),
	CONSTRAINT "fare_offers_window_chk" CHECK ("fare_offers"."return_date" is null or "fare_offers"."return_date" >= "fare_offers"."depart_date"),
	CONSTRAINT "fare_offers_link_len_chk" CHECK (char_length("fare_offers"."deep_link") <= 2000)
);
--> statement-breakpoint
CREATE TABLE "fare_price_history" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"fingerprint" text NOT NULL,
	"observed_on" date NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" char(3) NOT NULL,
	"price_usd" numeric(10, 2) NOT NULL,
	"observed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fare_price_history_key" UNIQUE("provider","fingerprint","observed_on")
);
--> statement-breakpoint
CREATE TABLE "fx_rates" (
	"currency" char(3) NOT NULL,
	"as_of" date NOT NULL,
	"usd_per_unit" numeric(14, 8) NOT NULL,
	"source" text DEFAULT 'ecb' NOT NULL,
	CONSTRAINT "fx_rates_pkey" PRIMARY KEY("currency","as_of")
);
--> statement-breakpoint
CREATE TABLE "fare_provider_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"status" text DEFAULT 'running' NOT NULL,
	"requests" integer DEFAULT 0 NOT NULL,
	"offers_seen" integer DEFAULT 0 NOT NULL,
	"offers_new" integer DEFAULT 0 NOT NULL,
	"offers_updated" integer DEFAULT 0 NOT NULL,
	"errors" integer DEFAULT 0 NOT NULL,
	"message" text
);
--> statement-breakpoint
CREATE TABLE "affiliate_clicks" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"click_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"target_kind" text NOT NULL,
	"offer_id" integer,
	"deal_id" integer,
	"provider" text,
	"partner" text,
	"origin_iata" char(3),
	"destination_iata" char(3),
	"page_path" text,
	"locale" text,
	"country_code" char(2),
	"ip_hash" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_clicks_click_id_key" UNIQUE("click_id"),
	CONSTRAINT "affiliate_clicks_target_chk" CHECK ("affiliate_clicks"."target_kind" in ('offer', 'deal')),
	CONSTRAINT "affiliate_clicks_target_ref_chk" CHECK (("affiliate_clicks"."target_kind" = 'offer' and "affiliate_clicks"."deal_id" is null)
          or ("affiliate_clicks"."target_kind" = 'deal' and "affiliate_clicks"."offer_id" is null))
);
--> statement-breakpoint
ALTER TABLE "fare_offers" ADD CONSTRAINT "fare_offers_origin_iata_airports_iata_fk" FOREIGN KEY ("origin_iata") REFERENCES "public"."airports"("iata") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_offer_id_fare_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."fare_offers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fare_offers_origin_idx" ON "fare_offers" USING btree ("origin_iata","status","price_usd");--> statement-breakpoint
CREATE INDEX "fare_offers_price_idx" ON "fare_offers" USING btree ("status","is_deal","price_usd","depart_date");--> statement-breakpoint
CREATE INDEX "fare_offers_domestic_idx" ON "fare_offers" USING btree ("destination_country","status","price_usd");--> statement-breakpoint
CREATE INDEX "fare_offers_expiry_idx" ON "fare_offers" USING btree ("status","expires_at");--> statement-breakpoint
CREATE INDEX "fare_offers_verified_idx" ON "fare_offers" USING btree ("verified_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "fare_price_history_series_idx" ON "fare_price_history" USING btree ("provider","fingerprint","observed_on" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "fare_provider_runs_idx" ON "fare_provider_runs" USING btree ("provider","started_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "affiliate_clicks_created_idx" ON "affiliate_clicks" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "affiliate_clicks_offer_idx" ON "affiliate_clicks" USING btree ("offer_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "affiliate_clicks_deal_idx" ON "affiliate_clicks" USING btree ("deal_id","created_at" DESC NULLS LAST);
