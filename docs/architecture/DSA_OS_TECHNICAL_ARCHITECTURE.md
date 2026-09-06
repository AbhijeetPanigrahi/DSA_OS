# DSA OS — Technical Architecture Specification

> **Version:** 1.0  
> **Status:** Final MVP technical architecture source of truth  
> **Audience:** Developer(s), reviewers, maintainers, technical interviewers  
> **Implementation target:** Next.js App Router + TypeScript + PostgreSQL/Supabase  
> **Primary deployment:** Vercel + Supabase  
> **Companion documents:**
> - `DSA_OS_DESIGN_SYSTEM.md`
> - `DSA_OS_SCREEN_SPEC.md`
> - `DSA_OS_DATABASE.md`
> - `DSA_OS_BUSINESS_LOGIC.md`

---

# 1. Purpose

This document defines how DSA OS is technically structured and how its components cooperate to implement the approved product behavior.

It answers:

- what technology is used where
- how the browser, server, domain logic, and database interact
- where authentication and authorization occur
- where business rules live
- how user actions become durable records
- how scheduling and revision work
- how derived analytics are calculated
- how concurrency and retries are handled
- how data is protected
- how the system is tested and deployed
- how the architecture can evolve without unnecessary complexity

This document is an implementation architecture, not a second product specification.

The product and business-rule documents remain authoritative for user behavior and exact business semantics. This document translates those decisions into an engineering structure.

---

# 2. Source-of-Truth Hierarchy

When documents disagree, use this order:

1. Finalized product decisions made after earlier drafts.
2. `DSA_OS_BUSINESS_LOGIC.md` for business rules.
3. `DSA_OS_SCREEN_SPEC.md` for screen behavior and UX flow.
4. `DSA_OS_DATABASE.md` for schema and persistence definitions.
5. `DSA_OS_DESIGN_SYSTEM.md` for visual implementation rules.
6. This document for technical architecture and implementation boundaries.
7. Older Stitch exports or older generated specifications only as historical references.

Important finalization rule:

> A superseded page or feature must not be reintroduced because an older document contains it.

In particular, the current architecture does **not** create standalone pages for:

- Today's Plan
- Weekly Plan
- Notes
- Journey
- Daily Reflection

Weekly curriculum is embedded in Dashboard. Calendar replaces Journey. Structured Pattern Journal replaces generic Notes. Daily Reflection was removed from the current MVP implementation scope.

Interview Mode remains deferred/future and must not distort the current core architecture.

---

# 3. Architecture Goals

The architecture is optimized for the following properties.

## 3.1 Correctness

Business-critical operations must be deterministic, transactional, idempotent, and server-authoritative.

Examples:

- daily task generation
- attempt completion
- revision completion
- contest participation
- streak calculation
- analytics calculation

## 3.2 Explainability

A developer should be able to answer:

> Why did DSA OS select this problem?

> Why is this revision due?

> Why did this pattern become a Focus Area?

The architecture therefore favors explicit domain functions over hidden framework behavior and opaque ML systems.

## 3.3 Data integrity

Historical user events are preserved.

Derived state can be recalculated.

The system should never depend on an unrecoverable manually maintained counter when the source events still exist.

## 3.4 Security

Authentication, server-side authorization, database constraints, and Row Level Security work together.

No trusted decision is made solely from client state.

## 3.5 Simplicity

The MVP intentionally avoids:

- microservices
- message brokers
- Redis
- GraphQL
- Kubernetes
- Kafka
- Elasticsearch
- a dedicated backend service
- a dedicated frontend service
- an AI dependency

The architecture should be strong enough for production use without pretending DSA OS is a distributed high-scale platform.

## 3.6 Evolvability

The code must allow future additions such as:

- Interview Mode
- notifications
- AI-assisted learning
- richer contest analytics
- more recommendation sophistication
- additional problem platforms

without forcing those features into the current MVP.

---

# 4. High-Level System Architecture

```text
                                   INTERNET
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │      Browser        │
                            │ React / Next.js UI  │
                            └──────────┬──────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
                    ▼                                     ▼
          Server Components / RSC                 Client Components
                    │                                     │
                    └──────────────────┬──────────────────┘
                                       ▼
                              Next.js Application
                                       │
             ┌─────────────────────────┼─────────────────────────┐
             │                         │                         │
             ▼                         ▼                         ▼
        Auth Context              Application Layer          UI Data
      Supabase SSR               Server Actions            Validation
             │                    Route Handlers
             │                         │
             └─────────────────────────┼─────────────────────────┘
                                       ▼
                               Domain Services
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        │              │               │               │              │
        ▼              ▼               ▼               ▼              ▼
  Scheduling      Attempts        Revisions      Analytics     Recommendations
        │              │               │               │              │
        └──────────────┴───────────────┴───────────────┴──────────────┘
                                       │
                             Data Access / Repositories
                                       │
                          Drizzle + Supabase database APIs
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │     PostgreSQL      │
                            │      Supabase       │
                            └──────────┬──────────┘
                                       │
                            RLS / constraints / indexes
                                       │
                                       ▼
                               Durable application data

                  ┌─────────────────────────────────────────────┐
                  │ External platform: LeetCode / GFG / etc.   │
                  │ User solves there; DSA OS records result   │
                  └─────────────────────────────────────────────┘

                  ┌─────────────────────────────────────────────┐
                  │ Supabase Cron / pg_cron                    │
                  │ invokes daily scheduling / maintenance    │
                  └─────────────────────────────────────────────┘

                  ┌─────────────────────────────────────────────┐
                  │ Vercel + Sentry + GitHub                    │
                  │ deployment / monitoring / CI                │
                  └─────────────────────────────────────────────┘
```

The system is a **modular monolith**.

That is intentional.

A modular monolith gives DSA OS:

- one deployment
- one repository
- one database
- clear domain boundaries
- simple transactions
- low operational overhead
- straightforward debugging

without giving up architectural discipline.

---

# 5. Technology Stack

## 5.1 Application framework

**Next.js App Router**

Used for:

- route structure
- server rendering
- React Server Components
- Server Actions
- Route Handlers
- metadata
- application shell
- authentication-aware server rendering

## 5.2 Language

**TypeScript** across:

- application code
- domain logic
- database definitions
- validation schemas
- tests

TypeScript is the primary compile-time contract between layers.

## 5.3 Frontend

**React**

Use Server Components by default and Client Components only where interactivity requires browser state or event handlers.

## 5.4 Styling

**Tailwind CSS**

The implementation follows the centralized DSA OS design tokens.

Canonical product tokens include:

- background `#E8EAF0`
- primary green `#16A34A`
- supporting green `#BBF7D0`
- supporting green `#4ADE80`
- deep activity green `#166534`
- warning amber `#F59E0B`
- error red `#DC2626`
- primary text approximately `#20212A`

Visual constants must not be scattered across components.

## 5.5 UI primitives

**shadcn/ui + Radix UI**

Used for accessible primitives such as:

- Dialog
- Select
- DropdownMenu
- Popover
- Tabs
- Checkbox
- Switch
- Tooltip
- Command

Components are owned by the application and may be adapted to the DSA OS design language.

## 5.6 Icons

**Lucide React**

One consistent icon family is used throughout the application.

## 5.7 Form handling

**React Hook Form + Zod**

React Hook Form handles client-side form state.

Zod performs runtime validation.

Server actions must validate again; client validation is not a security boundary.

## 5.8 Database

**PostgreSQL through Supabase**

PostgreSQL is the authoritative relational datastore.

## 5.9 Database access

**Drizzle ORM** is the primary typed SQL layer for application/server-side database access and schema/migration management.

However, database access must respect the distinction between:

- normal server-side typed queries
- operations that intentionally rely on Supabase request-context/RLS semantics

The architecture must never assume that a direct privileged database connection automatically has an end-user `auth.uid()` context.

Where an operation specifically depends on Supabase RLS request context, use the Supabase server client/RPC path or establish the transaction request context deliberately and safely.

The implementation must not use an unbounded mixture of access styles. Each repository operation must document which access path it uses.

## 5.10 Authentication

**Supabase Auth**

Used for:

- signup
- login
- logout
- session persistence
- password reset/verification as configured
- identity

## 5.11 Authorization

**Supabase RLS + server-side authorization checks**

Both are required for defense in depth.

## 5.12 Scheduling

**Supabase Cron / pg_cron** for recurring server-triggered scheduling and lightweight maintenance jobs.

The scheduling function itself remains application/domain logic, not cron logic.

## 5.13 Charts

**Recharts**

Used only for the approved Analytics trend visualization.

## 5.14 Date and timezone handling

**date-fns + date-fns-tz**

All actual timestamps are stored in UTC-aware PostgreSQL types (`timestamptz`).

User-facing dates are calculated in the user's configured timezone.

## 5.15 Testing

- **Vitest** — domain/business logic tests
- **React Testing Library** — component behavior
- **Playwright** — end-to-end flows

## 5.16 Monitoring

**Sentry** for production errors and application diagnostics.

## 5.17 Hosting

**Vercel** for the Next.js application.

**Supabase** for PostgreSQL/Auth/database infrastructure.

## 5.18 Version control and CI

**Git + GitHub**.

CI should run at minimum:

- TypeScript type checking
- linting
- unit tests
- build validation
- selected E2E smoke tests where environment support permits

---

# 6. Architectural Style

DSA OS uses a **modular monolith with domain-oriented application structure**.

The high-level layers are:

```text
Presentation
    ↓
Application / orchestration
    ↓
Domain
    ↓
Data access
    ↓
Infrastructure
```

The direction of dependency should generally be downward.

A UI component should not import a database client.

A domain service should not import React.

A database repository should not know how a button looks.

---

# 7. Layer Responsibilities

## 7.1 Presentation layer

Responsibilities:

- render UI
- capture user interaction
- display loading/error/success states
- call approved application entry points
- maintain temporary client interaction state

Must not contain:

- revision interval calculations
- recommendation weights
- streak rules
- analytics unlock thresholds
- database transactions

## 7.2 Application layer

The application layer coordinates a user operation.

Example:

```text
completeProblemAttempt()
    ↓
validate command
    ↓
authorize
    ↓
load required records
    ↓
invoke domain rules
    ↓
transactional persistence
    ↓
return view-safe result
```

Application services answer:

> What operation is the user trying to perform?

## 7.3 Domain layer

The domain layer answers:

> What should happen according to DSA OS rules?

Examples:

- calculate revision interval
- determine due candidates
- rank recommendation candidates
- determine streak
- calculate pattern score
- determine analytics unlock
- select fallback problem

Domain functions should be as pure and deterministic as practical.

## 7.4 Data-access layer

Responsibilities:

- queries
- inserts
- updates
- transactions
- database constraint handling
- mapping database records into application/domain shapes

It should not decide product behavior beyond persistence-level constraints.

## 7.5 Infrastructure layer

Responsibilities:

- Supabase client setup
- environment configuration
- Sentry integration
- cron entry points
- email/notification provider later
- logging adapters
- external service adapters

---

# 8. Recommended Repository Structure

