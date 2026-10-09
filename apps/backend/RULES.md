# `apps/backend` — RULES

## Data about minors

- No table stores anything that identifies a teenager or a device. `analysis_events` holds a status and indicator codes, nothing else — no key, no IP, no image hash.
- The analyzed image exists in memory for one request. It is never written to disk, never cached, never logged, never sent anywhere except the analysis model.
- Logs contain ids and statuses only. No image bytes, no request bodies, no model prompts with image data.

## Honesty

- The model returns indicator codes from the fixed enum in `packages/analysis`, validated with Zod. Anything else from the model is a validation failure that yields status `unavailable`, not a guess.
- The status is computed by `packages/analysis` rules. This app never overrides it and never adds a number to it.

## Auth and exposure

- Every procedure is `public` or `admin`. There is no third builder and no inline check.
- `public` procedures are rate-limited per IP. `analysis.run` gets the tightest limit because it costs money per call.
- Admin session cookie: httpOnly, secure, same-site as the CRM allows. Sessions are DB-backed; no stateless JWT.
- CORS is an explicit allowlist from env. `*` never ships, not even in development.
- Errors to the client carry a code and a clean message. Stack traces and SQL stay in server logs.

## Operations

- Env is validated at boot; the process refuses to start without every variable.
- The external model call has a timeout. No retry on a non-idempotent call — one image, one attempt, and a failure is a `unavailable` status the client already handles.
- Every schema change is a committed migration. No `db push` against the Railway database.
- `readyz` depends on Postgres only. A third-party outage must never take the API out of the load balancer.
