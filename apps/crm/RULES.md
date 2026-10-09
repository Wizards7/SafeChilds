# `apps/crm` — RULES

## Verification honesty

- `verified` means a named team member checked the credentials, the contact method, that the service is operating, and that it accepts adolescents — on the date in `last_verified_at`. Nothing less.
- During the hackathon every row is `demo` with `is_demo = true`. Flipping a row to `verified` for the demo is forbidden; the demo banner in the product is the point.
- A listing report is never dismissed silently. "Mark handled" is the only action and it leaves the report in the list.

## Nothing about teenagers

- This app never requests, renders or links to incident data, analysis events or anything derived from a user session. If a procedure that returns such data is ever added to the backend, this app does not call it.

## Access

- Hiding a page is not authorization. The backend enforces `admin`; this app only decides what to show.
- No session material in localStorage or sessionStorage. Cookie from the backend, or an in-memory token for the tab.
- PII of professionals (phone, email) is shown masked in the list and in full only on the edit page.

## Forms

- Every invalid field shows its own error under the field. A summary at the top is allowed only as an extra that links to the field.
- Buttons disable during submit; no double-create.
- Destructive or status-changing actions (set `verified`, mark handled) confirm first.
