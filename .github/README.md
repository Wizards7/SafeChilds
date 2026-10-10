# `.github/` — CI + templates

Pipelines exist for what can actually fail today. The hackathon repo starts with two gates and adds the code gate the moment the first app has a typecheck script.

## Active workflows

| Workflow | Gate | Why now |
|---|---|---|
| [`secret-scan.yml`](./workflows/secret-scan.yml) | Gitleaks on every push/PR, full history | The repo will hold an Anthropic key and a Telegram bot token in `.env` files; one accidental commit is a leak |
| [`docs-integrity.yml`](./workflows/docs-integrity.yml) | Every relative `*.md` link resolves | Plan + app specs cross-reference each other; renames must not orphan links |

## Deferred pipelines (re-add triggers)

| Pipeline | Trigger |
|---|---|
| `checks.yml` — typecheck + lint + test + build | first app with a `typecheck` script lands (Fri 10 Oct) |
| Railway deploy on merge to `main` | first deployable app (Mon 13 Oct); Railway's GitHub integration covers it without a workflow |
| Lighthouse CI on `apps/mobile` | after the hackathon, if the PWA goes to pilot |

## Templates

- [`PULL_REQUEST_TEMPLATE.md`](./PULL_REQUEST_TEMPLATE.md) — scope + honesty checklist
- [`ISSUE_TEMPLATE/decision-needed.md`](./ISSUE_TEMPLATE/decision-needed.md) — open questions that block a build step