Recommended structure:

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   │
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── problems/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── workspace/
│   │   ├── patterns/
│   │   │   └── [id]/
│   │   ├── journal/
│   │   │   └── [id]/
│   │   ├── revision/
│   │   ├── analytics/
│   │   └── calendar/
│   │
│   ├── api/
│   │   └── ...              # only true HTTP integrations
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/                  # shadcn/ui and primitives
│   ├── layout/
│   ├── problem/
│   ├── revision/
│   ├── journal/
│   ├── analytics/
│   └── calendar/
│
├── features/
│   ├── dashboard/
│   ├── problems/
│   ├── attempts/
│   ├── journal/
│   ├── revisions/
│   ├── analytics/
│   ├── scheduling/
│   └── calendar/
│
├── domain/
│   ├── attempts/
│   ├── revisions/
│   ├── scheduling/
│   ├── recommendations/
│   ├── analytics/
│   ├── streak/
│   ├── journal/
│   └── patterns/
│
├── db/
│   ├── schema/
│   ├── queries/
│   ├── repositories/
│   ├── transactions/
│   └── migrations/
│
├── lib/
│   ├── auth/
│   ├── validation/
│   ├── dates/
│   ├── errors/
│   ├── logging/
│   └── security/
│
├── config/
│   ├── app.ts
│   ├── business-rules.ts
│   └── environment.ts
│
├── types/
│   └── ...                  # only shared boundary types
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

The exact final structure may be adapted to the existing repository, but the architectural boundaries must remain.

---

# 9. Route Architecture

## Public routes

```text
/
/login
/signup
```

## Authenticated routes

```text
/dashboard
/problems
/problems/[id]
/problems/[id]/workspace
/patterns
/patterns/[id]
/journal
/journal/[id]
/revision
/analytics
/calendar
```

Settings is a modal state in the authenticated application shell.

Interview Mode may later use a contextual route, but it is deferred.

---

# 10. Route Protection

Authenticated application routes must be protected before private data is rendered.

Recommended flow:

```text
HTTP request
    ↓
Next.js middleware / route auth boundary
    ↓
Read Supabase session
    ↓
No valid session?
    → redirect to login
    ↓
Valid session
    ↓
render authenticated route
```

The route guard is a UX/security entry layer, not the only authorization mechanism.

Every sensitive server operation independently verifies identity and ownership.

---

# 11. Authentication Architecture

Supabase Auth is the identity provider.

The browser interacts with the normal Supabase authentication flow through the supported Next.js SSR integration.

The application receives an authenticated session.

Conceptually:

```text
Browser
  ↓
Supabase Auth
  ↓
session / access token
  ↓
Next.js server context
  ↓
authenticated user ID
  ↓
profile + user-owned application records
```

The application should use the auth provider's stable user ID as the ownership root.

---

# 12. User Initialization Flow

After successful signup:

```text
Supabase Auth identity created
        ↓
profile initialized
        ↓
user_settings initialized
        ↓
default preferences applied
        ↓
user enters Dashboard
```

Defaults come from the business specification:

```text
weekday new problems = 2
weekday revisions = 1
Saturday revisions = 3
difficulty = adaptive
revision mode = adaptive
practice reminders = enabled
revision reminders = enabled
theme = system
```

Initialization must be idempotent.

If a profile already exists, the system must not create duplicate user settings.

---

# 13. Authorization Model

Every sensitive operation follows:

```text
Authenticated user
       +
Resource ownership
       +
Valid state transition
       ↓
Allowed operation
```

Example:

```text
completeRevision(revisionId)
```

must first establish:

1. the caller is authenticated
2. the revision exists
3. the revision belongs to the caller
4. the revision is active/eligible
5. the current operation has not already been committed

A client-provided `user_id` is never treated as the ownership source.

The server derives identity from the authenticated session.

---

# 14. Row Level Security Strategy

RLS is enabled for user-owned tables.

The conceptual policy is:

```text
user-owned row
    ↓
row.user_id = auth.uid()
```

This protects data if a query path accidentally forgets an application-level ownership condition while still running through an RLS-aware database context.

Important implementation rule:

> Do not assume a privileged direct PostgreSQL/Drizzle connection automatically evaluates `auth.uid()` as the browser user.

Therefore:

- user-scoped queries must explicitly enforce ownership in application queries
- RLS must be configured for defense in depth
- RLS-dependent access should use an RLS-aware Supabase client/RPC path or an explicitly established request context
- service-role credentials must never reach the browser
- privileged database connections are restricted to trusted server operations only

---

# 15. Public vs Private Data

## Public/reference data

Examples:

- active problems
- active patterns
- topics
- weekly curriculum definition

These are generally shared application data.

## Private user data

Examples:

- attempts
- attempt mistakes
- journal entries
- revisions
- revision attempts
- daily tasks
- daily activity
- contest participations
- user settings
- profile information

These must be isolated by user.

---

# 16. Database Responsibility Boundary

The database is responsible for:

- persistent storage
- referential integrity
- uniqueness
- non-null requirements
- foreign keys
- indexes
- transaction atomicity
- RLS
- low-level data validity

The application/domain layer is responsible for:

- business workflows
- recommendation calculations
- revision algorithm
- analytics semantics
- scheduling decisions
- user-facing state transitions

The database should not become a dumping ground for all application behavior.

However, database constraints are encouraged whenever they protect core invariants.

---

# 17. Authoritative Data Model

The system follows one critical rule:

> The same business fact must have one authoritative source.

Examples:

| Business fact | Authoritative source |
|---|---|
| Problem definition | `problems` |
| Pattern definition | `patterns` |
| User preference | `user_settings` |
| Attempt outcome | `attempts` |
| Attempt mistakes | `attempt_mistakes` |
| Journal lesson | `journal_entries` |
| Current revision schedule | `revisions` |
| Revision history | `revision_attempts` |
| Daily assignment | `daily_tasks` |
| Historical activity aggregate | `daily_activity` |
| Contest participation | `contest_participations` |

A screen should derive its display state from these records rather than maintaining another hidden truth.

---

# 18. Data Flow Philosophy

DSA OS follows this general flow:

```text
User intent
    ↓
Validated command
    ↓
Application service
    ↓
Domain decision
    ↓
Transactional persistence
    ↓
Authoritative event/current state
    ↓
Derived views
    ↓
Future recommendation/scheduling
```

This creates a closed learning loop.

---

# 19. Query and Mutation Separation

Reads and writes should be conceptually separated.

## Reads

Examples:

```text
getDashboardData()
getProblems()
getJournalEntries()
getDueRevisions()
getAnalytics()
getCalendarMonth()
```

Reads should avoid unnecessary side effects.

## Mutations

Examples:

```text
startAttempt()
completeAttempt()
saveJournalEntry()
completeRevision()
recordContestParticipation()
updateSettings()
```

Mutations are where authorization, validation, business logic, transactions and idempotency are enforced.

---

# 20. Server Components vs Client Components

## Default: Server Component

Use Server Components for:

- Dashboard data
- Problems list data
- Journal library data
- Revision queue data
- Analytics data
- Calendar data
- problem metadata
- authenticated initial page rendering

Benefits:

- less client JavaScript
- secure server-side access
- direct database reads
- simpler data flow

## Client Components

Use Client Components only where browser interactivity is necessary.

Examples:

- Settings modal
- search/filter controls that need local state
- interactive checklist
- timer
- recall text inputs
- optimistic UI where justified
- calendar date selection
- dialogs and dropdowns

A component is not made client-side merely because it looks interactive.

---

# 21. Server Actions

Server Actions are the preferred application mutation boundary for normal internal workflows.

Examples:

```text
startAttempt
saveInitialApproach
completeAttempt
saveJournalEntry
completeRevision
recordContestParticipation
updateSettings
```

Each Server Action should follow:

```text
parse input
  ↓
authenticate
  ↓
authorize
  ↓
validate domain state
  ↓
execute domain operation
  ↓
commit transaction
  ↓
return serializable result
```

Server Actions must never trust hidden form fields for ownership.

---

# 22. Route Handlers

Route Handlers should be limited to use cases that actually require HTTP endpoints.

Appropriate uses:

- webhook receivers
- external callbacks
- future public API
- integration endpoints
- cron invocation endpoints where required by infrastructure

Do not create a REST endpoint for every internal mutation just for the appearance of a formal API.

---

# 23. Application Service Pattern

Application services are use-case-oriented.

Recommended examples:

```text
createAttemptService
completeAttemptService
ensureDailyTasksService
completeRevisionService
recordContestParticipationService
getAnalyticsService
updateSettingsService
```

They coordinate the domain and data layers.

They do not render UI.

---

# 24. Domain Module Boundaries

Core domain modules:

```text
identity
curriculum
scheduling
problems
attempts
journal
revisions
streak
analytics
recommendations
calendar
settings
```

Each module should expose a small, deliberate API.

Example:

```text
/domain/revisions
    calculateInitialInterval()
    calculateNextInterval()
    selectDueRevisionCandidates()
    classifyRecallResult()
```

The exact function names may vary; the responsibility boundary should not.

---

# 25. Business Rule Centralization

Business constants must be centralized.

Examples:

```ts
REVISION_INTERVALS
RECOMMENDATION_WEIGHTS
PATTERN_SCORE_WEIGHTS
PATTERN_STATUS_THRESHOLDS
RECENT_ATTEMPT_WINDOW
ANALYTICS_UNLOCK_THRESHOLD
WEEKLY_SCHEDULE
```

Do not place:

```text
10
0.30
0.40
14 days
3 attempts
```

randomly across components and helper files.

This makes later rule changes dangerous and hard to audit.

---

# 26. Business Rule Versioning

The first MVP can keep one active algorithm version in code.

If the algorithms later become production-critical or materially change, introduce explicit versions.

Examples:

```text
revision_algorithm_version = 1
recommendation_algorithm_version = 1
pattern_scoring_version = 1
```

Historical events remain unchanged even when algorithms evolve.

A later calculation may use a newer algorithm without rewriting what the user actually did.

---

# 27. Weekly Curriculum Architecture

Weekly curriculum is reference configuration.

Canonical week:

```text
Monday      Arrays + Hashing
Tuesday     Two Pointers + Sliding Window
Wednesday   Binary Search + Prefix Sum
Thursday    Linked List + Stack
Friday      Trees + BST
Saturday    Graphs
Sunday      LeetCode Contest Day / contest context
```

The backend uses curriculum data to influence daily selection.

The Dashboard renders the current week from persisted/configured curriculum data.

No separate weekly-planning service is needed.

---

# 28. Daily Scheduler Architecture

The daily scheduler is a domain/application service.

Its responsibility is to ensure the user's local day has the correct persisted task set.

Properties:

- deterministic
- idempotent
- timezone-aware
- concurrency-safe
- explainable
- fallback-capable

---

# 29. Daily Scheduler Entry Points

The scheduler may be triggered by:

1. Dashboard load for a user whose current day has not yet been planned.
2. A scheduled background job for proactive generation.
3. A safe retry after a failed generation attempt.

These entry points all call the same `ensureDailyTasks` business operation.

There must not be three independent task-generation algorithms.

---

# 30. Daily Scheduler Algorithm

Conceptual flow:

```text
request scheduler for user
        ↓
load timezone
        ↓
calculate user-local date
        ↓
load existing tasks
        ↓
if day already planned sufficiently
    return existing tasks
else
    classify weekday
        ↓
    select appropriate task candidates
        ↓
    write tasks atomically
        ↓
    return persisted tasks
```

The scheduler must never regenerate a task simply because the Dashboard was refreshed.

---

# 31. Weekday Task Generation

Monday–Friday default:

```text
slot 1 → new problem
slot 2 → new problem
slot 3 → revision
```

Settings may influence normal weekday quantities where the product permits.

The structural distinction remains intact:

- weekday = new work + revision
- Saturday = revision only
- Sunday = contest only

---

# 32. Saturday Task Generation

Saturday:

```text
up to 3 revision tasks
```

The scheduler first obtains due/overdue candidates and ranks them.

If fewer than three valid candidates exist, assign only those available.

Never duplicate a revision to fill the quota.

---

# 33. Sunday Task Generation

Sunday:

```text
one contest task
```

No normal new-problem task.

No revision task.

A failure to open an external contest must not prevent Dashboard or the rest of the application from loading.

---

# 34. Daily Task Idempotency

Recommended uniqueness boundary:

```text
(user_id, task_date, task_type, slot_number)
```

The database should enforce the invariant where possible.

Concurrency behavior:

```text
Process A → creates task
Process B → attempts same task
                    ↓
          uniqueness constraint
                    ↓
          duplicate rejected / treated as already existing
```

Application code should then re-read the persisted tasks rather than returning an invented duplicate.

---

# 35. Daily Task Stability

Once a daily task exists, it remains stable for that day.

Do not replace it because:

- recommendation scores changed
- analytics changed
- a weak pattern changed
- settings changed
- the page refreshed
- the user opened another screen

Historical and current-day planning stability are more important than constantly optimizing today's assignment.

---

# 36. New Problem Recommendation Architecture

New problem recommendation is a pure scoring/ranking subsystem.

Inputs include:

- weekly curriculum
- pattern evidence
- difficulty fit
- recent attempts
- solved state
- novelty
- problem availability

Conceptual score:

```text
0.30 curriculum relevance
0.30 weakness relevance
0.15 difficulty fit
0.15 novelty
0.10 recent fit
```

Weights are centralized constants.

---

# 37. Recommendation Pipeline

```text
load eligible active problems
        ↓
apply hard exclusions
        ↓
calculate candidate features
        ↓
normalize feature scores
        ↓
calculate recommendation score
        ↓
sort deterministically
        ↓
apply diversity guardrails
        ↓
select required number
        ↓
persist selected tasks
```

A candidate with a high score still loses if it violates a hard constraint.

---

# 38. Hard Recommendation Exclusions

The recommendation system must exclude:

- inactive problems
- today's duplicate assignments
- problems that violate recent-attempt exclusion
- problems already represented by an active current revision when inappropriate for new work
- invalid/missing external URL
- problems outside allowed day structure

The system must never relax these structural rules.

---

# 39. Recommendation Fallback Strategy

When ideal candidates are unavailable:

```text
curriculum + weak pattern
      ↓
curriculum
      ↓
weak pattern
      ↓
active unsolved suitable problem
      ↓
least-recently-attempted active problem
```

Only non-critical filters are progressively relaxed.

Never fabricate a problem.

---

# 40. Recommendation Diversity

The two weekday problems should not blindly target the exact same weak pattern.

Preferred conceptual split:

```text
Problem 1 → weakness / current focus
Problem 2 → curriculum reinforcement or complementary pattern
```

This prevents negative loops such as:

```text
weak pattern
  ↓
only weak-pattern problems
  ↓
repeated failure
  ↓
frustration
  ↓
more same-pattern recommendations
```

---

# 41. Difficulty Adaptation Architecture

Difficulty selection is based on demonstrated learning performance, not streak length.

Long-run starting targets:

```text
Initial:
80% Easy
20% Medium
0% Hard

Developing:
60% Easy
40% Medium

Advanced:
30% Easy
60% Medium
10% Hard
```

These are distributions over time rather than strict daily quotas.

---

# 42. Difficulty Feedback

Increase difficulty gradually when:

- independent solves are stable
- recent success remains healthy
- help dependence is not increasing
- pattern recognition improves

Reduce difficulty when:

- failures cluster
- solution dependence increases
- the user struggles with Easy problems
- one pattern repeatedly produces failures

Difficulty adjustment must remain bounded by available candidate data.

---

# 43. Problem Attempt Architecture

A problem attempt is historical evidence.

Attempt lifecycle:

```text
not_started
   ↓
started
   ↓
completed
```

Abandoned work is not a solved problem.

Completed outcome values:

```text
independent
hint
approach
solution
failed
```

Historical attempts are append-oriented and are not overwritten.

---

# 44. Attempt Completion Flow

```text
Browser
  ↓
completeAttempt Server Action
  ↓
validate payload
  ↓
authenticate user
  ↓
authorize problem/task
  ↓
validate outcome consistency
  ↓
BEGIN transaction
  ↓
insert attempt
  ↓
insert selected mistakes
  ↓
create/update journal if requested
  ↓
create/update revision schedule where applicable
  ↓
complete matching daily task if applicable
  ↓
update/rebuild daily activity for local date
  ↓
COMMIT
  ↓
return success
```

A single business operation should keep related state changes atomic.

---

# 45. Attempt Outcome Consistency

Invalid combinations must be rejected.

Example:

```text
outcome = independent
used_solution = true
```

is contradictory.

The application should normalize the model so that the outcome itself is authoritative wherever possible.

Example mapping:

```text
independent → no help flags
hint        → used hint
approach    → saw approach
solution    → saw solution
failed      → unsuccessful
```

The implementation should avoid duplicate fields unless they serve an actual audit/reporting purpose.

---

# 46. Manual Practice

A manually selected problem follows the same attempt engine.

It may:

- create an attempt
- update Journal
- create/update Revision
- affect Analytics
- affect Calendar activity

But it does not magically complete a daily task merely because the same problem was manually solved later.

Daily assignment completion and actual learning evidence are separate concepts.

---

# 47. External Coding Platform Architecture

DSA OS is not an online judge.

The user solves on:

- LeetCode
- GeeksforGeeks
- HackerRank
- Codeforces
- CodeChef
- another stored platform

The problem record stores:

```text
platform
url
```

No `leetcode_url` field should be required.

---

# 48. External Solve Trust Model

In MVP, DSA OS does not independently verify that code was accepted on the external platform.

Therefore:

```text
User records outcome
```

not:

```text
DSA OS verified submission
```

The UI must not imply platform verification unless a future integration actually performs verification.

---

# 49. Problem Workspace Architecture

Problem Workspace is contextual.

Its responsibilities:

- pre-solve thinking
- initial approach capture
- timer if used
- external platform launch
- outcome recording
- mistake capture
- Journal handoff

It is not:

- a coding editor
- a code execution sandbox
- a LeetCode clone
- an online judge

---

# 50. Pattern Concealment Architecture

Pattern concealment is a backend/view-model responsibility, not only a CSS behavior.

Where recognition is intentionally tested, the server-provided view model should not unnecessarily include the target pattern.

Examples:

```text
Problem Workspace pre-attempt
Revision pre-recall
Interview Mode future
```

A client-side `display: none` solution is insufficient because hidden information is still present in the browser payload.

This is both a product-integrity and data-exposure concern.

---

# 51. Journal Architecture

Pattern Journal is the user's canonical reusable knowledge record.

It is distinct from attempt history.

```text
Attempt
  ↓
what happened

Journal
  ↓
what should I remember
```

MVP uniqueness:

```text
one active journal entry per user + problem
```

Repeated learning updates the canonical entry rather than creating duplicates.

Historical attempts remain separate.

---

# 52. Journal Data Rules

Canonical fields:

```text
problem
failed_idea
key_observation
pattern
time_complexity
space_complexity
what_to_remember
pattern_recognition
```

Manual Journal creation is allowed.

Manual Journal creation without an attempt does not count as a solved problem.

---

# 53. Pattern Recognition Data

Recognition is stored as:

```text
independent
after_hint
not_recognized
```

MVP does not attempt unreliable automatic grading of free-text pattern responses.

Revision records the user's recalled pattern answer separately from the stored Journal state.

---

# 54. Revision Engine Architecture

Revision is a separate domain subsystem.

It contains two concepts:

```text
revisions
    ↓
current schedule/state

revision_attempts
    ↓
historical recall events
```

The current schedule may change.

The history does not.

---

# 55. Revision Eligibility

A problem may enter revision after a meaningful learning attempt.

Initial intervals:

| Attempt outcome | Initial interval |
|---|---:|
| Independent | 3 days |
| Hint | 2 days |
| Approach | 2 days |
| Solution | 1 day |
| Failed | 1 day |

The current exact next review state is stored on the revision record.

---

# 56. Revision Ladder

MVP ladder:

```text
1 day
3 days
7 days
14 days
30 days
60 days
```

The algorithm is intentionally simple and explainable.

No complex scientifically calibrated model is required for MVP.

---

# 57. Revision Result Handling

User-facing result values:

```text
Easy recall
Partial
Forgot
```

Conceptual transitions:

```text
Easy
3 → 7
7 → 14
14 → 30
30 → 60

Partial
14 → 3
30 → 7
7 → 3
3 → 1

Forgot
→ 1
```

All transition functions belong in one domain module.

---

# 58. Due Date vs Daily Quota

This separation is mandatory.

The revision engine answers:

> Which revisions are due?

The scheduler answers:

> How many should appear today?

Example:

```text
7 due revisions
    ↓
Tuesday quota = 1
    ↓
1 selected
6 remain due/overdue
```

A revision left unselected because of quota is not a failure.

---

# 59. Revision Priority

Priority:

```text
1. overdue
2. previously forgotten
3. previously partial
4. normally due
5. oldest due date
6. weak-pattern relevance
```

The selection function must be deterministic for the same state.

---

# 60. Revision Recall UX Security / Integrity

Before recall the payload should contain only necessary information:

```text
problem title
difficulty
last reviewed date
recall prompts
```

Do not expose:

- target pattern
- Journal answer
- key observation
- complexity
- solution

After `Check My Recall`, the server/client transition reveals the stored learning record.

---

# 61. Revision Completion Transaction

One revision completion should perform:

```text
validate revision
    ↓
prevent duplicate completion
    ↓
create revision_attempt
    ↓
calculate next interval
    ↓
calculate next_review_at
    ↓
update revisions
    ↓
complete matching daily task
    ↓
update daily_activity
```

All operations that must succeed together should be committed atomically.

---

# 62. Duplicate Revision Submission

Two tabs may submit the same revision.

Correct result:

```text
one historical revision_attempt
one schedule update
one daily-task completion
one activity increment
```

Recommended controls:

- unique logical completion key
- transaction
- row locking or equivalent concurrency control
- status validation

Client disabling of a button is not sufficient.

---

# 63. Contest Architecture

The MVP stores minimal participation information.

Flow:

```text
Sunday Dashboard
    ↓
Open contest externally
    ↓
Return to DSA OS
    ↓
Record participation
    ↓
contest_participations
    ↓
daily_activity
    ↓
streak may continue
```

No contest API integration is required for MVP.

Deferred:

- ranking
- rating
- score
- detailed contest analytics

---

# 64. Daily Activity Architecture

`daily_activity` is a historical aggregate.

It is derived from real events.

Sources:

```text
successful attempts
revision attempts/completions
contest participations
```

It should be reconstructable.

The UI must never directly increment activity counters.

---

# 65. Daily Activity Rebuild

A maintenance/recovery operation should conceptually support:

```text
attempts
+
revision_attempts
+
contest_participations
        ↓
rebuild daily_activity
```

This makes the system resilient to aggregate corruption.

---

# 66. Calendar Architecture

Calendar is a history read model.

It answers:

> What did the user actually do?

It does not calculate mastery.

It does not change schedules.

It does not act as a planning application.

---

# 67. Calendar Data Flow

```text
Authoritative events
   ↓
Daily activity / historical queries
   ↓
Calendar view model
   ↓
Month grid + selected day
```

The calendar intensity is primarily driven by problems solved.

Canonical visual states:

```text
0 solved → neutral
1 solved → light green
2+ solved → dark green
weekend contest context → appropriate strong activity treatment
```

Revisions are visible in selected-day details but do not make a zero-problem day look like a high-output day.

---

# 68. Streak Architecture

Streak is derived from meaningful daily activity.

An active day is:

```text
problems_solved >= 1
OR revisions_completed >= 1
OR contest_participated = true
```

Current streak is the consecutive sequence of active local dates according to the current today policy.

Saturday revision activity can maintain a streak.

Sunday contest participation can maintain a streak.

A completely inactive day breaks the streak.

---

# 69. Streak Recalculation

Do not rely only on fragile counters such as:

