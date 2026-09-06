# DSA OS — Implementation Plan

> Version: 1.0  
> Status: Final MVP execution plan / implementation source of truth  
> Audience: AI coding agents, developers, reviewers, maintainers  
> Inputs: `DSA_OS_DESIGN_SYSTEM.md`, `DSA_OS_SCREEN_SPEC.md`, `DSA_OS_BUSINESS_LOGIC.md`, `DSA_OS_DATABASE.md`, `DSA_OS_TECHNICAL_ARCHITECTURE.md`, finalized Stitch UI screenshots + HTML/MD exports

---

## 0. Purpose

This document converts the completed DSA OS product and engineering specifications into an executable, dependency-ordered implementation plan.

It does not redefine the product. It operationalizes the approved decisions so that an AI coding agent can implement the system without repeatedly making architectural choices.

The implementation must produce a working, persistent, secure, testable DSA learning application using the approved stack and behavior.

The plan is intentionally prescriptive. Where a technology, folder, boundary, workflow, validation rule, or implementation sequence is specified here, the coding agent must follow it unless a genuine repository constraint makes the instruction impossible. Any such deviation must be documented before implementation of the affected phase continues.

---

# 1. Source-of-Truth Hierarchy

The project has six major specification inputs plus Stitch visual references. They do not all have the same authority for every decision.

## 1.1 Authority order

For conflicts, use this order:

1. Finalized product decisions explicitly made after earlier drafts.
2. `DSA_OS_BUSINESS_LOGIC.md` for exact business rules and state transitions.
3. `DSA_OS_DATABASE.md` for persistence structure, constraints, and data ownership.
4. `DSA_OS_TECHNICAL_ARCHITECTURE.md` for application structure, technology boundaries, security architecture, and engineering practices.
5. `DSA_OS_SCREEN_SPEC.md` for screen behavior, route intent, and UX flow.
6. `DSA_OS_DESIGN_SYSTEM.md` for visual language, tokens, and reusable UI rules.
7. Finalized Stitch screenshots/HTML/MD exports as visual references, never as blind production source code.
8. Older/obsolete generated specifications only as historical context; never use them to reintroduce removed behavior.

## 1.2 Explicit conflict resolutions

### Daily Reflection

Do not implement Daily Reflection in the current MVP.

Older screen/design material may mention it, but the current implementation decision removes it from the MVP. Do not create a route, database table, sidebar item, dashboard task, or analytics dependency for it.

### Sunday

Sunday is contest-only.

Implement:

- one contest task
- LeetCode contest presentation
- manual participation recording
- contest participation history
- daily activity update
- streak eligibility through contest participation

Do not implement normal new-problem or revision tasks on Sunday.

### Saturday

Saturday is revision-only.

Implement up to three revision tasks and no new-problem tasks.

### Interview Mode

Interview Mode is deferred.

Do not build it into the MVP navigation or normal problem workflow. Do not add conditional branches throughout the standard Problem Workspace solely to prepare for it.

### Problem platform

Use generic `platform` + `url` fields. Do not create LeetCode-specific schema assumptions.

### Problem descriptions

Do not add a problem-description catalog field to satisfy the external coding experience. DSA OS sends the user to the external platform.

### Estimated duration

Do not store an estimated problem duration. Only record actual elapsed duration when a timer is used.

### Analytics

Full Analytics unlocks after 10 distinct successfully solved problems. Do not show misleading percentages before that threshold.

### Streak

Streak represents meaningful activity, not perfect task completion.

### Patterns

Patterns are intentionally hidden when recognition is being tested. Never reveal a target pattern prematurely in Workspace or Revision.

---

# 2. Final Product Scope to Implement

## 2.1 MVP surfaces

Implement:

- `/login`
- `/signup`
- `/dashboard`
- `/problems`
- `/problems/[id]`
- `/problems/[id]/workspace`
- `/patterns`
- `/patterns/[id]`
- `/journal`
- `/journal/[id]`
- `/revision`
- `/analytics`
- `/calendar`
- Settings modal within the authenticated application shell

Supporting/contextual experiences:

- post-attempt result state
- Pattern Journal creation/edit flow
- Revision reveal/completion state
- contest participation flow

Deferred:

- Interview Mode
- AI hints/coaching
- online judge
- in-browser arbitrary code execution
- social features
- leaderboards
- payments/subscriptions
- browser extension
- native mobile application
- advanced contest analytics
- large notification infrastructure
- generic Notes page
- standalone Weekly Plan page
- standalone Today's Plan page
- standalone Journey page
- Daily Reflection

---

# 3. Final Technology Baseline

Do not introduce substitute technologies without a documented reason and explicit review.

## 3.1 Core stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI primitives through shadcn where applicable
- Lucide React
- Supabase
- PostgreSQL
- Supabase Auth
- PostgreSQL RLS
- Drizzle ORM
- Zod
- React Hook Form
- Recharts
- date-fns
- date-fns-tz
- Vitest
- React Testing Library
- Playwright
- Sentry
- Vercel

## 3.2 Infrastructure deliberately excluded from MVP

Do not add:

- MongoDB
- Firebase as a second datastore
- Redis
- Kafka
- GraphQL
- microservices
- Kubernetes
- Elasticsearch
- a dedicated Express/NestJS backend
- a separate frontend deployment
- an AI service dependency
- a message broker

## 3.3 Architecture model

Use a modular monolith.

Conceptually:

```text
Browser
   ↓
Next.js application shell
   ↓
Server Components / Server Actions / Route Handlers
   ↓
Application + domain services
   ↓
Drizzle / approved Supabase server data-access paths
   ↓
PostgreSQL / Supabase
```

Scheduled work:

```text
Supabase Cron / pg_cron
   ↓
trusted scheduling entrypoint
   ↓
application/domain scheduling logic
   ↓
PostgreSQL transaction
```

Deployment:

```text
GitHub
   ↓
Vercel
   ↓
Next.js

Supabase
   ├── PostgreSQL
   ├── Auth
   ├── RLS
   └── Cron
```

---

# 4. Non-Negotiable Engineering Rules

These rules apply to every phase.

## 4.1 Server authority

Business-critical state transitions are server-authoritative.

The client may request an operation but may not decide the authoritative result.

Examples:

- whether an attempt counts as solved
- whether a revision is due
- next revision interval
- daily task generation
- streak value
- analytics unlock
- recommendation score
- user ownership

## 4.2 Single source of truth

The same business fact must have one authoritative source.

| Fact | Source |
|---|---|
| Problem definition | `problems` |
| Pattern definition | `patterns` |
| Topic definition | `topics` |
| User preference | `user_settings` |
| Attempt outcome | `attempts` |
| Attempt mistakes | `attempt_mistakes` |
| Journal lesson | `journal_entries` |
| Current revision schedule | `revisions` |
| Revision history | `revision_attempts` |
| Daily assignment | `daily_tasks` |
| Historical activity aggregate | `daily_activity` |
| Contest participation | `contest_participations` |

UI components must not keep hidden copies of these facts as alternative truth.

## 4.3 Historical immutability

Never overwrite historical attempt, revision-attempt, or contest records when new information arrives.

Current state may change; history stays.

## 4.4 No fake data

Production user progress must come from real records.

Do not fake:

- solved counts
- streaks
- revision results
- calendar intensity
- analytics
- pattern mastery
- focus areas

Seed data is allowed in development/demo environments only.

## 4.5 Conservative inference

Missing data is not the same as poor performance.

Never convert:

```text
no evidence
```

into:

```text
failure
```

## 4.6 Business logic location

Do not place canonical business rules inside React components.

React should orchestrate display and interaction.

Domain/application code should decide behavior.

## 4.7 Validation

Validate on the client for usability and again on the server for trust.

Zod validation on a form is not an authorization boundary.

## 4.8 Ownership

Never trust a client-provided `user_id`.

Derive the user from the authenticated session.

## 4.9 Idempotency

Important operations must be safe to retry.

At minimum:

- daily task generation
- problem completion
- revision completion
- contest participation

## 4.10 Concurrency

Assume:

- multiple tabs
- multiple devices
- duplicate clicks
- retries after network timeouts
- requests arriving almost simultaneously

Database constraints + transaction boundaries + server validation are the final correctness boundary.

## 4.11 Stable daily assignments

Once daily tasks exist, refresh must not choose a different set.

Dashboard reads persisted `daily_tasks`.

It never invents today's assignment independently.

## 4.12 Visual discipline

Use the finalized design system and screenshots as references.

Do not blindly paste Stitch-generated HTML into production.

Rebuild the UI as reusable React components with centralized tokens.

---

# 5. Implementation Workflow for the AI Coding Agent

The coding agent must work phase-by-phase.

## 5.1 Required behavior before each phase

Before changing code:

1. Read this implementation plan.
2. Read the source-of-truth documents relevant to the phase.
3. Inspect the current repository state.
4. Inspect package/configuration state.
5. Identify existing implemented functionality that must be preserved.
6. Create/modify only the files needed for the phase.
7. Avoid unrelated refactors.
8. Run the phase verification commands before claiming completion.
9. Record any deviations in `IMPLEMENTATION_NOTES.md`.

## 5.2 Forbidden behavior

The agent must not:

