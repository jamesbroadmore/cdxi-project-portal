# cdxi | OS — Product Requirements Document

## Overview
Multi-tenant, AI-native agency operating system built on FastAPI + MongoDB + React.

## Version: 2.3.0 — Multi-tenant onboarding + reseed CLI + Stripe error polish

## Credentials
- Admin: parker@cdxi.au / **220191** (rotated)
- LLM Key: sk-emergent-c6e87046467EfE5Fe6 (in env)
- Stripe: sk_test_emergent (test mode, in env)

## Architecture
- Backend: FastAPI (port 8001), MongoDB
- Frontend: React (port 3000), Tailwind CSS, dark+light themes
- AI: Claude claude-sonnet-4-5-20250929 via emergentintegrations
- Multi-tenant: every top-level resource carries `tenant_id`; default tenant `"default"`; admins can create + switch tenants

## Modules
- Auth & Users (JWT, RBAC: admin / account_manager / viewer) — users carry `tenant_id`
- **Tenants** (new): `tenants` collection, CRUD endpoints, switcher UI
- Enhanced CRM (clients, contacts, notes, health scoring)
- Projects (Kanban + list, drag-and-drop)
- $$ Clock Billing (timers, usage events, rate cards, invoices)
- Contracts Engine
- AI Operations (6 agents, workflow demo)
- Audit Log
- Dashboard / Control Centre

## New in v2.3

### Multi-tenant onboarding
- `tenants` Mongo collection with unique `id`+`slug` indexes
- Auto-seeded `default` tenant on startup
- Endpoints:
  - `GET /api/tenants` — admins see all, others see own
  - `POST /api/tenants` (admin) — auto-slug from name, duplicates rejected
  - `PATCH /api/tenants/{slug}` (admin) — name/status updates
  - `POST /api/tenants/{slug}/switch` (admin) — moves user's `tenant_id`; existing JWT remains valid (tenant resolved from user record per-request)
- Frontend:
  - **TenantSwitcher** dropdown in header — shows current tenant, list of all, checkmark on active, "Manage tenants →" deep-link
  - **Settings → Tenants tab** — table view + New Tenant modal
  - Auto-reload on switch so all data reflects the new tenant scope

### Reseed CLI
- `/app/backend/scripts/reseed.py`
- Flags: `--wipe`, `--wipe-only`, `--tenant SLUG`
- Idempotent (skips if data already exists for tenant)
- Requires `MONGO_URL` + `DB_NAME` env vars (fail-fast, no silent defaults)
- Seeds: 2 demo clients, 2 projects, 6 milestones, 1 overdue invoice (INV-DEMO-001)

### Stripe webhook errors
- Distinct 400 responses: missing signature header / signature verification failure / payload parse error
- Helps debug live webhook delivery vs malicious requests

### Admin password rotation
- `_seed_admin` now re-hashes the password from `ADMIN_PASSWORD` env on every startup if the existing hash doesn't match → env is the source of truth

### Code cleanup
- Removed dead `_seed_example_data` (replaced by reseed CLI)
- `DEFAULT_TENANT` constant, `tid()` / `tquery()` / `tdoc()` helpers
- `_strip_mongo_id()` recursive sanitiser for audit logs

## Tested
- Backend pytest 39/39 PASS (2 files: test_tenant_stripe.py + test_tenants_v2.py)
- Coverage: tenant CRUD + isolation + switch round-trip, Stripe checkout + webhook signature/parse error branches, _settle_payment, password rotation, reseed CLI (wipe/seed/idempotent)
- Frontend smoke: tenant switcher dropdown, Settings → Tenants tab, New Tenant modal all render cleanly in both themes

## Backlog / Future
- P2: Server.py is now 2607 lines. Clean extraction seams identified: tenants (2225-2298), Stripe (2320-2461), seeds (2487-2605). Skipped due to risk/reward; revisit when adding more endpoints.
- P3: `_slugify` doesn't normalise unicode (e.g. accented characters preserved); consider `unicodedata.normalize('NFKD')` if international tenants planned
- P3: Webhook parse-error detail leaks exception class name — fine for dev, replace with generic message for prod
- P3: Tenant invite flow (admin emails an invite link → invitee accepts → user record created with `tenant_id` pre-populated)
- P3: Per-tenant rate-card scoping (currently default rate card is global)
- P3: Email notifications when agents escalate to review queue
- P3: Migrate HTML5 DnD → `@dnd-kit/core` for mobile/touch drag
- P3: Stripe webhook → `_settle_payment` already idempotent for invoices; double-check the milestone branch when an invoice is partially associated with milestones
