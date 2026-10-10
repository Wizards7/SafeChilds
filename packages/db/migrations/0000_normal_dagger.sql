CREATE TABLE "analysis_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" text NOT NULL,
	"indicator_codes" text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "helplines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" jsonb NOT NULL,
	"number" text,
	"hours" jsonb,
	"languages" text[] NOT NULL,
	"categories" text[] NOT NULL,
	"verified_by" text,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "helplines_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "listing_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"professional_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "professionals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" jsonb NOT NULL,
	"role" text NOT NULL,
	"credentials" jsonb NOT NULL,
	"languages" text[] NOT NULL,
	"city" jsonb,
	"format" text NOT NULL,
	"adolescent_services" boolean DEFAULT true NOT NULL,
	"verification_status" text DEFAULT 'demo' NOT NULL,
	"last_verified_at" timestamp with time zone,
	"contact_method" jsonb NOT NULL,
	"availability" jsonb,
	"accepting_requests" boolean DEFAULT false NOT NULL,
	"is_demo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professionals_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "listing_reports" ADD CONSTRAINT "listing_reports_professional_id_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professionals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analysis_events_created_idx" ON "analysis_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "listing_reports_professional_idx" ON "listing_reports" USING btree ("professional_id");--> statement-breakpoint
CREATE INDEX "professionals_status_city_idx" ON "professionals" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "professionals_created_idx" ON "professionals" USING btree ("created_at","id");