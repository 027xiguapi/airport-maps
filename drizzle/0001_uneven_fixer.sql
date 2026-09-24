ALTER TABLE "airport_facilities" ADD COLUMN "label_tw" text;--> statement-breakpoint
ALTER TABLE "airports" ADD COLUMN "name_tw" text;--> statement-breakpoint
ALTER TABLE "airports" ADD COLUMN "city_tw" text;--> statement-breakpoint
ALTER TABLE "countries" ADD COLUMN "name_tw" text;--> statement-breakpoint
ALTER TABLE "countries" ADD COLUMN "region_tw" text;--> statement-breakpoint
ALTER TABLE "ground_transport" ADD COLUMN "name_tw" text;--> statement-breakpoint
ALTER TABLE "ground_transport" ADD COLUMN "description_tw" text;--> statement-breakpoint
ALTER TABLE "terminal_amenities" ADD COLUMN "label_tw" text;--> statement-breakpoint
ALTER TABLE "terminals" ADD COLUMN "name_tw" text;--> statement-breakpoint
ALTER TABLE "terminals" ADD COLUMN "gate_range_tw" text;--> statement-breakpoint
ALTER TABLE "terminals" ADD COLUMN "airlines_tw" text;