```text
streak = streak + 1
```

Prefer deriving streak from activity history.

A future cache may store a current streak for performance, but the cached value must be rebuildable from authoritative activity data.

---

# 70. Timezone Architecture

Time is one of the highest-risk parts of DSA OS because business rules are date-sensitive.

Store actual events as UTC-aware timestamps.

Store the user's configured timezone separately.

Convert timestamps to that timezone before deciding:

- today
- weekday
- calendar date
- streak date
- daily task date
- reminder time
- revision day interpretation

Never use server UTC date alone for user-facing daily logic.

---

# 71. Timezone Example

For a user in IST:

```text
23:58 Monday IST
→ Monday activity

00:03 Tuesday IST
→ Tuesday activity
```

Even if the UTC timestamps are only minutes apart, the events belong to different user-local dates.

---

# 72. Timezone Change Policy

Historical event timestamps remain immutable.

For current and future user-facing calculations, the system follows the configured/current timezone policy.

Changing timezone must not rewrite old attempt timestamps.

A timezone change may change which local calendar day a timestamp is interpreted as in future derived displays; this policy must be documented and consistently applied.

Do not introduce ad-hoc exceptions in individual screens.

---

# 73. Analytics Architecture

Analytics is a derived read model, not a write-time truth source.

Source evidence:

```text
attempts
attempt_mistakes
problem_patterns
journal_entries
revision_attempts
daily_activity
```

Outputs:

```text
Problems Solved
Independent Solve Rate
Revision Recall
Day Streak
Focus Areas
Recurring Mistakes
Next Focus
Independent Solve Rate trend
```

---

# 74. Analytics Unlock

Full Analytics unlocks after:

```text
10 distinct successfully solved problem IDs
```

At 9:

```text
locked / insufficient-data state
```

At 10:

```text
full analytics
```

Repeated solves of the same problem do not increase the distinct-problem count beyond one.

---

# 75. Analytics Metrics

## Problems Solved

```text
distinct problem IDs with at least one successful attempt
```

## Independent Solve Rate

```text
independent successful attempts
/
all successful attempts
```

## Revision Recall

```text
easy recall attempts
/
all completed revision attempts
```

If there are no revision attempts, do not show a misleading percentage.

## Day Streak

Derived from real meaningful activity.

---

# 76. Pattern Mastery Architecture

Pattern mastery is derived.

A pattern needs meaningful evidence before it receives a strong label.

Recommended minimum evidence:

```text
3 or more relevant attempts
```

Below that:

```text
insufficient data
```

Starting score:

```text
0.40 independent solve rate
+
0.25 pattern recognition rate
+
0.20 revision recall rate
+
0.15 recent success rate
```

Missing components should have their weights redistributed among available signals.

---

# 77. Pattern Status Thresholds

Starting classifications:

```text
< 0.50       Focus
0.50–0.69    Developing
0.70–0.84    Solid
>= 0.85      Strong
```

These are configurable business constants and should be validated against real usage later.

---

# 78. Recommendation Feedback Loop

The adaptive loop is:

```text
User attempt
   ↓
Outcome + mistakes + pattern evidence
   ↓
Analytics / pattern evidence
   ↓
Focus Area
   ↓
Recommendation engine
   ↓
Future problem selection
   ↓
New attempt
```

The system should gradually adapt while remaining deterministic and bounded.

---

# 79. Negative Feedback Loop Protection

The recommendation engine must detect repeated failure concentration.

When a pattern remains weak and failures cluster:

- lower difficulty
- provide familiar reinforcement
- reduce concentration
- combine one weak-pattern problem with one compatible curriculum problem

Do not let a weakness become an endless punishment loop.

---

# 80. Derived Read Models vs Source Events

A derived screen may compute:

```text
focusAreas()
analyticsSummary()
calendarMonth()
streak()
```

These are read models.

They must not become new authoritative event stores.

For example:

```text
Independent Solve Rate
```

should be recalculable from `attempts`.

---

# 81. Caching Architecture

Caching should be conservative.

## Safe candidates

- active public problem catalog segments
- active pattern/topic definitions
- weekly curriculum reference data
- static design/configuration

## User-specific data

Examples:

- Dashboard
- revision queue
- analytics
- journal
- calendar

should generally be fetched with user-aware server logic and carefully scoped revalidation.

Never allow one user's cached response to be served to another user.

---

# 82. Cache Invalidation Strategy

Mutation-dependent pages should revalidate after relevant writes.

Examples:

```text
completeAttempt
    ↓
revalidate Dashboard
revalidate Problems
revalidate Journal
revalidate Revision
revalidate Analytics when unlocked/affected
revalidate Calendar
```

The exact invalidation graph should be kept centralized rather than copied into random components.

Avoid indiscriminately invalidating the entire application after every mutation.

---

# 83. Optimistic UI Policy

Optimistic UI is appropriate only when the operation is simple and rollback is reliable.

Good candidates:

- opening a modal
- local filter changes
- local checklist completion before submission

Be cautious with:

- attempt completion
- revision completion
- contest participation
- analytics state

These operations affect durable historical data and should prefer server-confirmed state.

---

# 84. Error Architecture

Errors have three categories.

## User/input errors

Example:

```text
Invalid revision response.
```

Return a clear actionable message.

## Business rule errors

Example:

```text
This revision has already been completed.
```

Do not expose implementation internals.

## Infrastructure errors

Examples:

- database unavailable
- timeout
- unexpected exception

Log diagnostic detail server-side and show concise user-safe messaging.

---

# 85. Error Handling Principle

Never convert an error into fake data.

Examples:

```text
Analytics calculation fails
→ unavailable state

Recommendation query fails
→ safe fallback candidate

Revision scheduling fails
→ preserve previous valid schedule

Calendar query fails
→ recoverable error state
```

Never show:

```text
0 solved
0 revisions
0% retention
```

when the real reason is that the database failed to load.

---

# 86. Domain Error Types

Use structured error categories internally.

Conceptual examples:

```text
AUTH_REQUIRED
FORBIDDEN
NOT_FOUND
INVALID_INPUT
INVALID_TRANSITION
ALREADY_COMPLETED
CONFLICT
SCHEDULING_UNAVAILABLE
DATA_UNAVAILABLE
INTERNAL_ERROR
```

Map them to user-safe messages at the application boundary.

Do not expose raw SQL/database errors to users.

---

# 87. Concurrency Architecture

Assume concurrent clients exist.

Possible sources:

- two browser tabs
- multiple devices
- repeated button click
- network retry
- browser refresh during mutation
- duplicated scheduled invocation

Correctness must rely on:

```text
server validation
+
transaction
+
constraints
+
idempotency
```

not only on React state.

---

# 88. Idempotency Architecture

Important operations must be retry-safe.

## Daily generation

Repeated call:

```text
same persisted tasks
```

## Attempt completion

Repeated logical submission:

```text
no duplicate historical event
```

## Revision completion

Repeated request:

```text
no duplicate revision_attempt
```

## Contest participation

Repeated click:

```text
no duplicate participation event
```

Where a natural database unique key is insufficient, introduce an explicit idempotency key.

---

# 89. Transaction Boundaries

A transaction should encompass every state change that must succeed together.

## Complete problem

```text
BEGIN
  validate
  insert attempt
  insert attempt mistakes
  upsert journal
  upsert revision
  complete matching daily task
  update daily activity
COMMIT
```

## Complete revision

```text
BEGIN
  validate revision
  insert revision attempt
  update revision schedule
  complete task
  update daily activity
COMMIT
```

## Contest participation

```text
BEGIN
  validate contest context
  insert participation
  complete contest task
  update daily activity
COMMIT
```

If any critical step fails, the operation should roll back rather than leave contradictory partial state.

---

# 90. Database Constraint Strategy

Use constraints to enforce invariants whenever practical.

Examples:

- valid foreign keys
- unique journal per user/problem
- unique revision per user/problem
- daily task uniqueness
- valid enum/domain values where appropriate
- non-null ownership columns
- positive/valid slot numbers

Application validation remains necessary because constraints alone do not express every business rule.

---

# 91. Historical Immutability

Historical event records should be append-oriented.

Do not rewrite past:

- attempt outcomes
- revision outcomes
- contest participation
- activity dates

Algorithm changes must not silently rewrite historical evidence.

Corrected user mistakes should be handled through explicit correction operations if such a feature is introduced later, with auditability.

---

# 92. Soft Deactivation

Problems and patterns referenced by historical data should generally be deactivated rather than deleted.

## Inactive problem

- excluded from new recommendations
- excluded from daily assignment
- retained for historical attempts/journal/calendar context

## Inactive pattern

- excluded from new recommendation logic where appropriate
- retained for historical analytics and journal interpretation

This protects referential integrity and historical meaning.

---

# 93. External URL Validation

Problem records should contain a platform and URL.

The application should validate URL shape before storing it.

For external navigation:

- use standard secure URL handling
- open in a deliberate new tab where UX requires it
- do not construct arbitrary destinations from untrusted user-provided fragments
- do not imply verification from the external platform

---

# 94. Input Validation Architecture

Validation exists at multiple levels:

```text
UI validation
   ↓
server runtime validation
   ↓
domain validation
   ↓
database constraints
```

Zod is the main runtime schema tool.

Never trust:

- hidden form fields
- disabled inputs
- client-side enums
- local state
- URLs returned by the browser without validation

---

# 95. Security Threat Model — Core Risks

## Cross-user data access

Mitigation:

- authenticated session
- ownership checks
- RLS
- foreign-key ownership conventions
- E2E security tests

## Client tampering

Mitigation:

- server-side validation
- derive user ID from session
- never trust client-computed metrics

## Duplicate mutations

Mitigation:

- transactions
- unique constraints
- idempotency

## Information leakage before recall

Mitigation:

- server-generated view model
- do not send hidden target information prematurely

## Privileged credential leakage

Mitigation:

- service keys server-only
- environment variable discipline
- no sensitive values in client bundles

## Open redirect / unsafe external link

Mitigation:

- validate stored URLs
- constrain allowed schemes
- use known external platforms where possible

---

# 96. Environment Variables

Maintain clear separation between:

```text
NEXT_PUBLIC_*
```

and server-only secrets.

Conceptual configuration:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY       # server only
DATABASE_URL                    # server only
SENTRY_DSN                      # based on implementation
```

Never prefix secrets intended to remain server-only with `NEXT_PUBLIC_`.

Validate required environment variables during application startup/build.

---

# 97. Secret Management

Secrets belong in:

- Vercel environment variables
- Supabase project secrets
- local `.env.local` for development

Never commit secrets to Git.

Do not log:

- access tokens
- refresh tokens
- service-role keys
- database credentials

---

# 98. Database Migration Strategy

All schema changes must be represented as migrations.

Do not rely on clicking random changes in the dashboard and forgetting how they happened.

Migration flow:

```text
local schema change
    ↓
Drizzle migration / SQL migration
    ↓
review
    ↓
apply to development
    ↓
run tests
    ↓
apply to production
```

Migration names should explain the change.

---

# 99. Safe Migration Rules

Prefer additive migrations first.

For destructive changes:

```text
add replacement
    ↓
backfill
    ↓
update application
    ↓
validate production
    ↓
remove old structure later
```

Avoid a one-shot breaking migration when a safe transition is possible.

---

# 100. Seed Data Strategy

Development/demo environments should have realistic seed data.

Seed data may include:

- problems
- patterns
- topics
- problem-pattern relationships
- problem-topic relationships
- weekly curriculum

Seed data must not be confused with real user progress.

User progress is always produced from actual user events.

---

# 101. Data Export Architecture

Settings exposes Export My Data.

The export should be generated from authoritative user-owned records.

Recommended export contents:

```text
profile
user settings
attempts
attempt mistakes
journal entries
revisions/current schedules
revision history
daily tasks
daily activity
contest participations
```

Do not include another user's data or infrastructure credentials.

A future implementation can provide JSON as the simplest lossless export format.

---

# 102. Account Deletion Architecture

Delete Account is destructive.

The flow must require explicit confirmation.

Depending on the final auth configuration, account deletion should coordinate:

```text
application user data deletion
    ↓
