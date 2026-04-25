# cdxi | OS — Product Requirements Document

## Overview
Multi-tenant, AI-native agency operating system built on FastAPI + MongoDB + React.

## Version: 2.1.0 — User Enhancements Pass

## Credentials
- Admin: parker@cdxi.au / cdxi2026!
- LLM Key: sk-emergent-c6e87046467EfE5Fe6 (already set in env)
- Stripe: sk_test_emergent (test mode, in env)

## Architecture
- Backend: FastAPI (port 8001), MongoDB
- Frontend: React (port 3000), Tailwind CSS, dark+light themes
- AI: Claude claude-sonnet-4-5-20250929 via emergentintegrations

## Modules Built (Base Phase — DONE)
- Auth & Users (JWT, RBAC: admin / account_manager / viewer)
- Enhanced CRM (clients, contacts, notes, health scoring)
- Projects (tasks, milestones, change requests)
- $$ Clock Billing (timers, usage events, rate cards, invoices)
- Contracts Engine (templates, generation, signing pipeline)
- AI Operations (6 agents, confidence scoring, review queue)
- Audit Log
- Dashboard / Control Centre

## Enhancements — Completed Feb 2026
1. **Projects Kanban view** — 5-column drag-and-drop (Draft / Active / Blocked / Review / Delivered) with HTML5 DnD; default view is Kanban; List toggle preserved.
2. **Light/Dark mode toggle** — `ThemeContext` persists to `localStorage['cdxi-theme']`; light overrides via `[data-theme="light"]` in `App.css`; toggle button in header.
3. **Iconic cdxi logo** — Google Fonts `Righteous` loaded; gradient wordmark + "OS" badge expanded; "cd" pill collapsed.
4. **Stripe invoice payment** — `POST /api/invoices/{id}/checkout` creates Stripe session; "Pay" button on Billing → Invoices for draft/sent/overdue invoices; `/payment-status` page already wired.
5. **Agent Workflow Demo (end-to-end)** — `POST /api/agents/workflow-demo` runs Chief Orchestrator → Finance → Client Success sequentially against real DB context (overdue invoice + lowest-health client), persists 3 agent runs, and returns the full chain. New "Workflow Demo" tab on `/agents` shows beautiful step-by-step pipeline with confidence, drafted comms, and escalation flags.

## Frontend Pages
- /login, / (Dashboard), /clients, /clients/:id, /projects, /billing, /contracts, /agents, /settings, /payment-status

## Tested
- Backend pytest: 7/7 PASS (`/app/backend/tests/test_enhancements.py`)
- Frontend Playwright: 5/5 PASS (login, kanban DnD persist, theme persist, Stripe URL, workflow demo full chain)

## Backlog / Future
- P1: Multi-tenant edge case audit (tenant_id propagation in all read paths)
- P2: Refactor `Projects.jsx` (403 lines) — split Kanban/List into sub-components if growing
- P2: Light-mode polish — column header colors are slightly low-contrast on light bg
- P2: Migrate HTML5 DnD → `@dnd-kit/core` if multi-touch / mobile DnD needed
- P3: Email notifications when agents escalate to review queue
- P3: Stripe webhook → auto-mark-paid (endpoint exists, needs UI confirmation when payment lands via /payment-status)
