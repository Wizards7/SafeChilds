// Cursor pagination by (created_at, id). Every row carries isDemo and verificationStatus; the client labels them.

import { and, asc, eq, gt, or, sql } from "drizzle-orm";
import { schema, type Db } from "@safechilds/db";

export interface ListInput {
  lang?: "tg" | "ru" | "en" | undefined;
  format?: "online" | "in_person" | "both" | undefined;
  cursor?: string | undefined; // "<iso>|<uuid>"
  limit: number;
}

export async function listProfessionals(db: Db, input: ListInput) {
  const p = schema.professionals;
  const conds = [];
  if (input.lang) conds.push(sql`${input.lang} = any(${p.languages})`);
  if (input.format) conds.push(input.format === "both" ? sql`true` : or(eq(p.format, input.format), eq(p.format, "both")));
  if (input.cursor) {
    const [iso, id] = input.cursor.split("|");
    if (iso && id) {
      const at = new Date(iso);
      conds.push(or(gt(p.createdAt, at), and(eq(p.createdAt, at), gt(p.id, id))));
    }
  }
  const rows = await db
    .select()
    .from(p)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(asc(p.createdAt), asc(p.id))
    .limit(input.limit + 1);
  const page = rows.slice(0, input.limit);
  const last = page[page.length - 1];
  const nextCursor = rows.length > input.limit && last ? `${last.createdAt.toISOString()}|${last.id}` : null;
  return {
    items: page.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      role: r.role,
      credentials: r.credentials,
      languages: r.languages,
      city: r.city ?? null,
      format: r.format,
      adolescentServices: r.adolescentServices,
      verificationStatus: r.verificationStatus,
      lastVerifiedAt: r.lastVerifiedAt?.toISOString() ?? null,
      contactMethod: r.contactMethod,
      availability: r.availability ?? null,
      acceptingRequests: r.acceptingRequests,
      isDemo: r.isDemo,
    })),
    nextCursor,
  };
}

// Only verified rows are returned; a helpline without verified_at never reaches a screen.
export async function listVerifiedHelplines(db: Db) {
  const h = schema.helplines;
  const rows = await db.select().from(h).where(sql`${h.verifiedAt} is not null`).orderBy(asc(h.createdAt));
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    number: r.number,
    hours: r.hours ?? null,
    languages: r.languages,
    categories: r.categories,
    verifiedAt: r.verifiedAt?.toISOString() ?? null,
  }));
}