auth identity deletion or provider-supported closure
```

Foreign keys and cascading policies must be reviewed before production implementation.

Do not leave orphaned private records.

---

# 103. Observability Architecture

Production observability should answer:

- what failed?
- which user flow failed?
- which subsystem failed?
- what was the request/correlation context?
- can the operation be retried safely?

Use structured server logging.

Sentry captures unexpected application exceptions and relevant context.

---

# 104. Logging Rules

Log useful diagnostics such as:

```text
operation
user ID hash or safe internal identifier where appropriate
request ID
entity ID
error type
duration
```

Do not log sensitive values.

Do not log full user Journal text by default.

Learning notes may contain private content and should be treated as user data.

---

# 105. Performance Strategy

The expected scale is modest, but the architecture should remain efficient.

## Primary techniques

- server rendering
- indexed PostgreSQL queries
- pagination for large libraries
- targeted selects
- avoid N+1 queries
- lightweight client state
- controlled revalidation
- batched aggregation where practical

Do not optimize based on assumptions before measuring.

---

# 106. Problems List Performance

The Problems page must support hundreds or thousands of problems.

Use:

- indexed filtering columns
- database-side filtering
- pagination/load-more
- stable ordering
- URL query state

Do not load every problem row into the browser just to filter it locally.

---

# 107. Search Strategy

MVP search can remain PostgreSQL-based.

Search target:

- title
- keywords
- patterns
- topics

For moderate problem volume, PostgreSQL full-text/trigram techniques can be introduced if needed.

Do not introduce Elasticsearch until there is a measured need that PostgreSQL cannot satisfy.

---

# 108. Analytics Query Performance

Analytics should use database aggregation where sensible.

Avoid fetching thousands of raw rows into Node.js merely to count them if PostgreSQL can perform the aggregation efficiently.

However, complex domain scoring may be clearer in TypeScript.

Preferred boundary:

```text
SQL
→ retrieve compact evidence/aggregates

TypeScript domain code
→ interpret and classify
```

Do not turn Analytics into an uncontrolled collection of complex one-off SQL queries.

---

# 109. N+1 Query Prevention

Common danger:

```text
load 100 journal entries
    ↓
query problem for each row
```

Prefer:

- joins
- batched queries
- `IN` queries
- preloaded relationships where justified

The repository layer should make efficient query composition straightforward.

---

# 110. Pagination

Use pagination/load-more for:

- Problems
- Journal
- future large revision history

Use cursor-based pagination if list growth or stable ordering warrants it.

Offset pagination is acceptable for small/moderate datasets when simpler.

---

# 111. Mobile and Responsive Architecture

Responsive behavior belongs primarily to the presentation/design layer.

The backend should return semantic data rather than device-specific business rules.

Mobile layout changes include:

- sidebar → drawer
- sections → stacked
- filters → sheet/drawer
- calendar detail → below calendar
- settings modal → near full-screen

The business logic remains identical.

---

# 112. Accessibility Architecture

Accessibility is part of the component system, not a page-by-page afterthought.

Requirements:

- semantic HTML
- keyboard navigation
- visible focus states
- labeled inputs
- proper dialog behavior
- screen-reader-friendly controls
- non-color-only state communication

Settings modal specifically requires:

```text
focus trap
Escape close
focus return
inert background
```

---

# 113. UI State Architecture

Every data-driven feature should consider:

```text
loading
empty
success
error
disabled
```

Loading states preserve layout where possible.

Empty states explain:

1. what is empty
2. why
3. what the user can do next

Errors are concise and actionable.

---

# 114. Dashboard Data Composition

Dashboard should be assembled from focused server-side queries/services.

Conceptually:

```text
getCurrentUser()
getTodayTasks()
getTaskProgress()
getTodayRevisionSummary()
getCurrentWeekCurriculum()
getFocusAreas()
getStreak()
```

The Dashboard presentation layer composes the result.

It must not independently recalculate scheduler rules.

---

# 115. Problem Page Data Composition

The Problems page should support:

```text
search
status
 difficulty
pattern
topic
sort
pagination
```

Filtering and sorting are preferably represented in the URL.

Example:

```text
/problems?status=unsolved&difficulty=medium&pattern=binary-search&sort=recommended
```

The server reads these parameters and queries the database accordingly.

---

# 116. Problem Workspace Data Composition

Initial workspace payload:

```text
problem identity
platform
external URL
difficulty
attempt context
```

Do not include target pattern when it should remain hidden.

After submission, the application can return:

```text
attempt result
mistakes
journal handoff status
revision status
```

---

# 117. Journal Data Composition

The Journal page needs:

```text
entry list
selected entry
problem metadata
pattern
recognition state
```

The repository should fetch enough joined data for the two-column interface efficiently.

The canonical Journal record remains a database record, not a client cache.

---

# 118. Revision Data Composition

Pre-recall response:

```text
due item metadata only
```

Post-recall response:

```text
user answers
current journal knowledge
rating controls
```

Post-completion response:

```text
result
next review date
next action
```

This supports progressive disclosure and prevents accidental answer leakage.

---

# 119. Analytics Data Composition

Analytics should be a server-produced view model.

Conceptual structure:

```ts
{
  unlocked: boolean,
  summary: {...},
  trend: [...],
  focusAreas: [...],
  recurringMistakes: [...],
  nextFocus: {...}
}
```

The UI should not reconstruct business metrics from raw events.

---

# 120. Calendar Data Composition

The calendar page can query a month range and selected date.

Month response should provide enough activity metadata to determine intensity.

Selected-day response should provide:

- solved problems
- revision entries
- contest participation

It should not return unnecessary analytics payloads.

---

# 121. Settings Architecture

Settings is modal state inside the authenticated application shell.

Read:

```text
profile
user_settings
```

Write:

```text
update profile fields
update practice preferences
update revision preferences
update notification preferences
update theme
```

Settings changes apply to future scheduling.

They do not rewrite historical tasks or completed activity.

---

# 122. Settings vs Product Rules

User settings may influence:

- normal problem quantity
- difficulty preference
- revision target
- practice days
- notifications
- theme

Settings must not override core product invariants:

- Saturday is revision-only
- Sunday is contest-only
- Analytics unlock threshold
- Calendar color semantics

This prevents settings from becoming a hidden business-rule editor.

---

# 123. Notifications Architecture

Notifications are presentation/infrastructure behavior.

They must not alter learning state.

Turning reminders off must not modify:

- tasks
- revisions
- streaks
- analytics

A future notification subsystem can subscribe to due/task state without becoming the owner of those states.

---

# 124. Scheduler Infrastructure

Supabase Cron/pg_cron is the first-line scheduler.

Its responsibility is only to trigger work.

Conceptually:

```text
Cron
 ↓
trusted server endpoint/function
 ↓
ensureDailyTasks / maintenance command
```

The core selection algorithm remains in the application/domain layer.

---

# 125. Cron Security

Any externally reachable cron endpoint must authenticate the invocation using a non-user secret or a platform-supported secure mechanism.

It must not accept arbitrary `user_id` values from an unauthenticated caller and generate tasks directly.

For batch processing:

```text
trusted trigger
   ↓
server obtains eligible users
   ↓
server iterates safely
   ↓
ensureDailyTasks per user
```

---

# 126. Cron Idempotency

A cron invocation may run:

- twice
- late
- after a timeout
- concurrently with Dashboard-triggered generation

Therefore the same `ensureDailyTasks` idempotency rules apply.

The scheduler must be safe regardless of trigger source.

---

# 127. Future Background Job Upgrade Path

If later requirements introduce:

- email delivery
- long-running AI tasks
- retry-heavy workflows
- large batch processing
- notification fan-out

an explicit background job system such as Inngest/Trigger.dev may be introduced.

Do not add it in MVP solely for architectural fashion.

---

# 128. API Boundary for Future Integrations

Future integrations should be adapters around the domain, not direct dependencies spread across UI components.

Example:

```text
/domain/contests
/infrastructure/platforms/leetcode
```

The domain asks:

```text
getTodayContest()
```

The adapter handles:

```text
external API / scraping / URL resolution
```

This keeps external instability isolated.

---

# 129. AI Integration Boundary — Future Only

AI is explicitly not required for core MVP correctness.

Future AI features should be isolated behind services such as:

```text
HintService
JournalAssistService
InterviewCoachService
```

AI output must not become authoritative for:

- attempt outcome
- revision result
- analytics counts
- streak
- user history

AI may propose; deterministic application logic decides.

---

# 130. Recommendation Explanation Architecture

Recommendations should have a compact explanation source.

Examples:

```text
Matches this week's focus
Recursion is currently a Focus Area
Not practiced recently
Difficulty fits recent performance
```

A full generative explanation engine is unnecessary.

A deterministic explanation enum/string is enough.

---

# 131. Security of Recommendation Explanations

Explanation text is generated from trusted server-side facts.

Do not interpolate untrusted raw text into HTML.

Prefer structured reason codes:

```text
CURRICULUM_MATCH
WEAK_PATTERN
NOVELTY
DIFFICULTY_FIT
RECENT_GAP
```

The UI maps reason codes to display copy.

---

# 132. Testing Philosophy

Testing should focus on business-critical correctness rather than maximizing arbitrary coverage percentage.

Highest priority:

1. revision logic
2. daily scheduler
3. attempt completion
4. recommendation constraints
5. analytics formulas
6. timezone handling
7. security/ownership
8. concurrency/idempotency

---

# 133. Unit Testing — Domain

Use Vitest for pure calculations.

Examples:

```text
calculateInitialRevisionInterval
calculateNextRevisionInterval
rankRevisionCandidates
calculatePatternScore
calculatePatternStatus
calculateStreak
calculateIndependentSolveRate
calculateRevisionRecall
selectDifficultyMode
scoreProblemCandidate
```

These tests should use table-driven cases where helpful.

---

# 134. Unit Testing — Edge Cases

Test:

```text
zero data
one data point
exact thresholds
boundary dates
empty candidate pool
full candidate pool
multiple overdue revisions
failure streak
partial recall
forgot recall
maximum ladder interval
```

The purpose is to prevent silent edge-case regressions.

---

# 135. Integration Testing — Database

Integration tests should cover:

- foreign keys
- unique constraints
- transaction rollback
- journal uniqueness
- revision uniqueness
- daily task uniqueness
- user isolation
- derived activity correctness where feasible

Use an isolated test database/project environment.

Do not run destructive tests against production.

---

# 136. RLS Testing

Security tests are mandatory.

At minimum:

```text
User A cannot read User B attempts
User A cannot edit User B journal
User A cannot submit User B revision
User A cannot mutate User B tasks
User A cannot access User B settings
```

Also test direct query paths where RLS applies.

---

# 137. End-to-End Test — Core Learning Loop

Playwright should cover:

```text
signup/login
  ↓
Dashboard
  ↓
open daily problem
  ↓
Before You Code
  ↓
external link available
  ↓
record outcome
  ↓
Journal creation/update
  ↓
revision exists
  ↓
Revision recall
  ↓
rate recall
  ↓
