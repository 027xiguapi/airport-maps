CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_kind" text NOT NULL,
	"page_key" text NOT NULL,
	"locale" text NOT NULL,
	"author" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'visible' NOT NULL,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comments_page_kind_chk" CHECK ("comments"."page_kind" in ('airport', 'country', 'blog', 'page')),
	CONSTRAINT "comments_status_chk" CHECK ("comments"."status" in ('visible', 'hidden')),
	CONSTRAINT "comments_author_len_chk" CHECK (char_length("comments"."author") between 1 and 40),
	CONSTRAINT "comments_body_len_chk" CHECK (char_length("comments"."body") between 1 and 2000)
);
--> statement-breakpoint
CREATE INDEX "comments_thread_idx" ON "comments" USING btree ("page_kind","page_key","locale","status","created_at");--> statement-breakpoint
CREATE INDEX "comments_ip_idx" ON "comments" USING btree ("ip_hash","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "comments_created_idx" ON "comments" USING btree ("created_at" DESC NULLS LAST);