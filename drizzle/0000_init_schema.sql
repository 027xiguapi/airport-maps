CREATE TABLE "airport_facilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"airport_iata" char(3) NOT NULL,
	"icon" text NOT NULL,
	"label" text NOT NULL,
	"label_en" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "airport_translations" (
	"airport_iata" char(3) NOT NULL,
	"locale" text NOT NULL,
	"description_md" text NOT NULL,
	CONSTRAINT "airport_translations_pkey" PRIMARY KEY("airport_iata","locale")
);
--> statement-breakpoint
CREATE TABLE "airports" (
	"iata" char(3) PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"name_en" text NOT NULL,
	"city" text NOT NULL,
	"city_en" text,
	"country_code" char(2) NOT NULL,
	"gate_count" integer DEFAULT 0 NOT NULL,
	"annual_pax_m" numeric(8, 2),
	"distance_km" numeric(6, 1),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search_blob" text DEFAULT '' NOT NULL,
	CONSTRAINT "airports_slug_key" UNIQUE("slug"),
	CONSTRAINT "airports_iata_upper_chk" CHECK ("airports"."iata" = upper("airports"."iata")),
	CONSTRAINT "airports_slug_chk" CHECK ("airports"."slug" = lower("airports"."slug"))
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"code" char(2) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_en" text NOT NULL,
	"region" text NOT NULL,
	"region_en" text NOT NULL,
	"flag_url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ground_transport" (
	"id" serial PRIMARY KEY NOT NULL,
	"airport_iata" char(3) NOT NULL,
	"icon" text NOT NULL,
	"name" text NOT NULL,
	"name_en" text,
	"description" text DEFAULT '' NOT NULL,
	"description_en" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "terminal_amenities" (
	"id" serial PRIMARY KEY NOT NULL,
	"terminal_id" integer NOT NULL,
	"icon" text NOT NULL,
	"label" text NOT NULL,
	"label_en" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "terminals" (
	"id" serial PRIMARY KEY NOT NULL,
	"airport_iata" char(3) NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"name_en" text,
	"gate_range" text,
	"gate_range_en" text,
	"gate_count" integer DEFAULT 0 NOT NULL,
	"airlines" text,
	"airlines_en" text,
	"is_satellite" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "terminals_airport_iata_code_key" UNIQUE("airport_iata","code")
);
--> statement-breakpoint
ALTER TABLE "airport_facilities" ADD CONSTRAINT "airport_facilities_airport_iata_airports_iata_fk" FOREIGN KEY ("airport_iata") REFERENCES "public"."airports"("iata") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airport_translations" ADD CONSTRAINT "airport_translations_airport_iata_airports_iata_fk" FOREIGN KEY ("airport_iata") REFERENCES "public"."airports"("iata") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airports" ADD CONSTRAINT "airports_country_code_countries_code_fk" FOREIGN KEY ("country_code") REFERENCES "public"."countries"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ground_transport" ADD CONSTRAINT "ground_transport_airport_iata_airports_iata_fk" FOREIGN KEY ("airport_iata") REFERENCES "public"."airports"("iata") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "terminal_amenities" ADD CONSTRAINT "terminal_amenities_terminal_id_terminals_id_fk" FOREIGN KEY ("terminal_id") REFERENCES "public"."terminals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "terminals" ADD CONSTRAINT "terminals_airport_iata_airports_iata_fk" FOREIGN KEY ("airport_iata") REFERENCES "public"."airports"("iata") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "airport_facilities_airport_idx" ON "airport_facilities" USING btree ("airport_iata","sort_order");--> statement-breakpoint
CREATE INDEX "airport_translations_locale_idx" ON "airport_translations" USING btree ("locale");--> statement-breakpoint
CREATE INDEX "airports_country_idx" ON "airports" USING btree ("country_code");--> statement-breakpoint
CREATE INDEX "airports_city_idx" ON "airports" USING btree ("city");--> statement-breakpoint
CREATE INDEX "airports_updated_idx" ON "airports" USING btree ("updated_at" DESC NULLS FIRST);--> statement-breakpoint
CREATE INDEX "airports_pax_idx" ON "airports" USING btree ("annual_pax_m" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "airports_slug_idx" ON "airports" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "airports_search_trgm_idx" ON "airports" USING gin ("search_blob" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "countries_name_trgm_idx" ON "countries" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "countries_name_en_trgm_idx" ON "countries" USING gin ("name_en" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "ground_transport_airport_idx" ON "ground_transport" USING btree ("airport_iata","sort_order");--> statement-breakpoint
CREATE INDEX "terminal_amenities_terminal_idx" ON "terminal_amenities" USING btree ("terminal_id","sort_order");--> statement-breakpoint
CREATE INDEX "terminals_airport_idx" ON "terminals" USING btree ("airport_iata","sort_order");