- silently change business rules
- silently change schema semantics
- create duplicate domain logic
- invent product features because a screen has empty space
- introduce a new architectural pattern mid-project without need
- add dependencies without checking whether the current stack already solves the problem
- replace approved libraries without reason
- add fake progress values
- expose hidden patterns during recall flows
- use client state as the authority for security or business correctness
- delete historical data merely to simplify a state transition

## 5.3 Phase completion rule

A phase is not complete until:

- implementation exists
- type checking passes
- lint passes
- affected tests pass
- migration/build checks pass when applicable
- relevant manual verification is performed
- acceptance criteria are checked

---

# 6. Target Repository Structure

Use this structure unless an equivalent structure already exists and preserves all boundaries.

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── problems/
│   │   │   └── [id]/
│   │   │       └── workspace/
│   │   ├── patterns/
│   │   │   └── [id]/
│   │   ├── journal/
│   │   │   └── [id]/
│   │   ├── revision/
│   │   ├── analytics/
│   │   └── calendar/
│   ├── api/
│   │   └── ...only when an actual HTTP endpoint is required
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── shared/
│   ├── problems/
│   ├── workspace/
│   ├── journal/
│   ├── revision/
│   ├── analytics/
│   ├── calendar/
│   └── settings/
│
├── features/
│   ├── auth/
│   ├── problems/
│   ├── attempts/
│   ├── journal/
│   ├── revisions/
│   ├── scheduling/
│   ├── analytics/
│   ├── calendar/
│   └── settings/
│
├── domain/
│   ├── attempts/
│   ├── revisions/
│   ├── scheduling/
│   ├── recommendations/
│   ├── analytics/
│   ├── streak/
│   ├── journal/
│   ├── calendar/
│   └── contest/
│
├── db/
│   ├── schema/
│   ├── queries/
│   ├── mutations/
│   ├── client.ts
│   └── migrations/
│
├── lib/
│   ├── auth/
│   ├── supabase/
│   ├── validation/
│   ├── dates/
│   ├── errors/
│   ├── logging/
│   └── utils/
│
├── config/
│   ├── product.ts
│   ├── curriculum.ts
│   └── environment.ts
│
└── types/
    └── ...shared public domain types only

supabase/
├── migrations/
└── seed.sql

tests/
├── unit/
├── integration/
└── e2e/

scripts/
├── seed/
├── maintenance/
└── verification/
```

## 6.1 Structure rule

Do not make `utils/` a dumping ground for business behavior.

If a function answers a domain question such as “which revisions are due?” or “what is the next interval?”, it belongs in the appropriate domain module.

---

# 7. Configuration and Environment Strategy

## 7.1 Required environment categories

At minimum define safe, documented environment variables for:

- public Supabase URL
- public Supabase anon/publishable key appropriate to the current Supabase project configuration
- server-only database connection information when Drizzle requires it
- server-only Supabase service-role credentials if and only if a trusted server operation needs them
- Sentry configuration
- Vercel/production environment settings as needed

Never expose service-role credentials to the browser.

## 7.2 Configuration validation

Create environment validation with Zod.

Startup/build must fail clearly when a required production environment variable is missing.

Do not log secrets.

---

# 8. Phase 0 — Repository Reconnaissance

## Objective

Understand the existing repository before implementation.

## Tasks

- inspect repository tree
- inspect `package.json`
- inspect lockfile
- inspect Next.js version
- inspect TypeScript configuration
- inspect Tailwind configuration
- inspect existing shadcn setup
- inspect existing Supabase integration
- inspect existing migrations
- inspect existing routes
- inspect existing tests
- inspect lint/format configuration
- inspect deployment configuration
- inspect any generated Stitch assets already copied into the repository

## Output

Create:

```text
IMPLEMENTATION_NOTES.md
```

with:

- current state
- blockers
- files already matching target architecture
- files that need migration/refactoring
- assumptions

## Rules

Do not delete existing code during reconnaissance.

Do not implement product features in this phase.

## Gate

Repository is understood and implementation plan can be mapped to current files.

---

# 9. Phase 1 — Application Foundation

## Objective

Create the clean, buildable Next.js foundation.

## Tasks

### Framework

- Next.js App Router
- TypeScript strict mode
- stable import aliases
- global metadata
- root layout

### Styling

Implement centralized design tokens:

```text
background      #E8EAF0
primary         #16A34A
primarySoft     #BBF7D0
success         green family
warning         #F59E0B
danger          #DC2626
text            ~#20212A
```

Add centralized spacing, radius, and shadow tokens.

Use Plus Jakarta Sans.

### UI primitives

Install/configure:

- shadcn/ui
- Radix primitives as needed
- Lucide React

Create or normalize:

- Button
- IconButton
- Input
- Textarea
- Select
- Checkbox
- Radio
- Switch
- Dialog
- Popover
- Tooltip
- Tabs
- Dropdown
- Command when useful
- Skeleton
- Toast/notification primitive as appropriate

### Layout primitives

Create:

- AppShell
- Sidebar
- Header
- PageHeader
- SectionHeader
- Surface/Card
- Modal/Dialog wrapper

## Gate

Application starts, renders shell, responsive structure works, and type/lint checks pass.

---

# 10. Phase 2 — Authentication Foundation

## Objective

Implement trustworthy user identity before private features.

## Tasks

- Supabase Auth integration
- login
- signup
- logout
- session retrieval
- auth-aware server utilities
- route protection for authenticated application routes
- anonymous-user redirect behavior
- authenticated-user redirect behavior
- session refresh/middleware strategy appropriate for the installed Next.js/Supabase versions

## User initialization transaction/flow

On successful account creation:

```text
Supabase Auth user
       ↓
profiles
       ↓
user_settings
```

Defaults:

```text
weekday new problems = 2
weekday revisions = 1
Saturday revisions = 3
difficulty = adaptive
revision mode = adaptive
practice reminder = enabled
revision reminder = enabled
theme = system
```

No avatar requirement.

## Security requirements

- derive identity from auth session
- never trust client `user_id`
- protect private routes
- do not expose service-role credentials

## Tests

- signup creates profile
- signup creates settings
- login restores session
- logout removes access
- unauthenticated access redirects
- authenticated user cannot use another user's identifier to load private data

## Gate

A new user can sign up, sign in, reach the authenticated shell, and sign out successfully.

---

# 11. Phase 3 — Database Schema and Migrations

## Objective

Implement the approved PostgreSQL schema exactly enough to support every current product rule.

## Tables

Implement:

1. `profiles`
2. `user_settings`
3. `problems`
4. `patterns`
5. `topics`
6. `problem_patterns`
7. `problem_topics`
8. `mistakes`
9. `attempts`
10. `attempt_mistakes`
11. `journal_entries`
12. `revisions`
13. `revision_attempts`
14. `daily_tasks`
15. `daily_activity`
16. `contest_participations`
17. `weekly_curriculum`

## Required relationships

### Identity

```text
auth.users → profiles
profiles → user_settings
```

### Problems

```text
problems ↔ patterns
problems ↔ topics
```

### Learning history

```text
profiles → attempts → problems
attempts ↔ mistakes
journal_entries → problems/patterns/attempts
revisions → problems/journal_entries
revision_attempts → revisions
```

### Planning/history

```text
daily_tasks → problems/revisions
profiles → daily_activity
profiles → contest_participations
weekly_curriculum → scheduler
```

## Constraints to implement

### Problems

- non-empty title
- unique slug
- controlled difficulty: `easy | medium | hard`
- controlled platform: `leetcode | geeksforgeeks | hackerrank | codeforces | codechef | other`
- valid URL at application layer
- active/inactive state

### Patterns

- unique slug
- active/inactive state

### Topics

- unique slug
- active/inactive state

### Problem-pattern

Composite key:

```text
(problem_id, pattern_id)
```

### Problem-topic

Composite key:

```text
(problem_id, topic_id)
```

### Attempts

- owner required
- problem required
- result required
- duration non-negative
- `completed_at >= started_at` when both exist

### Attempt-mistakes

Composite key:

```text
(attempt_id, mistake_id)
```

### Journal

Unique:

```text
(user_id, problem_id)
```

One current canonical journal entry per user/problem.

### Revisions

Unique:

```text
(user_id, problem_id)
```

One current revision record per user/problem.

### Daily tasks

Enforce uniqueness sufficient to prevent duplicate task slots:

```text
(user_id, task_date, task_type, slot_number)
```

Validate task-type relationship:

- `new_problem` requires `problem_id`, no `revision_id`
- `revision` requires `revision_id`, no `problem_id`
- `contest` requires neither

### Daily activity

Unique one row per user/local date.

### Contest participation

Enforce sufficient uniqueness to prevent duplicate recording of the same user's same contest/day event in MVP.

## RLS

Enable RLS on user-owned tables.

Public/reference data can be read according to the chosen application policy.

User-owned data must be isolated by authenticated user.

## Migration rules

- migrations are append-only history
- never rewrite applied migrations to “fix” deployed history
- destructive schema changes require a deliberate migration
- preserve historical references
- use soft deactivation instead of deleting reference entities that historical data still references

## Gate

Database can be recreated from migrations, seed data loads successfully, constraints reject invalid states, and RLS tests pass.

---

# 12. Phase 4 — Database Access Layer

## Objective

Create one predictable data-access strategy.

## Tasks

- initialize Drizzle
- define schema mapping
- expose typed database client
- create query modules
- create mutation modules
- create transaction helpers
- create server-only database utilities
- create Supabase request-context client where RLS/request-context semantics are intentionally required

## Access boundary

Use:

```text
UI
 ↓
