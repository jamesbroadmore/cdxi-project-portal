# cdxi | OS — Product Requirements Document

## Overview
Multi-tenant, AI-native agency operating system built on FastAPI + MongoDB + React.

## Version: 2.2.0 — Multi-tenant audit + Stripe settlement + Light polish

## Credentials
- Admin: parker@cdxi.au / cdxi2026!
- LLM Key: sk-emergent-c6e87046467EfE5Fe6 (in env)
- Stripe: sk_test_emergent (test mode, in env)

## Architecture
- Backend: FastAPI (port 8001), MongoDB
- Frontend: React (port 3000), Tailwind CSS, dark+light themes
- AI: Claude claude-sonnet-4-5-20250929 via emergentintegrations
- Multi-tenant: every top-level resource carries `tenant_id`; default tenant = `"default"`

## Modules
- Auth & Users (JWT, RBAC: admin / account_manager / viewer) — users now carry `tenant_id`
- Enhanced CRM (clients, contacts, notes, health scoring) — tenant scoped
- Projects (tasks, milestones, change requests) — tenant scoped
- $$ Clock Billing (timers, usage events, rate cards, invoices) — tenant scoped
- Contracts Engine — tenant scoped; templates remain global
- AI Operations (6 agents, confidence scoring, review queue) — agent_runs tenant scoped; agent defs global
- Audit Log — tenant scoped
- Dashboard / Control Centre — tenant scoped
- Stripe Payments — sessions stamped with tenant_id; settles invoice + milestone on webhook/return

## Multi-tenant audit (v2.2)
- `DEFAULT_TENANT = "default"` constant
- `tid(user)` → resolves tenant from auth user
- `tquery(user, extra?)` → builds Mongo filter scoped to tenant (with legacy backfill for docs without `tenant_id`)
- `tdoc(user, doc)` → stamps tenant_id on inserts
- Applied to all top-level lists: clients, projects, invoices, contracts, timers, usage_events, rate_cards, agent_runs, audit_log, payment_transactions, KPIs, dashboard
- Sub-resources (tasks/milestones/contacts/notes/CRs) inherit via parent_id filtering
- `_strip_mongo_id()` recursive helper sanitises audit_log before/after state (fixes Mongo ObjectId leak)

## Stripe settlement (v2.2)
- `_settle_payment(tx, user_id?)` — idempotent helper
- POST `/api/webhook/stripe` → on `payment_status=='paid'` event → calls `_settle_payment` → marks invoice paid, sets balance_due=0, paid_at, writes audit entry `invoice.paid_via_stripe`
- GET `/api/payments/status/{session_id}` → same settle path on success poll; returns `invoice_id` so frontend can route back to Billing
- Frontend `/payment-status` now redirects back to `/billing` (instead of `/`) when an invoice payment completes

## Light-mode polish (v2.2)
- Accent text colors bumped to 600/700 shades (`text-indigo-400` etc. → readable on white)
- Accent backgrounds boosted (e.g. `bg-emerald-500/10` → `#d1fae5`)
- Accent borders strengthened
- `cdxi` logo gradient adapts to light theme via `[data-cdxi-logo]` override
- Subtle box-shadow on cards

## Fresh data state (post-wipe)
- users: 1 (admin)
- agents: 6 (definitions)
- rate_cards: 1 (default $150/hr AUD)
- contract_templates: 2 (Standard SOW + MSA)
- everything else: 0

## Tested
- Backend pytest 20/20 PASS (`/app/backend/tests/test_tenant_stripe.py`)
- Coverage: fresh state, tenant stamping on 5 write paths, isolation on 5 read paths, backfill compat, Stripe checkout, _settle_payment, webhook 400 on bad sig, payments status response, workflow demo tenant stamping
- Frontend light/dark mode smoke screenshots: confirmed contrast improvements

## Backlog
- P2: Multi-tenant onboarding flow (currently single default tenant only — needs UI to create + invite users into new tenants)
- P2: Refactor `server.py` (now 2557 lines) — split auth/multi-tenant/audit/stripe into modules
- P2: Stripe webhook signature handling — distinguish bad signature (400) from upstream parse errors
- P3: `_settle_payment` milestone branch should also check if already paid
- P3: Tests retired: `test_enhancements.py` was replaced by `test_tenant_stripe.py` (more comprehensive)
- P3: Email notifications when agents escalate to review queue
- P3: Migrate HTML5 DnD → `@dnd-kit/core` for mobile/touch drag
