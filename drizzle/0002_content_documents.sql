CREATE TABLE "content_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"subject" text NOT NULL,
	"locale" text NOT NULL,
	"title" text,
	"summary" text,
	"updated" date,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_documents_kind_subject_locale_key" UNIQUE("kind","subject","locale"),
	CONSTRAINT "content_documents_kind_chk" CHECK ("content_documents"."kind" in ('airport', 'country', 'page'))
);
--> statement-breakpoint
CREATE INDEX "content_documents_kind_locale_idx" ON "content_documents" USING btree ("kind","locale");