application/service
 ↓
query or mutation function
 ↓
DB
```

Do not call the database directly from presentation components.

## RLS warning

Do not assume a privileged direct PostgreSQL connection automatically carries `auth.uid()` for the browser user.

For paths where RLS request context matters, use the approved RLS-aware Supabase path/RPC or explicitly establish safe request context.

## Gate

Private user queries are owner-scoped, reference data is read correctly, mutations are typed, and transactions can be composed reliably.

---

# 13. Phase 5 — Domain Type System and Validation

## Objective

Establish shared domain enums and runtime validation before implementing business services.

## Required domain unions/enums

### Attempt outcomes

```text
independent
hint
approach
solution
failed
```

### Revision results

```text
easy
partial
forgot
```

### Pattern recognition

```text
independent
after_hint
not_recognized
```

### Mistakes

```text
problem_understanding
finding_approach
pattern_recognition
optimization
implementation
edge_case
time_management
complexity
```

### Task types

```text
new_problem
revision
contest
```

### Task status

```text
pending
completed
skipped
```

### Revision status

```text
active
paused
```

### Difficulty

```text
easy
medium
hard
```

### Platforms

```text
leetcode
geeksforgeeks
hackerrank
codeforces
codechef
other
```

## Attempt consistency validation

Examples:

```text
independent
→ used_hint = false
→ saw_approach = false
→ saw_solution = false
```

```text
hint
→ used_hint = true
```

```text
approach
→ saw_approach = true
```

```text
solution
→ saw_solution = true
```

The server derives or verifies these fields consistently. Do not allow contradictory combinations.

## Gate

Invalid domain commands fail before persistence and valid commands are representable without ambiguity.

---

# 14. Phase 6 — Date, Timezone, and Calendar-Day Infrastructure

## Objective

Make daily logic correct before implementing scheduling.

## Rules

- store event timestamps in UTC using `timestamptz`
- use the user's configured IANA timezone for local-day calculations
- never use raw UTC date as the user's day
- convert event timestamps to local date before date-based aggregation

## Centralize helpers

Create domain-neutral utilities such as:

```text
getUserLocalDate(timestamp, timezone)
getUserLocalWeekday(localDate)
startOfUserDay(localDate, timezone)
endOfUserDay(localDate, timezone)
```

Avoid ad hoc date formatting throughout pages.

## Edge cases

Test:

- just before midnight
- just after midnight
- DST transitions for supported IANA zones
- timezone change for future logic
- historical timestamp immutability

## Gate

All scheduler/calendar/streak date tests use shared helpers and pass boundary cases.

---

# 15. Phase 7 — Revision Domain Engine

## Objective

Implement deterministic spaced-repetition behavior independently of UI.

## Initial intervals

| Initial outcome | Interval |
|---|---:|
| Independent | 3 days |
| Hint | 2 days |
| Approach | 2 days |
| Solution | 1 day |
| Failed | 1 day |

## Revision ladder

```text
1
3
7
14
30
60
```

## Recall transitions

### Easy

Move forward on the ladder.

Examples:

```text
1 → 3
3 → 7
7 → 14
14 → 30
30 → 60
```

At the top of the ladder, remain at the maximum configured interval rather than inventing a new value.

### Partial

Shorten/reset toward an earlier interval using the approved policy.

Examples:

```text
14 → 3
30 → 7
7 → 3
3 → 1
```

Define the mapping in one central module. Do not scatter it across UI code.

### Forgot

Reset to 1 day.

## Due calculation

A revision is due when:

```text
next_review_at <= now
```

for the user/context being evaluated.

## Due vs quota

Revision engine answers:

> Which items are due?

Daily scheduler answers:

> How many should be scheduled today?

Never mark an unselected due item as forgotten simply because the day's quota was full.

## Gate

Every initial outcome, easy, partial, forgot, overdue, top-of-ladder, and invalid-input case has deterministic unit tests.

---

# 16. Phase 8 — Problem Recommendation Domain Engine

## Objective

Implement explainable problem selection without randomness as the primary behavior.

## Eligibility

A candidate should normally be:

- active
- valid external URL
- not already assigned today
- current-curriculum relevant when possible
- not currently scheduled as a revision
- not attempted too recently
- suitable difficulty

## Priority components

```text
curriculum relevance
weak-pattern relevance
difficulty fit
recency / novelty
unsolved preference
diversity
```

## Recommendation score

Use one centralized formula module:

```text
0.30 curriculum
+ 0.30 weakness
+ 0.15 difficulty
+ 0.15 novelty
+ 0.10 recent fit
```

Weights are configuration, not scattered constants.

## Diversity

For two daily new-problem slots:

```text
slot 1 → weak/current-focus alignment
slot 2 → curriculum reinforcement or complementary pattern
```

Do not give both slots to the same weak pattern every day automatically.

## Recency exclusion

Default approximately 14 days.

Relax only when the candidate pool is insufficient.

Never relax:

- inactive problem exclusion
- duplicate-in-day protection
- structural Saturday/Sunday rules
- invalid-URL exclusion

## Difficulty adaptation

Baseline long-run distribution:

```text
Initial:    80% Easy / 20% Medium / 0% Hard
Developing: 60% Easy / 40% Medium
Advanced:   30% Easy / 60% Medium / 10% Hard
```

These are not strict daily quotas.

Do not increase difficulty solely because a streak is high.

## Explainability

A recommendation should be able to produce one concise reason such as:

- matches this week's focus
- current focus area
- not practiced recently
- difficulty fit

## Gate

Recommendation results are deterministic for the same input state and explainable enough to test and debug.

---

# 17. Phase 9 — Daily Scheduler Domain Engine

## Objective

Create the authoritative daily planning operation.

## Scheduler properties

Must be:

- deterministic
- idempotent
- timezone-aware
- concurrency-safe
- explainable
- persisted

## High-level flow

```text
user
 ↓
timezone
 ↓
local date
 ↓
local weekday
 ↓
existing daily tasks
 ↓
if already planned → return
 ↓
day type
 ↓
select tasks
 ↓
transaction
 ↓
daily_tasks
```

## Monday–Friday

Default:

```text
slot 1 → new_problem
slot 2 → new_problem
slot 3 → revision
```

## Saturday

```text
slot 1 → revision
slot 2 → revision
slot 3 → revision
```

Assign only as many eligible revisions as exist.

Never duplicate a revision merely to reach three.

## Sunday

```text
slot 1 → contest
```

No normal problem or revision task.

## Candidate fallback sequence

```text
current curriculum + weak pattern
↓
current curriculum
↓
weak pattern
↓
active unsolved suitable-difficulty problem
↓
active problem with least recent attempt
```

For revisions:

```text
due candidates
↓
overdue priority
↓
forgotten history
↓
partial history
↓
oldest due
↓
weak-pattern relevance
↓
quota
```

## Idempotency

Two concurrent scheduler calls for the same user/date must converge to one task set.

Use:

- unique DB constraints
- transactional insertion
- conflict-safe insertion
- locking or transaction strategy where required

## Stability

Never replace already-created tasks due to a refreshed recommendation score.

## Settings interaction

Settings changes affect future scheduling.

Do not rewrite historical tasks.

For an already planned day:

- preserve existing tasks
- do not silently replace completed tasks
- do not change today's assignment simply because settings changed

## Gate

Scheduler tests cover every weekday, no-history users, candidate starvation, many due revisions, duplicate calls, concurrent calls, timezone boundaries, and settings changes.

---

# 18. Phase 10 — Attempt Workflow Domain

## Objective

Implement the complete problem-attempt transaction.

## Attempt lifecycle

```text
not_started
   ↓
started
   ↓
completed
```

Abandoned attempt is not solved.

## Workspace capture

Before external coding:

- own-words understanding
- brute force
- brute-force complexity
- repeated work
- useful data structure
- edge cases
- initial approach

The initial approach may be wrong and must be preserved as learning evidence.

## External solving

Open the stored problem URL.

The application does not reproduce the external coding editor.

The source platform label comes from `platform`.

## Outcome

Exactly one final outcome per completed attempt:

- independent
- hint
- approach
- solution
- failed

## Mistakes

Allow multiple categories.

A category should count at most once per attempt in MVP.

## Complete Problem Transaction

Prefer one server-side operation:

```text
validate command
↓
authorize resource
↓
finalize attempt
↓
save mistakes
↓
create/update journal
↓
create/update revision
↓
complete applicable daily task
↓
update daily activity
↓
commit
```

## Manual practice

Manual problems follow the same attempt workflow.

Manual practice may contribute to:

- attempts
- journal
- revision
- analytics
- calendar activity

But it does not retroactively complete an unrelated daily task simply because the same problem was solved manually.

## Distinct solve count

A successful outcome is:

```text
independent
hint
approach
solution
```

A failed outcome is not solved.

Problems Solved = distinct problem IDs with at least one successful attempt.

## Multiple attempts

Never overwrite historical attempts.

## Gate

Full attempt lifecycle and transaction tests pass, including retries and multiple attempts on one problem.

---

# 19. Phase 11 — Journal Domain

## Objective

Implement the canonical reusable lesson system.

## Journal model

One active/current entry per user/problem.

Required minimum useful content:

- problem
- pattern
- what_to_remember

Full fields:

- failed_idea
- key_observation
- pattern
- time_complexity
- space_complexity
- what_to_remember
- pattern_recognition

## Creation

Normally:

```text
attempt
 ↓
