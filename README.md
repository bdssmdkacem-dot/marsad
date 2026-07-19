# مرصد المواطن المغربي — Marsad

Independent, non-partisan civic transparency platform for Morocco.

## Stack
Next.js 14 (App Router, TS) · Tailwind CSS · Prisma + PostgreSQL · Auth.js · Leaflet · Cloudflare R2

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, AUTH_SECRET, R2 credentials
npx auth secret         # generates AUTH_SECRET into .env

npm run db:migrate      # runs `prisma migrate dev`, creates tables
npm run db:seed         # seeds regions, an admin user, and sample data

npm run dev
```

Default seeded admin login: `admin@marsad.ma` / `ChangeMe123!` — change this immediately outside local dev.

## Project structure

```
src/app/(public)/...      → public pages (promises, projects, requests, reports, surveys, open-data, about)
src/app/(admin)/admin/... → admin panel (dashboard, moderation, users, audit logs)
src/app/api/v1/...        → public read-only open-data API (rate-limited)
src/app/api/admin/...     → protected admin mutation endpoints
src/lib/                  → prisma client, auth config, RBAC (permissions.ts), rate limiter
prisma/schema.prisma      → full data model (17 models)
prisma/seed.ts            → seed data for local development
```

## Implemented in this scaffold
- Full Prisma schema (Users/Roles, Parties, Promises + audit-trailed PromiseUpdates, Projects, CitizenRequests, Reports, Surveys, Regions/Municipalities, Notifications, AuditLogs)
- Arabic RTL root layout with Noto Kufi Arabic font
- Live transparency dashboard (home page) pulling real counts via Prisma
- **مرصد الوعود**: promises listing with status filters
- **مرصد المشاريع**: interactive Leaflet map + list, filterable by region, progress bars, budget formatted in MAD
- **مطالب المواطنين**: public listing (approved/under review/resolved only — pending stays internal), category filters, upvote/support button; submission form at `/requests/new` with category select, region select, and an optional click-to-pin Leaflet location picker, backed by a rate-limited server action (5 submissions / 10 min / IP)
- **مركز التقارير**: search + category filter, file download links
- **استطلاعات الرأي**: listing + detail page with multiple-choice or free-text questions; anonymous responses deduplicated via a hashed, non-PII cookie token (`lib/anonymous-id.ts`) rather than user accounts
- Public rate-limited `/api/v1/promises` open-data endpoint with pagination
- Auth.js credentials provider with role-aware JWT sessions
- `middleware.ts` protecting `/admin/*` and `/api/admin/*` by role
- RBAC helper (`lib/permissions.ts`) — always re-check permissions server-side
- In-memory rate limiter (swap for Redis/Upstash before scaling past one instance)
- **Admin panel** (`/admin/login`, `/admin/dashboard`, ...):
  - Login page (outside the protected layout group, to avoid a redirect loop) using Auth.js credentials `signIn`
  - Sidebar layout with role-based nav (مدير-only items hidden from مشرف)
  - Dashboard: KPI cards + recharts bar charts of promise/request status distribution, live from Prisma
  - **Citizen requests moderation queue**: tabbed by status, approve/reject/resolve actions, all through a permission-checked, audit-logged server action
  - **Promise status queue**: inline per-row form enforcing the evidence-first rule — a status can never change without a source URL, written atomically with its `PromiseUpdate` row in a transaction
  - **User management** (admin-only): role changes, self-demotion blocked, audit-logged
  - **Audit log viewer** (admin-only): filterable by entity type, expandable before/after diffs
  - Projects/Reports/Surveys/Settings admin sections are placeholder pages — see below

## Not yet built (next iteration)
- Admin CRUD for projects, reports, surveys, and platform settings (currently placeholder pages)
- `/open-data` export UI (CSV/Excel) and `/about` methodology page
- CSV/Excel export endpoints and remaining `/api/v1/*` routes (projects, requests, surveys)
- File upload flow to Cloudflare R2 (citizen request photos, report PDFs, promise evidence)
- shadcn/ui component installation (`npx shadcn@latest init`) — current pages use plain Tailwind
- Tests, CI workflow, Docker Compose for local Postgres
- Survey support-vote and citizen-request-upvote both currently allow repeat submissions beyond simple IP rate limiting; consider the same anonymous-hash dedup pattern used for surveys

## ⚠️ Note on this build environment
This scaffold was generated in a sandbox without network access to `binaries.prisma.sh`, so `prisma migrate dev` could not run here — the schema is written and ready but unapplied. Run `npm run db:migrate` yourself once you have the project locally or in CI with normal network access.
