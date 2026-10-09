# `apps/mobile` — SCHEMA

Two kinds of contract: what this app stores on the device, and what it consumes from the backend. It owns the first and only reads the second — the backend's `SCHEMA.md` wins on any conflict.

## On-device incident record (IndexedDB)

One record. The app is single-incident for the hackathon.

```
Incident
  incidentKey     string   random, generated on first use, never sent anywhere, never in a URL
  locale          "ru" | "tg"
  situation       "fake-photo" | "fake-video" | "impersonation" | "threats" | "harassment" | "unknown"
  platform        "instagram" | "tiktok" | "telegram" | "vk" | null
  safetyAnswer    "safe" | "threatened" | "unsure" | "urgent" | null
  feeling         one of the eight feelings | null
  analysis        { status, indicatorCodes[], at } | null       the result as returned; no image
  evidence        Evidence[]
  steps           { stepId: string, done: boolean, at: string }[]
  createdAt, updatedAt   ISO strings, UTC
```

```
Evidence
  id              string
  kind            "url" | "screenshot" | "note"
  value           string for url/note; Blob for screenshot (stored in IndexedDB, never uploaded)
  createdAt       ISO string
```

Deleting the incident deletes every row above. There is no soft delete.

## Backend contracts consumed (tRPC, typed from `apps/backend`)

| Procedure | Input | Output |
|---|---|---|
| `analysis.run` | multipart image (type + size validated again on the server) | `{ status, indicatorCodes, limitations }` |
| `directory.list` | `{ lang?, city?, format?, cursor? }` | `{ items: Professional[], nextCursor }` with `isDemo` on every row |
| `reports.create` | `{ professionalId, reason }` | `{ ok: true }` |

The app never constructs these shapes by hand; types come from the backend's exported `AppRouter`.

## Local-only enums owned by `packages/guidance`

Situations, safety answers, feelings, platforms and step ids are defined once in `packages/guidance` and imported here and in `apps/bot`. This file lists them for readers; the package is the source.