journal
```

Manual journal creation is allowed.

Manual journal creation without an attempt must not mark a problem solved.

## Update

Repeated learning updates the canonical journal instead of creating duplicate current entries.

Historical attempts remain separate.

## Revision relationship

Revision reveal uses the current journal content.

Editing the journal updates future reveals.

Historical revision answers remain unchanged.

## Pattern recognition

Allowed values:

```text
independent
after_hint
not_recognized
```

Do not automatically pretend to grade free-text recognition in MVP.

The user self-rates after comparison.

## Gate

Journal uniqueness, update behavior, manual creation, and revision-read behavior are tested.

---

# 20. Phase 12 — Revision Completion Workflow

## Objective

Connect revision UI to the revision engine safely.

## Pre-recall state

Show:

- problem title
- difficulty
- last reviewed date
- two recall questions

Hide:

- pattern
- key observation
- journal answer
- solution
- complexity

Recall questions:

1. What pattern does this problem use?
2. Can you explain the approach?

## Reveal state

Show:

- user's recalled pattern
- user's recalled approach
- stored journal pattern
- stored key observation
- stored approach/lesson where available

The purpose is comparison and learning, not automatic punitive grading.

## Completion transaction

```text
validate revision
↓
verify ownership
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
complete daily task
↓
update daily activity
↓
commit
```

## Duplicate submissions

Two tabs submitting the same revision must produce:

- one official historical completion
- one schedule update
- one task completion
- one daily activity increment

Use uniqueness/locking/idempotency strategy.

## Gate

Easy/partial/forgot, duplicate submission, overdue, quota overflow, and history preservation tests pass.

---

# 21. Phase 13 — Daily Activity and Streak Domain

## Objective

Build rebuildable historical daily activity and correct streak semantics.

## Daily activity source events

Successful attempt:

```text
problems_solved += 1
```

Completed revision:

```text
revisions_completed += 1
```

Contest participation:

```text
contest_participated = true
```

The UI must never directly invent daily activity.

## Active day

A local date is active when:

```text
problems_solved >= 1
OR
revisions_completed >= 1
OR
contest_participated = true
```

## Streak

Current streak is consecutive active local dates according to the current “today” rule.

Important:

- Saturday revision can maintain streak
- Sunday contest can maintain streak
- inactive day breaks streak
- completing every task is not required

## Rebuildability

`daily_activity` must be reconstructable from:

```text
attempts
revision_attempts
contest_participations
```

A cached streak, if used, must be rebuildable from authoritative activity.

## Gate

Test consecutive days, gaps, partial task completion, Saturday-only revision, Sunday-only contest, midnight boundaries, and timezone boundaries.

---

# 22. Phase 14 — Analytics Domain

## Objective

Implement diagnostic analytics from real evidence.

## Unlock

Full Analytics appears after:

```text
10 distinct successfully solved problem IDs
```

At 9 → locked.

At 10 → enabled.

## Metrics

### Problems Solved

Distinct problem IDs with successful attempts.

### Independent Solve Rate

```text
independent successful attempts
/
all successful attempts
```

### Revision Recall

```text
easy recall attempts
/
all completed revision attempts
```

Do not show the percentage if there are no revision attempts; use a clear insufficient-data state.

### Day Streak

Derived from real meaningful activity.

## Main trend

One major chart:

```text
Independent Solve Rate over time
```

## Pattern mastery

Minimum recommended evidence:

```text
3+ relevant attempts
```

Below that:

```text
insufficient data
```

Starting score:

```text
0.40 independent_solve_rate
+ 0.25 pattern_recognition_rate
+ 0.20 revision_recall_rate
+ 0.15 recent_success_rate
```

Redistribute weights when a component is unavailable rather than interpreting missing evidence as zero.

Thresholds:

```text
< 0.50    Focus
0.50–0.69 Developing
0.70–0.84 Solid
>= 0.85   Strong
```

## Recurring mistakes

Rank mistake categories by real attempt evidence.

Do not double-count the same category twice on the same attempt in MVP.

## Recommendations

Analytics should produce a next focus that can connect to the recommendation engine.

## Gate

Test zero data, 9 solved, exactly 10, repeated same problem, no revision history, limited pattern evidence, and real historical data aggregation.

---

# 23. Phase 15 — Contest Domain

## Objective

Implement the minimal Sunday contest experience.

## Behavior

Sunday task:

```text
contest
```

Dashboard presents contest day.

Primary action opens external contest URL.

## Participation

Manual recording is supported.

On record:

```text
contest_participations
+
daily_activity.contest_participated = true
+
daily_task.status = completed
```

## Failure resilience

If external contest cannot be opened:

- Dashboard still loads
- fallback link may be shown if configured
- manual participation recording remains possible
- normal app functionality is not blocked

No contest API integration is required for MVP.

## Gate

Sunday generates contest-only task, participation can be recorded, duplicates do not double count, streak updates, and Calendar reflects participation.

---

# 24. Phase 16 — Dashboard Backend/Data Composition

## Objective

Compose the morning command center entirely from authoritative state and domain services.

## Data sources

Dashboard reads:

- profile
- current local date
- streak
- persisted daily tasks
- problem status
- due revision summary
- weekly curriculum
- focus areas
- contest state on Sunday

## Critical rule

Dashboard does not implement:

- recommendation scoring
- revision due logic
- streak logic
- daily task generation

It calls services/queries that own those decisions.

## Monday–Friday presentation

Show:

- greeting/date
- streak
- Today's Mission
- current curriculum focus
- two new-problem tasks
- one revision task
- progress
- next actionable item
- This Week
- Focus Areas

## Saturday presentation

Show revision-focused mission.

No new-problem task block.

## Sunday presentation

Show:

```text
LEETCODE CONTEST DAY
Open contest
Record participation
```

Do not show normal revision/new-problem tasks.

## Gate

Dashboard renders correctly for every day type and never creates hidden alternate task logic.

---

# 25. Phase 17 — Problems Library

## Objective

Build the complete searchable library from the shared `problems` data.

## Features

- search
- status filter
- difficulty filter
- pattern filter
- topic filter
- sorting
- pagination/load more

Status options:

- All
- Unsolved
- Solved
- Needs Revision

Sort options:

- Recommended
- Difficulty
- Recently Added
- Recently Attempted
- Alphabetical

## Row data

Show:

- title
- difficulty
- pattern
- status
- last attempt
- action affordance

## Excluded catalog metadata

Do not add/display unless later approved:

- company lists
- acceptance rate
- likes
- comments
- social counts
- solution preview
- long problem description
- stored complexity
- estimated minutes

## Search scale

Design for:

- 50
- 500
- 1000+

Use server-side pagination/efficient querying.

## Gate

Manual browsing works, recommended order works, filters are query-stable, pagination is correct, and clicking a problem routes to Workspace rather than directly to the external platform.

---

# 26. Phase 18 — Problem Workspace UI/Flow

## Objective

Implement the contextual think-before-code workflow.

## Route

```text
/problems/[id]/workspace
```

## States

### Before You Code

Show checklist:

- explain in own words
- brute force
- brute-force complexity
- repeated work
- eliminate repeated work
- useful data structure
- edge cases

## Pattern concealment

Do not display the target pattern before the attempt when recognition is being tested.

## Initial approach

Text area for first thought.

## External action

Primary CTA:

```text
Open on {platform} ↗
```

Where label is derived from stored platform data.

## Return/record

User returns and selects one result:

- Solved independently
- Solved with a hint
- Found the approach but couldn't implement
- Needed to see the solution
- Couldn't solve

Then selects any applicable mistake categories.

## Post-attempt handoff

Provide Journal creation/update action.

## Gate

Pattern remains hidden pre-attempt, external link is valid, result submission is quick, invalid outcomes are rejected, and successful completion triggers the full server transaction.

---

# 27. Phase 19 — Pattern Journal UI

## Objective

Build a persistent knowledge library, not a generic notes application.

## Layout

Two-column desktop layout:

```text
left  → find entries
right → understand selected entry
```

## Search

Search:

- problem
- pattern
- failed idea
- key observation
- what-to-remember

## Filters

- All
- Needs Review
- Comfortable
- Pattern

## Detail

Show:

- Problem
- Failed Idea
- Key Observation
- Pattern
- Time Complexity
- Space Complexity
- What I'll Remember
- Pattern Recognition

## Emphasis

“What I'll Remember” receives the strongest subtle emphasis.

## Actions

- Edit
- Open external problem

## Gate

Journal loads from real data, canonical uniqueness is preserved, editing affects future revision reveals, and no duplicate current entries appear.

---

# 28. Phase 20 — Revision UI

## Objective

Build active-recall behavior, not a solved-problem list.

## Main screen

Primary scope:

```text
Due Today
```

Do not create a cluttered scheduling dashboard.

## Queue item

Show:

- problem title
- difficulty
- last reviewed
- due/overdue state

Hide pattern before recall.

## Recall flow

```text
select item
↓
recall pattern
↓
recall approach
↓
Check My Recall
↓
reveal journal
↓
rate
↓
schedule next review
↓
next item
```

## Completion state

Show:

- result
- next review date/interval
- next due item
- back to revision

## Gate

A user cannot see the stored answer before Check My Recall, rating is required, schedule is updated exactly once, and history is preserved.

---

# 29. Phase 21 — Analytics UI

## Objective

Expose useful interpretation without becoming a chart wall.

## Locked state

Before 10 distinct solved:

```text
Your analytics will appear after 10 solved problems.
Keep practicing. Once there is enough data,
DSA OS will show meaningful trends and focus areas.
```

No misleading percentages.

## Unlocked state

Show only:

- Problems Solved
- Independent Solve Rate
- Revision Recall
- Day Streak
- Independent Solve Rate trend
- Focus Areas
- Recurring Mistakes
- Your Next Focus
- one concise progress sentence

## Gate

Every metric is traceable to real records and every state handles insufficient data gracefully.

---

# 30. Phase 22 — Calendar UI

## Objective

Provide historical visual activity, not scheduling software.

## Layout

```text
large monthly calendar | selected-day details
```

## Intensity

Primary signal is problems solved:

```text
0 solved → neutral
1 solved → light green
2+ solved → dark green
weekend contest/high activity → dark/high green where appropriate
```

Revision may be shown in selected-day details but must not make a zero-problem day look like a high-output day.

## Selected-day detail

Only:

- Problems Solved
- Revision
- Contest

Problem detail:

- title
- difficulty
- result

Revision detail:

- problem
- recall result

Contest:

- participation/name when known

## Excluded

Do not embed:

- analytics interpretations
- pattern recognition analysis
- journal text
- streak
- motivational content

## Gate

Calendar values match event data, month navigation works, day selection is clear, color is not the only signal, and timezone boundaries are correct.

---

# 31. Phase 23 — Patterns UI

## Objective

Implement pattern catalog/mastery presentation while preserving domain boundaries.

## Pattern list

Show active patterns with:

- name
- short description
- current status when enough data exists
- concise evidence/summary where approved

## Detail route

`/patterns/[id]`

Should provide pattern-centered evidence using real data.

## Insufficient data

Do not label a pattern weak from a single bad attempt.

Minimum recommended evidence for mastery classification is three relevant attempts.

## Action

Provide direct practice action that uses the recommendation/scheduling domain instead of implementing a second recommendation algorithm in the page.

## Gate

Pattern status and practice actions are derived from the same domain metrics used elsewhere.

---

# 32. Phase 24 — Settings Modal

## Objective

Implement preferences without creating a separate settings architecture.

## Sections

- Profile
- Practice
- Revision
- Notifications
- Appearance
- Account & Data

## Profile

- name
- email
- timezone

No avatar requirement.

## Practice

- problems/day
- difficulty mode
- practice days

## Revision

- weekday revision target
- Saturday revision target
- adaptive/fixed mode

Do not expose complex interval internals.

## Notifications

- daily practice reminder
- revision reminder
- reminder time

## Appearance

- Light
- Dark
- System

## Account & Data

- export data
- sign out
- delete account

Delete requires confirmation.

## Mutation rules

Preference changes affect future planning.

Do not rewrite history.

Do not change product invariants:

- Saturday revision-only
- Sunday contest-only
- analytics threshold
- calendar semantics

## Modal behavior

- center on desktop
- dim background
- focus trap
- Escape closes
- outside click closes when appropriate
- X closes
- focus returns to trigger

## Gate

Every setting persists, applies only where allowed, and modal accessibility behavior passes keyboard tests.

---

# 33. Phase 25 — Responsive and Accessibility Pass

## Objective

Make every completed screen usable beyond the 1440×900 reference.

## Breakpoint roles

```text
< 640       mobile
640–767     small tablet
768–1023    tablet
1024+       desktop
1280+       large desktop
```

## Mobile rules

- sidebar becomes drawer/sheet
- sections stack
- primary actions become full-width when appropriate
- filter controls may become a sheet
- Settings becomes near-full-screen
- Calendar details move below calendar
- Problems simplify row metadata
- no horizontal overflow

## Accessibility

- semantic HTML
- keyboard navigation
- visible focus
- accessible labels
- useful button names
- sufficient contrast
- screen-reader support
- modal focus trap
- Escape behavior
- selected state not conveyed by color alone

## Gate

Run keyboard walkthroughs and automated accessibility checks on critical flows.

---

# 34. Phase 26 — Error, Loading, Empty, and Recovery States

## Objective

Every data-driven surface must behave safely when data is missing or a service fails.

## Loading

Use layout-preserving skeletons.

Avoid layout shifts.

## Empty

Explain:

1. what is empty
2. why it is empty
3. what the user can do next

Examples:

### Problems

```text
Your problem library is empty.
```

### Journal

```text
Your first solved problem can become your first reusable lesson.
```

### Revision

```text
Complete a few problems and they'll appear here for recall.
```

### Calendar

```text
No DSA practice recorded for this day.
```

## Error

User-facing errors are concise and actionable.

Examples:

```text
Couldn't load your revisions. Try again.
```

```text
Your journal entry wasn't saved. Please retry.
```

Never expose stack traces or database internals to users.

## Business rule failure behavior

If recommendation generation fails:

- use a valid fallback candidate when possible
- never fabricate a problem

If analytics calculation fails:

- show unavailable state
- do not invent numbers

If revision scheduling fails:

- preserve the last known valid schedule
- do not overwrite it with null/invalid state

## Gate

Each major screen has explicit loading, empty, error, success, and disabled behavior where applicable.

---

# 35. Phase 27 — Seed Data

## Objective

Make development/demo usage meaningful without polluting production user analytics.

## Reference seed content

Create realistic shared reference records for:

- patterns
- topics
- mistakes
- problems
- problem-pattern links
- problem-topic links
- weekly curriculum

## Seed volume

Enough data to exercise:

- filtering
- multiple patterns
- multiple topics
- all difficulties
- all supported initial platforms where practical
- scheduler selection
- recommendation scoring
- weak-pattern behavior
- candidate fallback
- pagination

## Seed rules

- seed data belongs to the shared reference dataset
- do not create fake user activity in production
- development/demo user fixtures may be explicitly separate

## Gate

Fresh database + migrations + seed produces a useful development environment.

---

# 36. Phase 28 — Transaction and Concurrency Hardening

## Objective

Verify that critical workflows survive retries and simultaneous operations.

## Test scenarios

### Daily scheduler

- same request repeated
- simultaneous two-tab requests
- scheduler rerun after network failure

### Problem completion

- double click
- retry after timeout
- two tabs
- repeated submission of same logical completion

### Revision completion

- double click
- two tabs
- stale revision state
- retry after timeout

### Contest

- repeated participation click
- two tabs

## Required outcome

No duplicated:

- historical records where duplicate represents same logical operation
- daily activity increments
- task completions
- revision schedule transitions
- contest participation events

## Gate

Race-condition integration tests pass against a real PostgreSQL test database.

---

# 37. Phase 29 — Rebuildability and Integrity Jobs

## Objective

Ensure derived records can be reconstructed.

## Rebuild targets

At minimum support developer/admin maintenance scripts for:

- `daily_activity`
- streak derivation
- analytics aggregates/views if materialized

## Source records

```text
attempts
revision_attempts
contest_participations
```

must be sufficient to reconstruct activity semantics.

## Rule

Do not make a non-rebuildable counter the only source of truth for progress.

## Gate

A test or script can clear a derived aggregate in a controlled environment and rebuild it to the same result from source events.

---

# 38. Phase 30 — External Platform Boundary

## Objective

Keep DSA OS independent of any one coding platform.

## Problem representation

Use:

```text
platform
url
```

## Initial platform display

Supported values:

- LeetCode
- GeeksforGeeks
- HackerRank
- Codeforces
- CodeChef
- Other

## No verification claim

MVP does not independently verify external submissions.

The event means:

```text
user recorded the outcome
```

not:

```text
platform verified success
```

## Gate

Changing a problem's platform does not require a schema migration and generic UI labels remain correct.

---

# 39. Phase 31 — Notifications Boundary

## Objective

Keep notification behavior optional and logically downstream.

## Rule

Notifications consume existing state.

They must not invent separate concepts of:

- today
- due
- upcoming practice

When notification delivery is implemented, it should call the existing scheduler/revision services.

MVP does not require a large notification infrastructure.

## Gate

Notifications, when enabled, read existing domain state rather than duplicating rules.

---

# 40. Phase 32 — Production Observability

## Objective

Make production failures observable without exposing internals to users.

## Sentry

Integrate Sentry for:

- uncaught exceptions
- server action failures
- route failures
- important client crashes

## Structured logging

Log useful metadata without secrets:

- operation name
- user ID hash or safe internal identifier where appropriate
- resource type
- resource ID when safe
- outcome
- latency
- error category

Never log:

- passwords
- auth tokens
- service-role keys
- full sensitive content unnecessarily

## Gate

Intentional test error reaches monitoring and user-facing error remains safe.

---

# 41. Phase 33 — Testing Strategy

## 41.1 Unit tests

Use Vitest for pure logic.

Required areas:

- revision interval calculations
- due determination
- revision ranking
- pattern score
- recommendation score
- difficulty adaptation
- candidate selection
- daily task structure
- calendar intensity
- streak calculation
- analytics metrics
- validation helpers

## 41.2 Integration tests

Use a real PostgreSQL/Supabase-compatible test environment or isolated test database.

Test:

- auth-owned data access
- migrations
- constraints
- RLS
- transactional completion workflows
- scheduler persistence
- rebuildability

## 41.3 E2E tests

Use Playwright for major user journeys.

### Journey A — new user

```text
signup
↓
profile/settings initialized
↓
dashboard
```

### Journey B — weekday problem

```text
dashboard
↓
problem
↓
workspace
↓
initial approach
↓
external link
↓
return
↓
record result
↓
journal
↓
revision created
```

### Journey C — revision

```text
revision
↓
due problem
↓
recall
↓
check
↓
reveal
↓
rate
↓
next schedule
```

### Journey D — analytics unlock

```text
9 distinct solved
→ locked
10th distinct solved
→ unlocked
```

### Journey E — Saturday

```text
Saturday
→ revisions only
```

### Journey F — Sunday

```text
Sunday
→ contest only
→ record participation
```

### Journey G — security

```text
user A
→ attempt access to user B resource
→ denied
```

---

# 42. Phase 34 — Critical Business-Logic Test Matrix

## Daily scheduling

Test:

- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday
- Sunday
- new user with no history
- user with many due revisions
- fewer than 3 Saturday revisions
- duplicate scheduler call
- concurrent scheduler call
- candidate pool exhaustion
- recent-attempt relaxation
- settings changed after today's plan was generated

## Revision

Test:

- independent initial interval
- hint initial interval
- approach initial interval
- solution initial interval
- failed initial interval
- easy recall
- partial recall
- forgot
- overdue
- quota overflow
- duplicate submission
- maximum interval

## Problems

Test:

- each initial platform
- filters
- search
- pagination
- duplicate daily assignment prevention
- recent exclusion
- weak-pattern recommendation
- insufficient candidates
- inactive problem

## Analytics

Test:

- 0 solved
- 1 solved
- 9 solved
- exactly 10 distinct solved
- repeated same solved problem
- failed-only attempts
- no revisions
- insufficient pattern evidence

## Calendar

Test:

- 0 solved
- 1 solved
- 2 solved
- Saturday revision-only
- Sunday contest
- date boundary
- timezone boundary

## Security

Test:

- cross-user read denied
- cross-user update denied
- cross-user delete denied where deletion exists
- cross-user task mutation denied
- cross-user revision submission denied

---

# 43. Phase 35 — Performance and Query Review

## Objective

Prevent obvious performance problems without premature infrastructure.

## Rules

- use database indexes for common filter/join paths
- paginate large problem/journal lists
- avoid N+1 queries
- batch related data when appropriate
- compute analytics through efficient SQL/domain query plans
- do not add Redis merely because caching sounds professional

## Likely important indexes

Index according to actual query plans, with at least consideration for:

- user-owned attempts by `(user_id, created_at)`
- attempts by `(user_id, problem_id, created_at)`
- revisions by `(user_id, next_review_at)`
- daily_tasks by `(user_id, task_date)`
- daily_activity by `(user_id, activity_date)` or approved date column
- journal entries by `(user_id, updated_at)`
- problem filtering fields
- problem-pattern/topic junction keys
- mistake relationships

Do not add dozens of indexes without evidence.

## Gate

Typical pages load without avoidable N+1 behavior and list queries remain reasonable at 1000+ problems.

---

# 44. Phase 36 — Visual Fidelity Pass Against Stitch

## Objective

Match the approved visual references after functional architecture is stable.

## Process

For each screen:

1. open finalized screenshot
2. inspect HTML/MD export only as reference
3. map visual regions to reusable components
4. apply global tokens
5. implement responsive behavior
6. compare spacing/hierarchy/typography
7. fix visual discrepancies
8. verify no obsolete UI leaked in

## Global rules

- background `#E8EAF0`
- green-forward primary
- calm neutral surfaces
- subtle depth
- Plus Jakarta Sans
- Lucide icons
- no purple primary CTA
- no excessive cards
- no excessive pills
- no unnecessary borders
- no clutter added to fill whitespace

