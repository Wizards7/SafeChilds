// Seeds the demo directory and the helpline candidates. Idempotent: upserts by slug, so a verified number
// committed in packages/directory lands on the next run. No child data is ever seeded.

import { DEMO_PROFESSIONALS, HELPLINES } from "@safechilds/directory";
import { sql } from "drizzle-orm";
import { createDb, schema } from "./client";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}
const db = createDb(url);

for (const p of DEMO_PROFESSIONALS) {
  await db
    .insert(schema.professionals)
    .values({
      slug: p.id,
      name: { ru: p.name.ru, tg: p.name.tg },
      role: p.role,
      credentials: { ru: p.credentials.ru, tg: p.credentials.tg },
      languages: p.languages,
      city: p.city ? { ru: p.city.ru, tg: p.city.tg } : null,
      format: p.format,
      adolescentServices: p.adolescentServices,
      verificationStatus: p.verificationStatus,
      lastVerifiedAt: p.lastVerifiedAt ? new Date(p.lastVerifiedAt) : null,
      contactMethod: { ru: p.contactMethod.ru, tg: p.contactMethod.tg },
      availability: p.availability,
      acceptingRequests: p.acceptingRequests,
      isDemo: p.isDemo,
    })
    .onConflictDoUpdate({
      target: schema.professionals.slug,
      set: {
        name: { ru: p.name.ru, tg: p.name.tg },
        role: p.role,
        credentials: { ru: p.credentials.ru, tg: p.credentials.tg },
        languages: p.languages,
        city: p.city ? { ru: p.city.ru, tg: p.city.tg } : null,
        format: p.format,
        adolescentServices: p.adolescentServices,
        verificationStatus: p.verificationStatus,
        lastVerifiedAt: p.lastVerifiedAt ? new Date(p.lastVerifiedAt) : null,
        contactMethod: { ru: p.contactMethod.ru, tg: p.contactMethod.tg },
        availability: p.availability,
        acceptingRequests: p.acceptingRequests,
        isDemo: p.isDemo,
        updatedAt: sql`now()`,
      },
    });
}

for (const h of HELPLINES) {
  await db
    .insert(schema.helplines)
    .values({
      slug: h.id,
      name: { ru: h.name.ru, tg: h.name.tg },
      number: h.number,
      hours: h.hours ? { ru: h.hours.ru, tg: h.hours.tg } : null,
      languages: h.languages,
      categories: h.categories,
      verifiedBy: h.verifiedBy,
      verifiedAt: h.verifiedAt ? new Date(h.verifiedAt) : null,
    })
    .onConflictDoUpdate({
      target: schema.helplines.slug,
      set: {
        name: { ru: h.name.ru, tg: h.name.tg },
        number: h.number,
        hours: h.hours ? { ru: h.hours.ru, tg: h.hours.tg } : null,
        languages: h.languages,
        categories: h.categories,
        verifiedBy: h.verifiedBy,
        verifiedAt: h.verifiedAt ? new Date(h.verifiedAt) : null,
      },
    });
}

console.log(`seeded ${DEMO_PROFESSIONALS.length} professionals, ${HELPLINES.length} helplines`);
process.exit(0);
