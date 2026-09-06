# DSA OS — Coding Agent Rules

## Mission

Build DSA OS according to the repository specifications.

DSA OS is a focused DSA learning operating system built around:

Today → Think → Solve → Learn → Remember → Improve

---

## Source of Truth

Use the following documents as authoritative:

1. docs/product/DSA_OS_IMPLEMENTATION_PLAN.md
2. docs/product/DSA_OS_BUSINESS_LOGIC.md
3. docs/architecture/DSA_OS_DATABASE.md
4. docs/architecture/DSA_OS_TECHNICAL_ARCHITECTURE.md
5. docs/product/DSA_OS_SCREEN_SPEC.md
6. docs/design/DSA_OS_DESIGN_SYSTEM.md

Stitch exports under docs/references/stitch/ are visual references.

docs/archive/ contains obsolete material and must not be used as an implementation source of truth.

When sources conflict:

- Product behavior: Business Logic
- Data model: Database Specification
- Software structure: Technical Architecture
- UX behavior: Screen Specification
- Visual styling: Design System
- Execution order: Implementation Plan
- Stitch files: visual reference only

Never revive removed features because an old document or Stitch export contains them.

---

## Architecture

Use a modular monolith.

Do not introduce microservices.

Do not introduce technologies that are not already approved by the architecture unless there is a documented technical necessity.

Approved core stack:

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- Radix UI
- Lucide React
- Supabase
- PostgreSQL
- Drizzle ORM
- Zod
- React Hook Form
- Recharts
- Vitest
- React Testing Library
- Playwright
- Sentry
- Vercel

Do not introduce Redis, GraphQL, Kafka, Elasticsearch, Kubernetes, or a separate backend service for MVP.

AI is not required for core MVP behavior.

---

## Business Logic

Business logic must not live inside React components.

Domain rules belong in dedicated domain/application modules.

The server is authoritative.

Never trust client state for:

- user ownership
- solved state
- revision state
- streak state
- analytics
- task completion
- scheduling
- recommendation decisions

---

## Security

Never accept client-provided user_id as the ownership source.

Derive identity from the authenticated session.

Use server-side authorization and database RLS.

Never expose service-role secrets to the browser.

---

## Data Integrity

Preserve historical events.

Do not overwrite:

- attempts
- revision attempts
- contest participation

Do not create duplicate:

- daily task slots
- current revision records
- journal entries per user/problem

Use transactions and database constraints where appropriate.

---

## Product Rules

Monday–Friday:
- 2 new problems
- 1 revision

Saturday:
- revision only
- up to 3 revisions

Sunday:
- contest only
- no normal new problems
- no revision

Analytics unlock:
- 10 distinct successfully solved problems

Do not change these rules because of current UI state or convenience.

---

## UI Rules

Use the DSA OS design system.

Primary product color:
#16A34A

Canvas:
#E8EAF0

Use Plus Jakarta Sans.

Use Lucide icons.

Do not create unnecessary cards, metrics, pages, or UI controls.

Do not add features merely because space is available.

---

## Progressive Disclosure

Do not reveal the correct problem pattern before it is supposed to be recognized.

Do not reveal journal answers before revision recall.

The normal learning flow is:

Problem
→ Think
→ External solve
→ Record result
→ Journal
→ Revision

---

## Implementation Discipline

Implement one phase at a time according to:

docs/product/DSA_OS_IMPLEMENTATION_PLAN.md

Before modifying code:

1. inspect the existing implementation
2. identify affected files
3. identify dependencies
4. explain the planned changes
5. execute only the approved phase

Do not refactor unrelated code.

Do not rewrite working systems without necessity.

---

## Verification

After every meaningful implementation step:

- run typecheck
- run lint
- run relevant unit/integration tests
- run build when appropriate

Fix failures before proceeding.

Do not declare a phase complete when verification is failing.

---

## Completion Reporting

At the end of every task report:

1. what changed
2. files changed
3. tests run
4. verification results
5. known issues
6. next phase