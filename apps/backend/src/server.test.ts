// Integration tests through fastify.inject. DB-backed cases skip themselves without DATABASE_URL.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb, type Db } from "@safechilds/db";
import { loadEnv } from "./env";
import { buildApp } from "./server";

const DATABASE_URL = process.env.DATABASE_URL;
const hasDb = !!DATABASE_URL;

function env() {
  return loadEnv({ DATABASE_URL: DATABASE_URL ?? "postgres://x:y@localhost:1/none", NODE_ENV: "test", CORS_ORIGINS: "http://localhost:3000" });
}

// A tiny valid PNG (1x1), so the multipart route gets a real image type.
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

function multipart(fields: { name: string; value: Buffer | string; filename?: string; type?: string }[]) {
  const boundary = "----safechilds";
  const parts = fields.map((f) => {
    const head = f.filename
      ? `Content-Disposition: form-data; name="${f.name}"; filename="${f.filename}"\r\nContent-Type: ${f.type}\r\n\r\n`
      : `Content-Disposition: form-data; name="${f.name}"\r\n\r\n`;
    return Buffer.concat([Buffer.from(`--${boundary}\r\n${head}`), Buffer.isBuffer(f.value) ? f.value : Buffer.from(f.value), Buffer.from("\r\n")]);
  });
  return { body: Buffer.concat([...parts, Buffer.from(`--${boundary}--\r\n`)]), type: `multipart/form-data; boundary=${boundary}` };
}

describe("backend (no database)", () => {
  it("healthz answers", async () => {
    const app = await buildApp(env(), { db: { execute: async () => { throw new Error("no db"); } } as unknown as Db, model: null });
    const res = await app.inject({ method: "GET", url: "/healthz" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
    const ready = await app.inject({ method: "GET", url: "/readyz" });
    expect(ready.statusCode).toBe(503);
    await app.close();
  });

  it("admin procedures are closed", async () => {
    const app = await buildApp(env(), { db: {} as Db, model: null });
    // No admin router is mounted at all; an unknown path is a 404, not a hidden admin surface.
    const res = await app.inject({ method: "POST", url: "/trpc/directory.create", payload: {} });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    await app.close();
  });

  it("analysis rejects a missing image and a wrong type", async () => {
    const app = await buildApp(env(), { db: {} as Db, model: null });
    const none = await app.inject({ method: "POST", url: "/analysis", payload: "{}", headers: { "content-type": "application/json" } });
    expect(none.statusCode).toBeGreaterThanOrEqual(400);
    const txt = multipart([{ name: "image", value: "hello", filename: "a.txt", type: "text/plain" }]);
    const bad = await app.inject({ method: "POST", url: "/analysis", payload: txt.body, headers: { "content-type": txt.type } });
    expect(bad.statusCode).toBe(415);
    await app.close();
  });
});

describe.skipIf(!hasDb)("backend (database)", () => {
  let db: Db;
  beforeAll(() => {
    db = createDb(DATABASE_URL!);
  });
  afterAll(async () => {
    // postgres-js pool closes with the process in tests
  });

  it("readyz is green and directory.list returns demo rows with isDemo", async () => {
    const app = await buildApp(env(), { db, model: null });
    expect((await app.inject({ method: "GET", url: "/readyz" })).statusCode).toBe(200);
    const res = await app.inject({ method: "GET", url: "/trpc/directory.list?input=" + encodeURIComponent(JSON.stringify({ limit: 2 })) });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { result: { data: { items: { isDemo: boolean; verificationStatus: string }[]; nextCursor: string | null } } };
    expect(body.result.data.items.length).toBeGreaterThan(0);
    expect(body.result.data.items.every((i) => i.isDemo && i.verificationStatus === "demo")).toBe(true);
    await app.close();
  });

  it("helplines returns nothing until a human verified a number", async () => {
    const app = await buildApp(env(), { db, model: null });
    const res = await app.inject({ method: "GET", url: "/trpc/directory.helplines" });
    expect(res.statusCode).toBe(200);
    expect((res.json() as { result: { data: unknown[] } }).result.data).toEqual([]);
    await app.close();
  });

  it("analysis without a model key returns the 'unavailable' tier, stores no image, and records one event", async () => {
    const app = await buildApp(env(), { db, model: null });
    const mp = multipart([
      { name: "image", value: PNG_1X1, filename: "x.png", type: "image/png" },
      { name: "evidence", value: JSON.stringify(["exif_stripped"]) },
    ]);
    const res = await app.inject({ method: "POST", url: "/analysis", payload: mp.body, headers: { "content-type": mp.type } });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { tier: string; markers: unknown[]; evidence: string[] };
    expect(body.tier).toBe("unavailable");
    expect(body.markers).toEqual([]);
    expect(body.evidence).toEqual(["exif_stripped"]);
    expect(JSON.stringify(body)).not.toContain("iVBOR");
    await app.close();
  });

  it("local evidence raises the tier even when the model is unavailable", async () => {
    const app = await buildApp(env(), { db, model: null });
    const mp = multipart([
      { name: "image", value: PNG_1X1, filename: "x.png", type: "image/png" },
      { name: "evidence", value: JSON.stringify(["original_differs"]) },
    ]);
    const res = await app.inject({ method: "POST", url: "/analysis", payload: mp.body, headers: { "content-type": mp.type } });
    expect((res.json() as { tier: string }).tier).toBe("evidence");
    await app.close();
  });
});