next review scheduled
```

The exact external platform itself need not be automated; the DSA OS transitions can be tested around the external link.

---

# 138. End-to-End Test — Weekly Rules

Test at least:

```text
Monday → 2 new + 1 revision
Friday → 2 new + 1 revision
Saturday → up to 3 revisions, 0 new
Sunday → contest only
```

Also test user settings do not break the structural day type.

---

# 139. End-to-End Test — Analytics Unlock

Test:

```text
9 distinct solved → locked
10 distinct solved → unlocked
11th repeated solve of existing problem → still +0 distinct
```

Also test failed attempts do not unlock Analytics.

---

# 140. End-to-End Test — Calendar

Test:

```text
0 solved → neutral
1 solved → light green
2 solved → dark green
Saturday revisions → history details, not fake solved intensity
Sunday contest → contest detail
```

---

# 141. End-to-End Test — Timezone Boundaries

Explicitly test events around midnight in multiple configured timezones.

Example:

```text
23:59 local
00:01 local
```

Verify:

- two local dates where appropriate
- streak calculation
- Calendar placement
- daily task day identity

---

# 142. Build Pipeline

Recommended CI sequence:

```text
checkout
  ↓
install dependencies
  ↓
validate environment contract
  ↓
lint
  ↓
typecheck
  ↓
unit tests
  ↓
integration tests
  ↓
build
  ↓
E2E smoke tests in supported environment
```

A production deployment should not proceed when mandatory checks fail.

---

# 143. Deployment Architecture

Production:

```text
GitHub
   ↓
Vercel build
   ↓
Next.js application
   ↓
Supabase PostgreSQL/Auth
```

Preview environments should use a safe development/test database configuration rather than production data.

---

# 144. Environment Separation

Use at least:

```text
development
preview/test
production
```

Never use production credentials in local development.

Avoid using real user learning data as casual demo seed data.

---

# 145. Preview Deployments

Each meaningful branch/PR should ideally produce a preview deployment.

Benefits:

- UI review
- integration verification
- safer regression detection
- easier collaboration

Preview URLs must use isolated or controlled data access.

---

# 146. Production Database Safety

Production database changes should:

- use migrations
- be reviewed
- have a rollback/forward-fix plan
- preserve existing history
- avoid unnecessary destructive changes

Backups/restoration procedures should be verified before production launch.

---

# 147. Backup / Recovery Principles

The recovery model assumes:

```text
authoritative event data
```

is the most valuable information.

Derived data such as:

- daily activity
- analytics
- cached streak

should be reconstructable.

This reduces disaster-recovery complexity.

---

# 148. Failure Recovery by Subsystem

## Scheduler failure

Preserve existing tasks.

Retry safely.

Use fallback selection where eligible.

## Revision failure

Do not destroy the previous valid schedule.

## Analytics failure

Show unavailable/insufficient-data state.

## Daily activity inconsistency

Rebuild from source events.

## Recommendation failure

Use safe deterministic fallback candidates.

---

# 149. State Machine Philosophy

Where a domain concept has lifecycle states, encode explicit transitions.

Examples:

### Attempt

```text
not_started
→ started
→ completed
```

### Daily task

Conceptually:

```text
assigned
→ in_progress (if needed)
→ completed
```

### Revision

```text
scheduled
→ due
→ completed
→ rescheduled
```

### Analytics

```text
insufficient_data
→ unlocked
```

Invalid transitions must be rejected.

---

# 150. Do Not Infer State from Presentation

Do not infer:

```text
button disabled
→ task completed
```

or:

```text
card disappeared
→ revision completed
```

The database state is authoritative.

UI state is a projection.

---

# 151. Derived Status Strategy

Avoid storing duplicate values like:

```text
problem.is_solved
problem.needs_revision
problem.mastery_level
```

unless a concrete performance requirement later justifies them.

Prefer deriving status from authoritative attempts/revisions.

If a denormalized cache is later introduced, it must have a rebuild path.

---

# 152. Problem Status Derivation

A problem's user-specific status can be derived from attempt history.

Examples:

```text
no attempts
→ Not attempted

latest successful outcome = independent
→ Solved independently

latest successful outcome = hint
→ Solved with hint
```

`Needs Revision` is associated with revision state, not a permanently overwritten problem truth.

---

# 153. Journal Update Semantics

Repeated attempt completion should not blindly overwrite the Journal with incomplete data.

Recommended behavior:

```text
existing journal + new user edits
        ↓
explicit update / upsert
```

The user's canonical lesson is curated knowledge.

The system should not destroy a valuable Journal entry merely because a later attempt has blank fields.

---

# 154. Revision and Journal Consistency

Revision reveals the current Journal content.

Therefore:

```text
Journal edited
   ↓
future revision reveal uses updated Journal
```

Historical `revision_attempt` records continue to reference what the user answered historically.

This preserves both current knowledge and historical recall evidence.

---

# 155. Recommendation and Manual Browsing Separation

Problems page browsing and recommendation are different operations.

Manual filter:

```text
user asks to see Medium Binary Search problems
```

Recommendation:

```text
system decides what this user should practice next
```

A user's manual browsing should not mutate recommendation weights.

---

# 156. Dashboard and Scheduler Separation

Dashboard is a presentation layer.

Scheduler is a decision engine.

The Dashboard reads:

```text
daily_tasks
```

It does not independently choose the day's problems.

This prevents contradictory task lists between screens.

---

# 157. Dashboard and Revision Separation

Dashboard may summarize:

```text
revision due count
representative problem
```

Revision engine owns:

```text
due candidate definition
priority
interval transition
schedule state
```

Dashboard must call the same revision service rather than duplicating “due” logic.

---

# 158. Calendar and Analytics Separation

Calendar:

> What happened?

Analytics:

> What does it mean?

Calendar should not display pattern mastery or interpret weakness.

Analytics should not become a detailed history archive.

---

# 159. Problem Workspace and Journal Separation

Workspace:

> What happened while solving?

Journal:

> What should I remember?

Attempt state should not become a second copy of the Journal.

The attempt may hold the raw initial approach and outcome; Journal stores the curated lesson.

---

# 160. Domain Data Contracts

Use explicit input/output types at application boundaries.

Example:

```ts
type CompleteAttemptCommand = {
  problemId: string;
  outcome: AttemptOutcome;
  initialApproach?: string;
  mistakeIds: string[];
  durationSeconds?: number;
};
```

The exact type names are implementation details.

The important rule is that commands are explicit rather than accepting arbitrary `Record<string, unknown>` blobs.

---

# 161. Read Model Contracts

UI-facing server functions should return view models rather than raw database rows when the screen needs a composed representation.

Example:

```ts
type DashboardViewModel = {
  localDate: string;
  dayType: 'weekday' | 'saturday' | 'sunday';
  streak: number;
  mission: ...;
  revisionSummary: ...;
  week: ...;
  focusAreas: ...;
};
```

This prevents components from becoming database-aware.

---

# 162. Repository Pattern Guidance

Repositories are useful when they make database access cohesive.

Example responsibilities:

```text
ProblemRepository
AttemptRepository
RevisionRepository
JournalRepository
DailyTaskRepository
AnalyticsRepository
```

Do not create one repository per trivial table if that creates meaningless abstraction.

Use repository boundaries where they correspond to application/domain concepts.

---

# 163. When to Use SQL Directly

Drizzle's typed query builder is preferred, but direct SQL is appropriate for:

- advanced aggregation
- PostgreSQL-specific functions
- performance-sensitive queries
- migrations
- constraints/index definitions

The key is explicitness and reviewability.

Avoid hiding important database behavior behind excessive ORM abstractions.

---

# 164. Transaction Helper

Create a shared transaction helper with consistent error mapping.

Conceptually:

```text
withTransaction(async tx => {
  ...
})
```

It should:

- begin transaction
- execute callback
- commit on success
- rollback on failure
- convert known conflicts consistently

Do not spread transaction boilerplate randomly across the codebase.

---

# 165. Locking Strategy

Use row-level locking or equivalent only where concurrent transitions make it necessary.

Likely candidates:

- revision completion
- task completion
- task generation conflicts
- one-attempt logical completion

Do not lock large tables or broad query ranges unnecessarily.

---

# 166. Safe Retry Strategy

A request may time out after the server commits.

Therefore the browser may retry an operation whose first attempt actually succeeded.

The server must recognize the logical duplicate rather than performing the operation twice.

This is one reason idempotency is a business requirement, not merely a network feature.

---

# 167. Client Retry Policy

Do not blindly auto-retry every mutation.

Safe read retries are easier.

For writes, retry only when:

- request identity is stable
- operation is idempotent
- the server can safely recognize duplicates

Critical historical writes should use explicit mutation IDs where needed.

---

# 168. Mutation Identity

For operations where duplicate detection is important, consider an idempotency key such as:

```text
UUID generated by client
```

The server persists/recognizes the key within the appropriate ownership scope.

Do not use a timestamp alone as an idempotency key.

---

# 169. Analytics Consistency

Analytics may lag immediately after a mutation if an asynchronous cache is ever introduced.

For MVP, prefer fresh server computation or reliable revalidation.

Never display a metric that contradicts the just-completed authoritative event due to stale client state.

---

# 170. Performance Budget Philosophy

No universal microsecond-level target is necessary for MVP.

Use sensible goals:

- server-rendered primary screens should feel immediate under normal conditions
- simple mutations should return quickly enough for interactive use
- expensive analytics should remain bounded
- problem lists should remain responsive at thousands of items

Measure real slow paths with logs/monitoring before introducing infrastructure complexity.

---

# 171. Frontend Bundle Discipline

Avoid making root layout client-side just because one child needs interaction.

Keep:

```text
AppShell → Server where possible
SettingsDialog → Client
RevisionRecallForm → Client
```

Do not import browser-only libraries into server components.

Do not ship large chart/editor libraries to every route when route-level loading is sufficient.

---

# 172. Component Architecture

Build reusable primitives first:

```text
Button
Input
Textarea
Select
Dialog
Badge
StatusBadge
DifficultyBadge
ProblemRow
RevisionRow
JournalEntryRow
Metric
CalendarDay
```

Then compose screen-specific components.

Do not copy-paste nearly identical card/row implementations across screens.

---

# 173. Domain/UI Coupling Rules

Allowed:

```text
UI → application action
UI → view model
```

Not allowed:

```text
UI → SQL
UI → Drizzle
UI → recommendation constants
UI → revision interval constants
UI → raw Supabase service role
```

This is one of the strongest architectural rules in the project.

---

# 174. Testing Domain Rules Independently

The revision engine should be testable without:

- React
- Next.js
- Supabase
- browser
- external platform

Similarly, recommendation scoring should be testable with plain input objects.

This makes the most important logic easy to reason about and defend in an interview.

---

# 175. Test Data Builders

Create reusable test builders/factories.

Examples:

```text
buildUser()
buildProblem()
buildAttempt()
buildRevision()
buildJournalEntry()
buildPatternEvidence()
```

Use explicit overrides so edge cases are obvious.

Avoid random data in core business tests unless randomness is the behavior being tested.

---

# 176. Determinism Requirements

Given the same:

```text
user state
current local date
curriculum
problem pool
```

recommendation and scheduling decisions should produce the same result unless the candidate set changed.

This helps:

- debugging
- testing
- support
- user trust
- reproducibility

---

# 177. Randomness Policy

Randomness is not needed for core MVP recommendation.

If later used for variety, introduce a controlled tie-breaker after deterministic ranking.

Do not let uncontrolled randomness create an unstable Dashboard on every refresh.

---

# 178. Daily Scheduler: Refresh Behavior

First Dashboard load:

```text
ensureDailyTasks()
→ tasks created if absent
```

Second load:

```text
ensureDailyTasks()
→ existing tasks returned
```

No task replacement should occur simply because ranking changed.

---

# 179. Daily Scheduler: Insufficient Problems

When two new problems cannot be found:

```text
do not fail the entire Dashboard
```

Use the fallback sequence.

If still impossible:

- create only the valid tasks available
- display a clear state
- do not create fake placeholders
- allow the user to browse Problems manually

The app remains usable even if content data is incomplete.

---

# 180. Saturday: Insufficient Revisions

If only two eligible revisions exist:

```text
assign 2
```

Do not create:

```text
Revision A
Revision A duplicate
Revision B
```

A quota is an upper bound, not a requirement to manufacture work.

---

# 181. Sunday: Contest Failure

If contest retrieval/opening fails:

- Dashboard remains available
- show a safe fallback link when configured
- allow manual participation recording where product behavior permits
- do not create normal problem/revision tasks

---

# 182. Analytics: Missing Data

Examples:

```text
0 revision attempts
→ Revision Recall unavailable

