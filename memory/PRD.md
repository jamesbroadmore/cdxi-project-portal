# cdxi | OS — Product Requirements Document

## Overview
Multi-tenant, AI-native agency operating system built on FastAPI + MongoDB + React.

## Version: 2.0.0 — Full Platform Build

## Credentials
- Admin: parker@cdxi.au / cdxi2026!
- LLM Key: sk-emergent-c6e87046467EfE5Fe6

## Architecture
- Backend: FastAPI (port 8001), MongoDB
- Frontend: React (port 3000), Tailwind CSS dark theme
- AI: Claude claude-sonnet-4-5-20250929 via emergentintegrations

## Modules Built

### 1. Authentication & Users
- JWT auth, roles: admin / account_manager / viewer
- Multi-user support

### 2. CRM
- Enhanced clients: health_score, lifecycle_stage, billing_model, tags
- Contacts (per client)
- Notes (with types: general, meeting, call, email, risk, opportunity)
- Real-time health score calculation

### 3. Projects
- Enhanced projects: project_type, risk_level, budget, start/target dates
- Tasks with priorities, status pipeline, billable flags
- Milestones with payment tracking
- Change requests with approval workflow

### 4. $$ Clock Billing Engine
- Timer start/stop with auto-calculation
- Usage events from timers
- Rate cards (default + per-client)
- Invoice generation from usage events
- Invoice lifecycle: draft → review → sent → paid/overdue

### 5. Contracts Engine
- Contract templates with variable substitution
- Contract generation with rendering
- Status pipeline: draft → review → sent → signed → active
- Seeded: Standard SOW, Master Service Agreement

### 6. AI Operations
- 6 agents: Chief Orchestrator, Finance, Client Success, Delivery Ops, Revenue Ops, Compliance Sentinel
- Confidence scoring (auto-execute ≥ 0.85, escalate < 0.85)
- Human review queue
- Full run history with JSON output

### 7. Audit Log
- Immutable event trail for all key operations

### 8. Dashboard
- KPI cards, activity feed, health distribution, agent runs
- Revenue pipeline, overdue AR, active timers

## Frontend Pages
- /login — Dark modernized login
- / — Control Centre dashboard
- /clients — CRM list with health scores
- /clients/:id — Detail with tabs (Overview, Contacts, Notes, Projects, Billing)
- /projects — Project list with risk levels
- /billing — $$ Clock (timers, usage events, invoices, rate cards)
- /contracts — Contracts + templates
- /agents — AI Ops hub (agents, review queue, run history)
- /settings — Users, rate cards, audit log

## Design System
- Background: zinc-950 (#09090B)
- Surface: zinc-900 (#18181B)
- Borders: zinc-800 (#27272A)
- Accent: indigo-500 (#6366F1)
- Sidebar: fixed 56px collapsed / 224px expanded
