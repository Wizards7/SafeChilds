// apps/backend/SCHEMA.md is the source of truth; this file implements it. No incidents, evidence, images, users, device keys.

import { boolean, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const professionals = pgTable(
  "professionals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(), // stable id from the seed ("demo-1")
    name: jsonb("name").$type<{ ru: string; tg: string }>().notNull(),
    role: text("role").notNull(),
    credentials: jsonb("credentials").$type<{ ru: string; tg: string }>().notNull(),
    languages: text("languages").array().notNull(),
    city: jsonb("city").$type<{ ru: string; tg: string } | null>(),
    format: text("format").notNull(),
    adolescentServices: boolean("adolescent_services").notNull().default(true),
    verificationStatus: text("verification_status").notNull().default("demo"),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    contactMethod: jsonb("contact_method").$type<{ ru: string; tg: string }>().notNull(),
    availability: jsonb("availability").$type<Record<string, [string, string]> | null>(),
    acceptingRequests: boolean("accepting_requests").notNull().default(false),
    isDemo: boolean("is_demo").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("professionals_status_city_idx").on(t.verificationStatus), index("professionals_created_idx").on(t.createdAt, t.id)],
);

export const helplines = pgTable("helplines", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: jsonb("name").$type<{ ru: string; tg: string }>().notNull(),
  number: text("number"),
  hours: jsonb("hours").$type<{ ru: string; tg: string } | null>(),
  languages: text("languages").array().notNull(),
  categories: text("categories").array().notNull(),
  verifiedBy: text("verified_by"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const listingReports = pgTable(
  "listing_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    professionalId: uuid("professional_id")
      .notNull()
      .references(() => professionals.id),
    reason: text("reason").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("listing_reports_professional_idx").on(t.professionalId)],
);

// No image, no user, no incident key. Exists so the pitch can say how many analyses ran.
export const analysisEvents = pgTable(
  "analysis_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    status: text("status").notNull(),
    indicatorCodes: text("indicator_codes").array().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("analysis_events_created_idx").on(t.createdAt)],
);