1 pattern attempt
→ insufficient pattern evidence

9 solved
→ Analytics locked
```

Do not turn “not enough data” into:

```text
0%
```

Missing data is not failure evidence.

---

# 183. Data Quality Guardrails

The application should reject obviously impossible states.

Examples:

```text
completed task without underlying event
revision due date earlier than invalid range
negative duration
invalid enum
journal points to inactive/deleted impossible record
```

Database constraints handle simple invariants; domain validation handles semantic invariants.

---

# 184. Observability for Business Operations

Important operations should emit structured operation logs.

Examples:

```text
DAILY_TASKS_GENERATED
ATTEMPT_COMPLETED
REVISION_COMPLETED
CONTEST_RECORDED
ANALYTICS_UNLOCKED
```

Do not log private Journal content.

These operational events are for diagnostics, not a replacement for authoritative business records unless explicitly modeled as such.

---

# 185. Auditability

For MVP, authoritative history plus standard application logs are sufficient.

For future admin tooling, consider explicit audit records for:

- manual task replanning
- content changes
- user-data correction
- algorithm version changes

Never silently rewrite historical user events from an admin panel.

---

# 186. Content Administration — Future Boundary

Problem/pattern content may eventually need administrative tooling.

The admin layer should remain separate from normal user flows.

Admin actions may:

- create problems
- edit metadata
- deactivate problems
- create patterns
- update curriculum

They must not:

- mutate user attempt history
- fake user activity
- directly mark user mastery

---

# 187. Data Access Review Checklist

Every new database query should answer:

1. Is this public or user-owned data?
2. What is the ownership condition?
3. Is pagination needed?
4. Are indexes available?
5. Can this cause N+1 queries?
6. Does it need a transaction?
7. Does it expose information that should remain hidden before recall?
8. Is the result safe to cache?

---

# 188. Mutation Review Checklist

Every mutation should answer:

1. Who is allowed to perform it?
2. What state must exist before it starts?
3. What state transition occurs?
4. What records change?
5. Which records are historical?
6. What happens on retry?
7. What happens on concurrent submission?
8. What happens if a dependent step fails?
9. Is the operation transactional?
10. Can it be rebuilt or audited later?

---

# 189. Feature Addition Checklist

Before adding a new feature ask:

```text
What user problem does it solve?
Which screen owns the behavior?
Which authoritative data records it needs?
Which domain module owns the business rule?
Which Server Action/Route Handler exposes it?
Does it need new tables?
Does it change security boundaries?
Does it introduce a new background job?
How is it tested?
What existing behavior could it contradict?
```

If these answers are unclear, implementation should not start.

---

# 190. Non-Goals for MVP

The architecture deliberately does not implement:

- in-browser arbitrary code execution
- online judge
- AI hint generation
- AI interview coaching
- social graph
- followers
- leaderboards
- subscriptions
- payments
- browser extension
- native mobile application
- complex contest analytics
- large push-notification platform
- Notion-style generic notes

The architecture may leave extension points, but it should not implement infrastructure for features that do not currently exist.

---

# 191. Interview Mode Boundary

Interview Mode is future/deferred.

When implemented later, it should reuse:

- Problems
- Attempts
- Patterns
- Mistakes
- Analytics

but introduce a distinct attempt context that enforces:

- mixed selection
- no pattern reveal
- no hints
- no Journal access during solving
- explicit timer
- post-session report

Do not implement it by adding conditionals everywhere in the normal Problem Workspace.

A dedicated mode/domain boundary is cleaner.

---

# 192. Future Notification Boundary

Notifications should consume existing state:

```text
due revisions
upcoming practice
contest day
```

They must not create a second concept of “due” or “today.”

The notification service should call existing scheduling/revision services.

---

# 193. Future AI Boundary

AI should consume a deliberately filtered context.

Example:

```text
Journal context
Problem metadata
Recent mistake evidence
```

But AI cannot directly write:

```text
solved = true
revision = tomorrow
```

without going through deterministic application rules.

---

# 194. Architecture Decision Records

The following decisions are intentional.

## ADR-001 — Modular monolith

**Decision:** Use one Next.js application with modular domain boundaries.

**Reason:** DSA OS does not require distributed deployment; modularity provides most of the architectural benefits without operational overhead.

**Rejected:** Microservices.

---

## ADR-002 — PostgreSQL

**Decision:** PostgreSQL is the authoritative datastore.

**Reason:** The domain is relational, transactional, and aggregation-heavy.

**Rejected:** MongoDB as primary datastore.

---

## ADR-003 — Supabase

**Decision:** Use Supabase for PostgreSQL hosting, Auth, RLS, database tooling and cron infrastructure.

**Reason:** It provides integrated infrastructure with a strong PostgreSQL model.

---

## ADR-004 — Next.js server-first architecture

**Decision:** Use Server Components for data-driven pages and Server Actions for normal internal mutations.

**Reason:** Keeps personalized data close to the server and avoids unnecessary API layers.

**Rejected:** Separate Express/NestJS backend for MVP.

---

## ADR-005 — Drizzle

**Decision:** Use Drizzle for typed SQL/schema/migrations, with clearly controlled Supabase access where request-context/RLS behavior is specifically required.

**Reason:** Strong PostgreSQL alignment and explicit SQL-style programming.

**Rejected:** Heavy ORM abstraction as the default.

---

## ADR-006 — Zod

**Decision:** Runtime validation uses Zod.

**Reason:** TypeScript types disappear at runtime; user input must be validated explicitly.

---

## ADR-007 — No Redis initially

**Decision:** PostgreSQL plus application/server caching is sufficient.

**Reason:** Expected scale does not justify another stateful infrastructure dependency.

---

## ADR-008 — No GraphQL

**Decision:** No GraphQL for MVP.

**Reason:** Frontend and backend are controlled together and the internal domain is small enough for Server Actions/query functions.

---

## ADR-009 — No AI dependency

**Decision:** AI is not required for core behavior.

**Reason:** DSA OS's learning state must be deterministic, testable and explainable.

---

## ADR-010 — Event history plus current state

**Decision:** Store historical event records separately from mutable current state.

**Reason:** Enables auditability, rebuildability and analytics correctness.

---

# 195. Technical Invariants

The following architecture-level invariants must hold.

1. Business-critical decisions are server-authoritative.
2. Browser state is never the only source of truth.
3. Every user-owned operation derives ownership from the authenticated session.
4. RLS protects user-owned data where applicable.
5. Historical attempts are preserved.
6. Historical revision attempts are preserved.
7. Current revision schedule is separate from revision history.
8. Daily task generation is idempotent.
9. Daily tasks are stable after creation.
10. Saturday never receives normal new-problem tasks.
11. Sunday never receives normal new-problem or revision tasks.
12. Failed attempts are not successful solves.
13. Analytics unlocks only after 10 distinct successfully solved problems.
14. Missing data is not represented as false zero evidence.
15. Calendar reflects actual activity.
16. Streak derives from actual meaningful activity.
17. One current Journal entry exists per user/problem in the MVP.
18. One current Revision record exists per user/problem.
19. Recommendation logic does not create duplicate daily assignments.
20. Quotas never create fake revisions.
21. External platform completion is not claimed as independently verified in MVP.
22. Business constants are centralized.
23. Major mutations are transactional.
24. Important mutations are retry-safe.
25. User-private learning text is not unnecessarily exposed in logs.
26. Algorithm evolution does not rewrite historical events.

---

# 196. End-to-End Normal Weekday Flow

Example: Wednesday.

```text
Wednesday local date calculated
        ↓
Daily scheduler runs
        ↓
Curriculum = Binary Search + Prefix Sum
        ↓
Select:
  Problem A = weak-pattern aligned
  Problem B = curriculum reinforcement
  Revision  = highest-priority due item
        ↓
Persist daily_tasks
        ↓
Dashboard renders persisted tasks
        ↓
User opens Problem A
        ↓
Before You Code
        ↓
Pattern remains hidden
        ↓
Open external platform
        ↓
User solves independently
        ↓
completeAttempt()
        ↓
transaction:
  attempt
  mistakes
  journal
  revision
  daily task completion
  daily activity
        ↓
Dashboard/Problems/Journal/Revision revalidated
        ↓
Future scheduler sees updated evidence
```

---

# 197. End-to-End Revision Flow

```text
revision task due
    ↓
Revision page loads item
    ↓
pattern hidden
    ↓
user recalls pattern
    ↓
user recalls approach
    ↓
Check My Recall
    ↓
Journal knowledge revealed
    ↓
user self-rates
    ↓
Easy / Partial / Forgot
    ↓
completeRevision()
    ↓
transaction
    ├─ revision_attempt
    ├─ next interval
    ├─ next due date
    ├─ task completion
    └─ daily activity
    ↓
revalidate Revision/Dashboard/Calendar/Analytics
```

---

# 198. End-to-End Saturday Flow

```text
Saturday local date
      ↓
Scheduler
      ↓
find due/overdue revisions
      ↓
rank
      ↓
select up to 3
      ↓
persist revision tasks
      ↓
User completes 0–3
      ↓
Each completion updates its own revision schedule
      ↓
Daily activity records revision count
      ↓
Calendar remains primarily problem-solved based
      ↓
Streak can remain active because revisions count as meaningful activity
```

---

# 199. End-to-End Sunday Flow

```text
Sunday local date
      ↓
Scheduler creates contest task only
      ↓
Dashboard shows contest day
      ↓
User opens external contest
      ↓
returns
      ↓
records participation
      ↓
contest_participations
      ↓
daily_activity.contest_participated = true
      ↓
streak may continue
```

No ordinary problem or revision task is generated.

---

# 200. Security Failure Example

Suppose a malicious client sends:

```json
{
  "revisionId": "another-users-revision",
  "userId": "their-user-id",
  "result": "easy"
}
```

Correct behavior:

```text
server ignores client userId
        ↓
gets authenticated session user
        ↓
loads revision under authenticated ownership
        ↓
not found / forbidden
        ↓
no mutation
```

The browser must never be able to select another user's ownership context.

---

# 201. Concurrency Failure Example

Two tabs click `Check My Recall`/submit nearly simultaneously.

Correct behavior:

```text
Request A → transaction → revision history inserted
Request B → transaction → sees logical completion already exists
                                  ↓
                             safe conflict/no-op
```

End state remains:

```text
1 history record
1 schedule update
1 task completion
1 activity increment
```

---

# 202. Scheduler Failure Example

Two scheduler invocations start together.

```text
Invocation A ─┐
              ├─ daily_tasks unique boundary