## Gate

Each MVP screen is visually coherent with the finalized Stitch direction and the unified design system.

---

# 45. Phase 37 — UX Consistency Pass

## Objective

Verify that the same business fact appears consistently across screens.

Example: one problem.

```text
Dashboard  → today's task
Problems   → library item + status
Workspace  → current attempt
Journal    → learned lesson
Revision   → recall task
Analytics  → evidence contribution
Calendar   → historical event
```

The screens may show different representations, but they must derive from the same authoritative facts.

## Verify

- Dashboard task matches `daily_tasks`
- revision due matches revision engine
- Calendar activity matches real event data
- Analytics metrics match source queries
- Journal reveal matches current journal
- Problems status matches attempt history
- streak matches activity, not scheduled tasks

---

# 46. Phase 38 — Security Review

## Authentication

Verify:

- protected routes
- secure session handling
- safe logout
- secure password/reset integration through provider

## Authorization

Every mutation must verify:

```text
authenticated user
+
resource ownership
+
legal state transition
```

## RLS

Verify:

- user-owned rows isolated
- reference data read policy is correct
- service-role never exposed
- privileged paths are server-only

## Input safety

Validate:

- URLs
- text lengths
- enum values
- UUIDs
- IDs
- settings
- outcome combinations

## Gate

No known cross-user access path remains and all critical mutations are server-authorized.