Invocation B ─┘
```

One creates the tasks.

The other detects the uniqueness conflict and reuses the persisted result.

No duplicate task set is created.

---

# 203. Analytics Failure Example

If Analytics computation fails because the database query times out:

Correct:

```text
Analytics unavailable.
Please try again.
```

Incorrect:

```text
Problems Solved: 0
Revision Recall: 0%
Streak: 0
```

An infrastructure failure is not a user-performance result.

---

# 204. Content Failure Example

If the problem pool has insufficient eligible problems:

Correct:

```text
use fallback candidates
↓
assign only valid problems available
↓
show safe incomplete-plan state if necessary
```

Incorrect:

```text
invent placeholder problem
```

---

# 205. Historical Integrity Example

Suppose a revision algorithm changes from version 1 to version 2.

Correct:

```text
Past revision_attempts remain unchanged.
Future schedules use version 2.
```

Incorrect:

```text
rewrite all historic intervals/results as if version 2 always existed
```

This preserves trustworthy history.

---

# 206. Implementation Sequence

Recommended implementation order:

## Phase 1 — Foundation

```text
Next.js + TypeScript
Tailwind + shadcn
Supabase Auth
Supabase SSR integration
database migrations
base app shell
route skeleton
```

## Phase 2 — Core data

```text
problems
patterns
topics
user profile
settings
```

## Phase 3 — Attempt workflow

```text
Problem Workspace
attempt state
outcomes
mistakes
external platform launch
```

## Phase 4 — Journal

```text
Journal read/write
canonical entry uniqueness
attempt → journal handoff
```

## Phase 5 — Revision engine

```text
current schedule
revision history
due selection
interval transitions
revision completion
```

## Phase 6 — Daily scheduler

```text
weekly curriculum
daily task generation
idempotency
recommendation engine
fallbacks
```

## Phase 7 — Dashboard

```text
Today
This Week
streak
revision summary
focus areas
```

## Phase 8 — Analytics + Calendar

```text
analytics unlock
metrics
trend
pattern evidence
mistakes
calendar
streak derivation
```

## Phase 9 — Security hardening

```text
RLS tests
ownership tests
concurrency tests
input validation
error handling
```

## Phase 10 — Production hardening

```text
Sentry
CI
preview deployment
backup/recovery verification
performance review
accessibility review
```

---

# 207. Implementation Order Principle

Do not build all screens first and wire logic afterward.

Build vertical slices.

Preferred pattern:

```text
database
  ↓
domain logic
  ↓
application operation
  ↓
server query/action
  ↓
UI
  ↓
tests
```

This catches architectural problems while the feature is still small.

---

# 208. Vertical Slice Example — Revision

```text
database
  revisions
  revision_attempts

↓

domain
  nextInterval()
  duePriority()

↓

application
  completeRevision()

↓

server action
  validate/auth/execute

↓

UI
  RecallForm
  ResultButtons

↓

tests
  unit + integration + E2E
```

This is preferable to styling an entire Revision page before the underlying state transitions exist.

---

# 209. Code Review Standard

A production-quality PR should be reviewed for:

- business correctness
- security
- transaction safety
- concurrency
- duplication
- test coverage of important branches
- query efficiency
- type safety
- architectural boundaries
- UI state completeness

A feature is not considered complete merely because it renders successfully.

---

# 210. Common Anti-Patterns to Reject

## Business logic in JSX

Reject code such as:

```ts
if (day === 'Saturday') {
  // business scheduling logic
}
```

inside a UI component when that rule belongs to the scheduler.

## Duplicate due logic

Reject separate definitions of “due” in Dashboard and Revision.

## Client-owned counters

Reject:

```ts
setSolvedCount(count + 1)
```

as the authoritative progress mechanism.

## Client-owned ownership

Reject accepting:

```text
userId
```

from the browser to choose whose data to mutate.

## Recreating external platform

Reject building a LeetCode clone into the MVP.

## Fake filler data

Reject fake analytics or fake historical activity merely to make the UI look populated.

---

# 211. Architectural Smells

Watch for:

```text
components importing db
utils importing React
multiple scheduler implementations
raw SQL scattered everywhere
business constants inside components
server actions with 500-line procedures
analytics computed differently on multiple screens
duplicate Journal concepts
```

When these appear, refactor toward the established boundaries before adding more functionality.

---

# 212. Complexity Budget

Every new infrastructure dependency should justify itself.

Before adding a new service ask:

```text
What problem does it solve?
Can PostgreSQL/Next.js/Supabase already solve it?
What new failure modes does it add?
How will it be tested?
How will it be monitored?
How will it be removed later?
```

The default answer for MVP should be:

> Prefer the simpler existing component unless there is a measured need.

---

# 213. Why This Architecture Is Appropriate for DSA OS

DSA OS is neither:

```text
A static website
```

nor:

```text
A hyperscale distributed system
```

It is a data-driven personal learning application with:

- rich relational data
- authenticated user state
- historical events
- scheduled decisions
- adaptive but deterministic algorithms
- privacy requirements
- analytics
- external platform navigation

That makes the modular monolith with PostgreSQL/Supabase and Next.js a strong engineering fit.

---

# 214. Architecture Summary by Feature

| Feature | Primary technology/layer |
|---|---|
| Authentication | Supabase Auth |
| User authorization | Server checks + PostgreSQL RLS |
| Dashboard | Next.js Server Components + application services |
| Problems | Server Components + PostgreSQL queries |
| Search/filter | URL state + PostgreSQL |
| Problem Workspace | Next.js + Client Components where interactive |
| External platform | Stored `platform` + `url` |
| Attempts | Server Action + domain service + transaction |
| Mistakes | Relational records + attempt transaction |
| Journal | Server reads/writes + unique user/problem constraint |
| Revision | Revision domain engine + PostgreSQL current/history tables |
| Daily scheduling | Scheduler domain + Supabase Cron |
| Recommendations | Deterministic TypeScript domain module |
| Analytics | Server-side aggregation + domain interpretation |
| Calendar | Server read model from real activity |
| Streak | Derived domain calculation |
| Settings | Client modal + server mutation |
| Forms | React Hook Form + Zod |
| UI | React + Tailwind + shadcn/Radix |
| Icons | Lucide |
| Charts | Recharts |
| Testing | Vitest + RTL + Playwright |
| Monitoring | Sentry |
| Deployment | Vercel + Supabase |

---

# 215. Architecture Traceability Matrix

| Business requirement | Technical owner |
|---|---|
| 2 new problems Mon–Fri | Daily Scheduler |
| 1 revision Mon–Fri | Daily Scheduler + Revision Engine |
| 3 revisions Saturday | Daily Scheduler + Revision Engine |
| Contest Sunday only | Daily Scheduler + Contest Application Service |
| Stable daily assignments | `daily_tasks` + uniqueness + idempotent scheduler |
| Independent solving signal | `attempts` + Analytics domain |
| Pattern recognition signal | Journal + Analytics domain |
| Revision recall | `revision_attempts` + Analytics domain |
| 10-problem analytics unlock | Analytics domain |
| Pattern mastery | Pattern Analytics domain |
| Focus Areas | Analytics + Recommendation domains |
| Repeat-mistake detection | `attempt_mistakes` + Analytics |
| Historical Calendar | `daily_activity` + event records |
| Streak | Streak domain + daily activity |
| Cross-user isolation | Auth + authorization + RLS |
| Safe retries | Transactions + uniqueness/idempotency |
| External platform independence | Problem `platform` + `url` |
| No fake progress | Derived data from authoritative records |
| Historical immutability | Append-oriented event records |

---

# 216. Production Readiness Checklist

Before production launch, verify:

## Architecture

- [ ] business logic is outside React components
- [ ] Server Actions perform auth/validation/authorization
- [ ] domain modules are independently testable
- [ ] database access has clear boundaries

## Security

- [ ] RLS enabled where required
- [ ] cross-user access tests pass
- [ ] service-role credentials remain server-only
- [ ] user ID comes from authenticated session
- [ ] external URLs are validated
- [ ] private Journal text is not leaked into logs

## Data integrity

- [ ] journal uniqueness enforced
- [ ] revision uniqueness enforced
- [ ] daily task uniqueness enforced
- [ ] transactions cover critical mutations
- [ ] retry behavior is tested
- [ ] historical events are preserved

## Scheduling

- [ ] timezone calculations tested
- [ ] Monday–Friday schedule tested
- [ ] Saturday schedule tested
- [ ] Sunday schedule tested
- [ ] duplicate scheduler invocation tested
- [ ] fallback problem selection tested

## Revision

- [ ] initial intervals tested
- [ ] easy/partial/forgot tested
- [ ] overdue behavior tested
- [ ] quota overflow tested
- [ ] duplicate revision completion tested

## Analytics

- [ ] unlock threshold tested
- [ ] distinct-problem counting tested
- [ ] missing-data states tested
- [ ] pattern evidence threshold tested
- [ ] recommendation loop tested

## UX/platform

- [ ] external platform launch works
- [ ] pattern concealment verified at payload level
- [ ] loading/empty/error states implemented
- [ ] responsive behavior reviewed
- [ ] accessibility checks pass

## Operations

- [ ] Sentry configured
- [ ] environment variables documented
- [ ] migrations reproducible
- [ ] preview deployment verified
- [ ] production database backup/recovery understood

---

# 217. Final Architecture North Star

DSA OS should behave as one coherent system, not a collection of disconnected pages.

```text
                  WEEKLY CURRICULUM
                          │
                          ▼
                  DAILY SCHEDULER
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
        NEW PROBLEMS    REVISION     CONTEST
             │            │            │
             ▼            ▼            ▼
          ATTEMPT       RECALL     PARTICIPATION
             │            │            │
      ┌──────┼──────┐     │            │
      ▼      ▼      ▼     ▼            ▼
   Outcome Mistakes Journal Revision  Contest
      │             │       │            │
      └─────────────┴───────┴────────────┘
                          │
                          ▼
                    DAILY ACTIVITY
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
          CALENDAR      STREAK     ANALYTICS
                                      │
                              ┌───────┴────────┐
                              ▼                ▼
                         FOCUS AREAS      MISTAKES
                              │                │
                              └───────┬────────┘
                                      ▼
                             RECOMMENDATIONS
                                      │
                                      ▼
                               FUTURE TASKS
```

The architectural principles underneath this diagram are:

```text
one authoritative source per business fact
server-authoritative decisions
transactional critical mutations
idempotent scheduling and completion
historical event preservation
rebuildable derived data
explicit domain boundaries
secure user isolation
conservative use of infrastructure
```

The system should be:

> **deterministic where correctness matters, adaptive where learning benefits, conservative where data is insufficient, resilient to retries and concurrency, secure across users, and simple enough to explain.**

---

# 218. Final Engineering Rule

The most important implementation rule is:

> **Do not let the UI become the business engine.**

The browser presents state and captures intent.

The application layer authenticates, validates and orchestrates.

The domain layer decides what DSA OS means.

The database persists the authoritative facts and protects integrity.

Derived screens interpret those facts.

This separation is what allows Dashboard, Problems, Workspace, Journal, Revision, Analytics and Calendar to behave as one learning system instead of seven independent features.

---

# 219. Final Implementation Boundary

When a developer is unsure where a piece of logic belongs, use this decision rule:

```text
Is it purely visual?
→ UI/component

Is it browser interaction state?
→ client component

Is it a user operation?
→ application service / Server Action

Is it a product rule or calculation?
→ domain module

Is it persistence/query logic?
→ repository/data layer

Is it identity, secret, hosting, cron or external service wiring?
→ infrastructure

Is it a database invariant?
→ database constraint/RLS/index
```

Never solve an architectural problem by moving business logic into a convenient file merely because that file is nearby.

---

# 220. Final Status

This document defines the technical architecture for the DSA OS MVP.

It is ready to be used as the engineering blueprint for implementation.

The next implementation planning layer should translate this architecture into:

- concrete repository/file creation steps
- database migration order
- domain module APIs
- Server Action contracts
- screen-by-screen data loaders
- testing plan
- implementation milestones
- Antigravity execution prompts

Those implementation instructions must follow this architecture rather than invent a second architecture.