---

# 47. Phase 39 — Data Export and Account Deletion

## Objective

Implement the minimum required account/data controls.

## Export

Provide an export flow that can include user's:

- profile/settings
- attempts
- mistakes
- journals
- revisions
- revision history
- daily activity
- daily tasks/history where appropriate
- contest participation

The export format can be JSON for MVP unless the repository already specifies another format.

## Delete account

Require confirmation.

Deletion must be designed against all foreign-key references and auth identity cleanup.

Preserve only data that is explicitly intended to survive deletion for legitimate system reasons; MVP should prefer full user-data removal while reference data remains shared.

## Gate

Export contains real user data and deletion does not leave inaccessible orphaned private rows.

---

# 48. Phase 40 — CI/CD

## Required automated checks

On every pull request/merge:

```text
install dependencies
↓
lint
↓
typecheck
↓
unit tests
↓
integration tests where environment is available
↓
build
```

On main/production:

- deploy Vercel preview/production
- run production-safe migrations in controlled deployment process
- verify environment variables
- monitor Sentry

## Migration safety

Do not apply destructive migrations automatically without a deliberate deployment plan.

## Gate

A clean checkout can install, validate, test, and build from scratch.

---

# 49. Phase 41 — Production Readiness Review

Before production release, verify:

## Product

- every MVP screen exists
- no deferred feature appears accidentally
- Sunday is contest-only
- Saturday is revision-only
- Daily Reflection is absent
- Interview Mode is deferred

## Data

- migrations reproducible
- seed reproducible
- constraints enabled
- RLS enabled
- historical events preserved

## Business logic

- scheduling deterministic
- revision deterministic
- analytics correct
- streak correct
- recommendations explainable

## Security

- no service key in client bundle
- private routes protected
- ownership validated
- RLS verified

## UX

- loading states
- empty states
- error states
- keyboard access
- mobile behavior
- responsive sidebar

## Operations

- Sentry configured
- production env validated
- backup/recovery assumptions understood
- migration process documented

---

# 50. Phase Dependency Graph

Use this exact high-level dependency order.

```text
Phase 0
Repository Recon
   ↓
Phase 1
Foundation
   ↓
Phase 2
Authentication
   ↓
Phase 3
Database
   ↓
Phase 4
Data Access
   ↓
Phase 5
Types + Validation
   ↓
Phase 6
Timezone Infrastructure
   ↓
Phase 7
Revision Engine ─────┐
                     │
Phase 8               │
Recommendation Engine │
                     ├──→ Phase 9 Scheduler
Phase 10 Attempt ────┤
Phase 11 Journal ────┤
                     │
                     └──→ Phase 12 Revision UI workflow
                              ↓
Phase 13 Activity/Streak
                              ↓
Phase 14 Analytics
                              ↓
Phase 15 Contest
                              ↓
Phase 16 Dashboard
                              ↓
Phase 17 Problems
                              ↓
Phase 18 Workspace
                              ↓
Phase 19 Journal UI
                              ↓
Phase 20 Revision UI
                              ↓
Phase 21 Analytics UI
                              ↓
Phase 22 Calendar UI
                              ↓
Phase 23 Patterns UI
                              ↓
Phase 24 Settings
                              ↓
Phase 25 Responsive/A11y
                              ↓
Phase 26 Error/Empty/Loading
                              ↓
Phase 27 Seed Data
                              ↓
Phase 28 Concurrency Hardening
                              ↓
Phase 29 Rebuildability
                              ↓
Phase 30 External Platform Boundary
                              ↓
Phase 31 Notifications Boundary
                              ↓
Phase 32 Observability
                              ↓
Phase 33 Testing
                              ↓
Phase 34 Business Test Matrix
                              ↓
Phase 35 Performance
                              ↓
Phase 36 Visual Fidelity
                              ↓
Phase 37 UX Consistency
                              ↓
Phase 38 Security Review
                              ↓
Phase 39 Export/Delete
                              ↓
Phase 40 CI/CD
                              ↓
Phase 41 Production Readiness
```

The sequence can be parallelized internally only when dependencies remain satisfied.

---

# 51. Recommended First Implementation Slice

The first production-quality vertical slice should be deliberately small.

Implement this before attempting every screen:

```text
signup
↓
profile/settings initialization
↓
Monday–Friday task generation
↓
one real problem
↓
Workspace
↓
attempt completion
↓
journal
↓
revision record
↓
due revision
↓
revision completion
↓
daily activity
↓
Calendar day
```

This proves the core learning loop with real persistence.

Only after this slice passes end-to-end should broad UI coverage accelerate.

---

# 52. Recommended Implementation Order Inside Each Feature

For each feature, use this order:

```text
1. domain types
2. validation
3. domain logic
4. data queries/mutations
5. transaction boundary
6. server action/service
7. server-rendered screen data composition
8. client interaction layer where necessary
9. loading/empty/error/success states
10. tests
11. visual polish
```

Never start with the page and retrofit correctness later.

---

# 53. Server Component vs Client Component Rules

## Default

Use Server Components.

## Client Components only when needed for

- user interaction
- local UI state
- browser APIs
- timers
- focus management
- optimistic interaction where justified
- controlled form behavior

## Do not turn entire pages into Client Components simply because one child needs interactivity.

Instead:

```text
Server page
  ↓
server data
  ↓
small client interactive island
```

This preserves server-first architecture.

---

# 54. Server Action Rules

Use Server Actions for normal internal mutations where appropriate.

A Server Action must generally follow:

```text
parse/validate
↓
authenticate
↓
authorize
↓
load current state
↓
validate business transition
↓
transaction
↓
return typed result
```

Do not return stack traces.

Return domain-level success/error information suitable for the UI.

---

# 55. Query Rules

Reads should be explicit and reusable.

Prefer named queries such as:

```text
getDashboardData()
getTodayTasks()
getProblemLibraryPage()
getProblemForWorkspace()
getJournalEntries()
getDueRevisions()
getAnalyticsSummary()
getCalendarMonth()
getPatternPerformance()
```

Do not duplicate equivalent SQL in multiple page components.

---

# 56. Mutation Rules

Use named operations such as:

```text
createAttempt()
completeAttempt()
upsertJournalEntry()
createOrUpdateRevision()
completeRevision()
recordContestParticipation()
updateUserSettings()
ensureDailyTasks()
```

Every mutation must be tested independently from the page.

---

# 57. Error Taxonomy

Use a small predictable error model.

Suggested categories:

```text
AUTHENTICATION_REQUIRED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
CONFLICT
INVALID_STATE
RATE_LIMITED
DEPENDENCY_FAILURE
INTERNAL_ERROR
```

Map these to appropriate user-facing behavior.

Do not let database error strings leak directly into the UI.

---

# 58. Conflict Handling Strategy

For operations where the current state may have changed between read and write:

1. load current state
2. validate preconditions
3. write using transaction/constraint/lock as needed
4. if conflict occurs, return a safe conflict result
5. never silently overwrite newer state

Examples:

- revision submitted in two tabs
- task generated twice
- journal updated from stale form
- account settings changed from two tabs

---

# 59. Historical Data Rules

Never rewrite historical:

- attempt outcome
- attempt timestamp
- revision result
- revision response text
- contest participation
- calendar source events

Current records may change:

- revision current schedule
- user settings
- active/inactive reference state
- current journal lesson

The difference must remain clear in code and schema.

---

# 60. Deactivation Rules

## Problems

Use deactivation, not deletion, when historical records depend on a problem.

An inactive problem:

- excluded from new recommendations
- excluded from new task generation
- retained in historical views where appropriate

## Patterns

Same principle.

Do not remove a pattern needed by historical journal/attempt interpretation.

---

# 61. Recommendation Safety Rules

Even the highest score cannot override hard exclusions.

Hard exclusions:

- inactive problem
- invalid URL
- duplicate same-day assignment
- current revision conflict
- recent attempt exclusion where still applicable
- Sunday structural rules
- Saturday structural rules

Soft preferences:

- curriculum relevance
- weakness
- difficulty
- novelty
- recent fit
- diversity

Hard exclusions run before scoring.

---

# 62. Revision Safety Rules

A revision cannot be selected when:

- revision record is inactive
- problem no longer exists
- ownership fails
- current state is invalid
- same revision is already completed by the current task transaction

Being overdue is not a failure.

Being skipped due to quota is not a failed recall.

Only the user's explicit `forgot` result represents memory failure.

---

# 63. Analytics Data Integrity Rules

Never calculate an analytic metric from UI state.

Use source records.

Do not cache an analytic value permanently unless it is explicitly rebuildable.

Prefer query-derived calculations until profiling proves a materialized aggregate is needed.

---

# 64. Calendar Data Integrity Rules

Calendar is a rendering of actual activity.

Do not derive a green square from:

- planned tasks
- page visits
- journal creation alone
- streak value

Primary intensity = problems solved.

Secondary context = revisions/contest in selected-day detail.

---

# 65. Dashboard Data Integrity Rules

Dashboard should never calculate a second version of:

- streak
- recommendations
- revision due
- analytics

Use domain services and persisted daily tasks.

---

# 66. Settings Integrity Rules

Settings may influence:

- normal weekday target
- difficulty preference
- revision target
- practice days
- reminders
- theme

Settings may not redefine:

- Saturday revision-only rule
- Sunday contest-only rule
- analytics threshold
- calendar semantics
- historical event meaning

---

# 67. UI Component Rules

Create reusable components when the same semantic object appears in multiple places.

Examples:

- `ProblemRow`
- `DifficultyBadge`
- `StatusBadge`
- `PatternBadge`
- `TaskRow`
- `RevisionRow`
- `Metric`
- `JournalEntryRow`
- `CalendarDay`
- `DayDetailPanel`

Do not create giant universal components that understand unrelated domains.

Prefer small, composable components.

---

# 68. Design Token Rules

Centralize:

```text
colors
radii
shadows
spacing
typography
```

Do not repeat literal design values throughout the project.

The visual source of truth is the unified design system.

---

# 69. Motion Rules

Allowed:

- hover transitions
- press feedback
- modal transitions
- subtle progress completion
- calendar selection
- navigation feedback

Avoid:

- confetti
- constant animated backgrounds
- bouncing UI
- gaming effects
- large transitions

Motion must communicate state.

---

# 70. Data Visibility Rules

Progressive disclosure is part of product correctness.

Hide:

- target pattern before solving when recognition matters
- journal answers before revision recall
- complex internal scheduling data from normal settings
- unnecessary metadata from primary views

Do not leak information just because it exists in the database.

---

# 71. Manual Practice Rules

Manual practice starts from `/problems` and uses the same Workspace/attempt flow.

Manual completion:

- contributes to learning history
- can create/update Journal
- can create/update Revision
- contributes to Analytics
- contributes to meaningful Calendar activity

But manual practice does not retroactively convert into a daily task completion unless it explicitly corresponds to an incomplete daily task and the product workflow intentionally links them.

Do not infer such linkage solely from matching problem IDs.

---

# 72. Daily Task Completion Rules

### New problem task

Complete when a successful outcome is recorded.

A failed outcome remains an attempted task but not a successful completion.

### Revision task

Complete when recall result is submitted.

### Contest task

Complete when participation is recorded.

Never mark a task complete merely because its screen was opened.

---

# 73. Daily Reflection / Removed Feature Guardrail

The current implementation must not contain:

- a Daily Reflection route
- a Daily Reflection table
- a Daily Reflection scheduler slot
- a Daily Reflection sidebar item
- an Analytics dependency on Daily Reflection

If old imported Stitch HTML contains it, it must not be copied into production.

---

# 74. Interview Mode / Deferred Feature Guardrail

Do not implement Interview Mode in MVP.

Do not create:

- interview sessions table
- interview-specific UI routes
- interview timer infrastructure
- interview scoring
- mixed interview scheduler branch

Only leave clean extension points through existing problem/attempt abstractions where useful.

---

# 75. AI Guardrail

No AI is required for the core MVP.

If AI is introduced later:

- AI receives filtered context
- deterministic domain logic remains authoritative
- AI cannot directly set solved state
- AI cannot directly change revision schedule
- AI cannot bypass authorization

---

# 76. Seed and Demo Safety

Never confuse development fixtures with user progress.

A demo account may contain explicit seeded history, but production analytics for a real user must be traceable to that user's own events.

Do not make seeded values indistinguishable from live events in test logic.

---

# 77. Implementation Checkpoint Format

After every major phase, the agent should report internally/through its change notes in this format:

```text
Phase: <number/name>
Status: complete | blocked | partial
Implemented:
- ...
Tests:
- ...
Verification:
- typecheck
- lint
- unit/integration/e2e as applicable
Known issues:
- ...
Deviations from source of truth:
- none / explicit list
Next phase:
- ...
```

Do not mark a phase “complete” when known correctness issues remain unresolved.

---

# 78. Definition of Done — Code Quality

A feature is complete when:

- TypeScript strict checks pass
- no obvious lint violations remain
- validation exists for untrusted inputs
- server ownership checks exist
- domain logic is isolated
- database constraints protect key invariants
- affected tests exist
- loading/error/empty states exist
- accessibility basics exist
- no dead code or fake data was introduced
- UI follows the design system

---

# 79. Definition of Done — Business Logic

A business operation is complete when:

- exact source-of-truth record is identified
- state transitions are explicit
- invalid transitions fail safely
- retries are safe
- concurrency is considered
- historical events are preserved
- derived values can be recomputed where required
- business constants are centralized
- insufficient data does not produce false certainty

---

# 80. Definition of Done — UI

A screen is complete when:

- it answers one primary question
- primary action is obvious
- correct data source is used
- patterns are hidden where required
- loading state exists
- empty state exists
- error state exists
- success state exists where applicable
- responsive behavior exists
- keyboard accessibility works
- it does not duplicate another screen's job
- it visually matches the unified design system

---

# 81. Final End-to-End Acceptance Scenario

A final release candidate must pass this complete scenario.

## Day 1

User signs up.

System creates:

```text
profile
user_settings
```

Dashboard determines local date and generates stable daily tasks.

## Weekday

System creates:

```text
2 new problems
1 revision
```

User opens first problem.

Pattern is hidden.

User writes initial approach.

User opens external coding platform.

User returns and records outcome.

System transactionally:

```text
stores attempt
stores mistakes
updates journal
creates/updates revision
completes task when successful
updates activity
```

User later completes second problem.

## Revision

A due revision appears.

Pattern is hidden.

User recalls pattern and approach.

User checks recall.

Stored journal knowledge is revealed.

User selects Easy/Partial/Forgot.

System transactionally:

```text
stores revision_attempt
updates revision schedule
completes task
updates activity
```

## Saturday

Dashboard generates revision-only tasks, up to three.

No new problem appears.

## Sunday

Dashboard shows contest-only state.

No new problem.

No revision.

User records participation.

Activity and streak update.

## Analytics

Before 10 distinct successful solves:

```text
Analytics locked
```

At 10:

```text
Analytics enabled
```

Metrics derive from real source records.

## Calendar

Calendar shows actual activity by local date.

## Security

Another user cannot read or mutate the first user's private records.

## Retry safety

Repeating completion requests does not duplicate historical records or double-count activity.

This scenario is the final system-level proof of the implementation.

---

# 82. Release Checklist

Before production:

## Architecture

- [ ] modular monolith preserved
- [ ] domain/application/data/UI boundaries preserved
- [ ] no accidental microservice split
- [ ] no unnecessary dependency added

## Database

- [ ] all 17 tables implemented
- [ ] migrations reproducible
- [ ] constraints verified
- [ ] indexes reviewed
- [ ] RLS enabled and tested
- [ ] history preserved

## Authentication

- [ ] sign up works
- [ ] sign in works
- [ ] logout works
- [ ] protected routes work
- [ ] service role is server-only

## Core learning loop

- [ ] daily task generation
- [ ] workspace
- [ ] attempt
- [ ] journal
- [ ] revision
- [ ] activity
- [ ] analytics
- [ ] calendar

## Weekly behavior

- [ ] Mon–Fri 2 new + 1 revision
- [ ] Saturday up to 3 revisions
- [ ] Sunday contest only

## Business correctness

- [ ] revision transitions
- [ ] recommendation logic
- [ ] streak
- [ ] analytics threshold
- [ ] pattern mastery thresholds
- [ ] fallback selection
- [ ] deactivation behavior

## Reliability

- [ ] idempotency
- [ ] concurrency
- [ ] retries
- [ ] error handling
- [ ] rebuildability

## UX

- [ ] loading states
- [ ] empty states
- [ ] error states
- [ ] keyboard navigation
- [ ] mobile layout
- [ ] visual fidelity

## Observability

- [ ] Sentry
- [ ] safe logging
- [ ] production environment validation

## CI/CD

- [ ] lint
- [ ] typecheck
- [ ] unit tests
- [ ] integration tests
- [ ] E2E tests
- [ ] production build

---

# 83. What the Agent Must Never Decide on Its Own

The following decisions are already closed.

Do not independently decide:

- database choice
- ORM replacement
- separate backend introduction
- microservice boundaries
- Sunday task type
- Saturday task type
- Analytics threshold
- revision ladder
- revision result categories
- attempt outcome categories
- platform schema
- Journal uniqueness
- revision uniqueness
- streak semantics
- Calendar intensity semantics
- pattern concealment rules
- Daily Reflection inclusion
- Interview Mode inclusion
- AI dependency
- primary color system
- Settings page creation
- Weekly Plan page creation
- Notes page creation
- Today's Plan page creation

Any uncertainty must be resolved by consulting the source-of-truth hierarchy, not by guessing.

---

# 84. What the Agent May Decide Locally

Reasonable implementation-level decisions may still be made for:

- component extraction boundaries when behavior remains unchanged
- naming of internal helper functions where no existing name is established
- SQL query shape where semantics remain unchanged
- test fixture organization
- CSS class composition
- whether a pure calculation is implemented as a small function or object when both preserve the domain contract
- non-semantic folder organization within the boundaries defined here

A local choice must not change product semantics.

---

# 85. Final Engineering Principles

1. Build the domain before the page.
2. Build persistence before derived UI.
3. Make the server authoritative.
4. Make historical events immutable.
5. Use one source of truth per business fact.
6. Keep business rules out of React components.
7. Use transactions for multi-record state changes.
8. Assume retries and concurrency.
9. Never fake learning evidence.
10. Never convert missing evidence into failure.
11. Keep recommendations deterministic and explainable.
12. Keep revision scheduling simple until real data justifies complexity.
13. Preserve Saturday/Sunday product semantics.
14. Hide knowledge before recall when recognition matters.
15. Prefer contextual workflows over additional pages.
16. Optimize for maintainability, not technological novelty.
17. Do not add infrastructure before scale requires it.
18. Build the system so derived state can be rebuilt.
19. Test business rules as seriously as UI behavior.
20. Treat the visual design as a system, not a collection of screenshots.

---

# 86. Final Implementation Command

When the repository is ready to be handed to an AI coding agent, the agent should be given this implementation sequence:

```text
Read all finalized DSA OS source-of-truth documents.
Read DSA_OS_IMPLEMENTATION_PLAN.md completely.
Inspect the existing repository before editing.

Implement only one phase at a time.
Do not skip dependency gates.
Do not invent product behavior.
Do not add deferred features.
Do not rewrite business rules inside UI components.
Do not use fake user progress.
Do not trust client-supplied ownership identifiers.

After each phase:
1. run typecheck
2. run lint
3. run relevant tests
4. run build/migration verification where applicable
5. inspect the affected user flow manually
6. record any deviation
7. only then continue

The final system must satisfy every acceptance criterion in this plan and remain consistent with the finalized DSA OS business logic, database, technical architecture, screen specification, design system, and approved Stitch visual references.
```

---

# 87. Final State

When all phases are complete, DSA OS should be a production-quality modular monolith with:

```text
secure authentication
        ↓
real relational data
        ↓
deterministic scheduling
        ↓
independent problem solving workflow
        ↓
structured learning capture
        ↓
spaced active recall
        ↓
real historical activity
        ↓
evidence-based analytics
        ↓
weak-area recommendations
        ↓
future practice
```

The application should feel like one coordinated system rather than a collection of pages.

The final engineering property is:

> **Every meaningful user action creates durable evidence or improves the next decision, while correctness, security, historical integrity, and explainability remain server-authoritative.**

---

# 88. Final Note on the Existing Stitch Exports

The Stitch exports are a valuable visual implementation reference, not the runtime architecture.

Use them to determine:

- visual composition
- spacing
- hierarchy
- component appearance
- layout relationships
- interaction intent where explicitly shown

Do not copy generated HTML wholesale when it conflicts with the current application architecture.

The implementation must use:

```text
Next.js
React
TypeScript
Tailwind
shadcn/ui
Lucide
```

with reusable components and centralized tokens.

The unified design system remains the visual authority, while the screen specification and business logic remain the behavioral authorities.

---

# 89. Final Project Execution Summary

```text
SPECIFICATIONS COMPLETE
        ↓
REPOSITORY RECON
        ↓
FOUNDATION
        ↓
AUTHENTICATION
        ↓
DATABASE
        ↓
DATA ACCESS
        ↓
DOMAIN TYPES + VALIDATION
        ↓
TIMEZONE INFRASTRUCTURE
        ↓
REVISION ENGINE
        ↓
RECOMMENDATION ENGINE
        ↓
DAILY SCHEDULER
        ↓
ATTEMPT ENGINE
        ↓
JOURNAL ENGINE
        ↓
REVISION WORKFLOW
        ↓
ACTIVITY + STREAK
        ↓
ANALYTICS ENGINE
        ↓
CONTEST
        ↓
DASHBOARD
        ↓
PROBLEMS
        ↓
WORKSPACE
        ↓
JOURNAL UI
        ↓
REVISION UI
        ↓
ANALYTICS UI
        ↓
CALENDAR UI
        ↓
PATTERNS UI
        ↓
SETTINGS
        ↓
RESPONSIVE + ACCESSIBILITY
        ↓
ERROR/EMPTY/LOADING
        ↓
SEED DATA
        ↓
CONCURRENCY HARDENING
        ↓
REBUILDABILITY
        ↓
OBSERVABILITY
        ↓
TESTING
        ↓
PERFORMANCE
        ↓
VISUAL FIDELITY
        ↓
SECURITY REVIEW
        ↓
CI/CD
        ↓
PRODUCTION READINESS
```

**This is the execution plan. Do not return to architectural brainstorming unless a real implementation constraint or newly discovered contradiction requires it.**
