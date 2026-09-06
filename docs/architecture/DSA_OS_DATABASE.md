# DSA OS — Database Architecture & Specification

> **Version:** 1.0  
> **Status:** Current database source of truth  
> **Database:** PostgreSQL  
> **Managed through:** Supabase  
> **Authentication:** Supabase Auth  
> **Purpose:** Define the normalized, secure, implementation-ready data model for the finalized DSA OS product.
>
> Companion documents:
>
> - `DSA_OS_DESIGN_SYSTEM.md` — visual language
> - `DSA_OS_SCREEN_SPEC.md` — UX, screen behavior, and product flows
>
> This document supersedes older database suggestions created before the DSA OS UX was finalized.

---

# 1. Database Philosophy

The database is the long-term memory of DSA OS.

It must remember:

- who the user is
- what problems exist
- which platforms those problems come from
- which DSA patterns/topics belong to those problems
- what the user attempted
- how the user performed
- where the user struggled
- what the user wrote in the Pattern Journal
- what is due for revision
- how each revision went
- what the user did on each day
- whether the user participated in a contest
- the weekly curriculum
- user preferences

A good DSA OS data flow is:

```text
User solves a problem
        ↓
Attempt is stored
        ↓
Daily activity is updated
        ↓
Journal can be created
        ↓
Revision is scheduled
        ↓
Analytics data changes
        ↓
Calendar history changes
        ↓
Future recommendations improve
```

The schema should support that flow without duplicating the same fact in many places.

---

# 2. Final Database Principles

## 2.1 PostgreSQL is the source of truth

Use PostgreSQL through Supabase.

Do not add MongoDB, Firebase, or another database for the MVP.

## 2.2 Normalize meaningful entities

Store each stable fact in the table where it belongs, then reference it through foreign keys.

Examples:

- a problem exists once
- a pattern exists once
- a mistake category exists once
- a user's attempt references the problem
- a journal entry references the problem/pattern/attempt
- a revision references the problem
- a revision attempt references the revision item

## 2.3 Preserve historical events

Do not overwrite events that have analytical value.

Keep historical records for:

- attempts
- revision attempts
- contest participation

## 2.4 Separate current state from history

`revisions` represents the **current schedule**.

`revision_attempts` represents **what happened during every review**.

This preserves both current state and history.

## 2.5 Do not store presentation-only values

Do not store:

- green calendar intensity
- dashboard card positions
- UI sort order unless it is a true product rule
- analytics card values that can be derived reliably

Derive presentation from meaningful data.

## 2.6 Business logic stays outside page components

Daily scheduling, revision scheduling, pattern scoring, analytics aggregation, and calendar intensity belong in dedicated server/business-logic modules.

---

# 3. Final Entity Map

Recommended MVP entities:

```text
profiles
user_settings

problems
patterns
topics

problem_patterns
problem_topics

mistakes

attempts
attempt_mistakes

journal_entries

revisions
revision_attempts

daily_tasks
daily_activity

contest_participations

weekly_curriculum
```

Relationship overview:

```text
auth.users
    │
    ▼
profiles
    │
    ├─────────────► user_settings
    │
    ├─────────────► attempts ─────────────► problems
    │                     │
    │                     └───────────────► attempt_mistakes ─────► mistakes
    │
    ├─────────────► journal_entries ───────► problems
    │                     │                  patterns
    │                     └────────────────► attempts
    │
    ├─────────────► revisions ─────────────► problems
    │                     │
    │                     └───────────────► revision_attempts
    │
    ├─────────────► daily_tasks ───────────► problems / revisions
    │
    ├─────────────► daily_activity
    │
    └─────────────► contest_participations

problems ─────► problem_patterns ─────► patterns
problems ─────► problem_topics   ─────► topics

weekly_curriculum
    └── configuration used by scheduling/recommendation logic
```

---

# 4. `profiles`

## Purpose

Application profile information for an authenticated user.

Supabase Auth owns credentials and authentication identity. `profiles` owns product-level profile information.

## Columns

| Column | Type | Null | Default | Purpose |
|---|---|---:|---|---|
| `id` | `uuid` | No | auth user id | PK + FK to `auth.users.id` |
| `display_name` | `text` | No | — | Name shown in the application |
| `timezone` | `text` | No | configured default | IANA timezone used for local-day logic |
| `created_at` | `timestamptz` | No | `now()` | Creation time |
| `updated_at` | `timestamptz` | No | `now()` | Last update |

## Decisions

- **No `avatar_url`.** The finalized MVP does not need profile pictures.
- Timezone is important because Dashboard, Revision, Calendar, streaks, and daily task generation depend on the user's local day.

## Constraints

- `id` references `auth.users(id)`.
- `display_name` must not be blank.
- `timezone` should be validated as a valid IANA timezone at the application layer.

---

# 5. `user_settings`

## Purpose

Stores preferences changed through the Settings modal.

## Columns

| Column | Type | Null | Default | Purpose |
|---|---|---:|---|---|
| `user_id` | `uuid` | No | — | PK + FK to `profiles.id` |
| `weekday_problem_target` | `smallint` | No | `2` | New problems Mon–Fri |
| `difficulty_mode` | `text` | No | `adaptive` | Difficulty preference |
| `practice_days` | `smallint[]` | No | configured default | Optional availability preference |
| `weekday_revision_target` | `smallint` | No | `1` | Revisions Mon–Fri |
| `saturday_revision_target` | `smallint` | No | `3` | Revisions Saturday |
| `daily_practice_reminder_enabled` | `boolean` | No | `true` | Daily practice reminder |
| `revision_reminder_enabled` | `boolean` | No | `true` | Revision reminder |
| `reminder_time` | `time` | No | configured default | Local reminder time |
| `theme` | `text` | No | `system` | light/dark/system |
| `created_at` | `timestamptz` | No | `now()` | Creation |
| `updated_at` | `timestamptz` | No | `now()` | Update |

## Final weekly defaults

```text
Mon–Fri
2 new problems + 1 revision

Saturday
3 revisions only

Sunday
LeetCode contest only
```

The weekly schedule itself is application business logic; these settings provide sensible user preferences for the configurable parts.

For the MVP, Sunday remains fixed at:

- 0 new problems
- 0 revisions
- contest task only

## Constraints

- problem/revision targets must be non-negative
- `difficulty_mode` ∈ `adaptive | easy | medium | mixed`
- `theme` ∈ `light | dark | system`
- values in `practice_days` should represent valid weekdays

---

# 6. `problems`

## Purpose

The complete, global DSA problem library.

Problems must be **platform-agnostic**.

## Columns

| Column | Type | Null | Purpose |
|---|---|---:|---|
| `id` | `uuid` | No | PK |
| `title` | `text` | No | Problem title |
| `slug` | `text` | No | Internal unique identifier |
| `platform` | `text` | No | Coding platform |
| `url` | `text` | No | External problem URL |
| `difficulty` | `text` | No | easy/medium/hard |
| `is_active` | `boolean` | No | Whether available |
| `created_at` | `timestamptz` | No | Created |
| `updated_at` | `timestamptz` | No | Updated |

## Platforms

Initial controlled values:

```text
leetcode
geeksforgeeks
hackerrank
codeforces
codechef
other
```

This allows DSA OS to support several popular coding platforms without changing the schema.

## Intentionally excluded

Do not store in the MVP:

- problem description
- estimated minutes
- acceptance rate
- likes
- company lists
- comments
- full solution text
- social metrics

The user solves the problem on its external platform.

## Example

```text
Two Sum
platform = leetcode
url = https://leetcode.com/problems/two-sum/
difficulty = easy
```

```text
Array Manipulation
platform = hackerrank
url = <external URL>
difficulty = medium
```

## Constraints

- title non-empty
- slug unique
- URL validated at application layer
- difficulty ∈ `easy | medium | hard`
- platform from controlled set

---

# 7. `patterns`

## Purpose

Canonical DSA pattern catalog.

Examples:

```text
Hash Map
Two Pointers
Sliding Window
Binary Search
Prefix Sum
Recursion
DFS
BFS
Greedy
Backtracking
Dynamic Programming
```

## Columns

| Column | Type | Null |
|---|---|---:|
| `id` | `uuid` | No |
| `name` | `text` | No |
| `slug` | `text` | No |
| `description` | `text` | No |
| `is_active` | `boolean` | No |
| `created_at` | `timestamptz` | No |
| `updated_at` | `timestamptz` | No |

Pattern definitions are shared reference data, not duplicated per user.

---

# 8. `topics`

## Purpose

Broader categories used for Problems filters.

Patterns and topics are deliberately separate.

Example:

```text
Topic: Arrays
Pattern: Hash Map
```

## Columns

| Column | Type | Null |
|---|---|---:|
| `id` | `uuid` | No |
| `name` | `text` | No |
| `slug` | `text` | No |
| `is_active` | `boolean` | No |
| `created_at` | `timestamptz` | No |

---

# 9. `problem_patterns`

## Purpose

Many-to-many relationship between problems and patterns.

One problem can use multiple patterns.

Example:

```text
Longest Substring Without Repeating Characters
    ├── Sliding Window
    └── Hash Map
```

## Columns

| Column | Type |
|---|---|
| `problem_id` | `uuid` |
| `pattern_id` | `uuid` |
| `is_primary` | `boolean` |

## Primary key

```text
(problem_id, pattern_id)
```

`is_primary` allows the system to identify the main teaching pattern when one problem has several relevant techniques.

---

# 10. `problem_topics`

## Purpose

Many-to-many relationship between problems and broad topics.

## Columns

| Column | Type |
|---|---|
| `problem_id` | `uuid` |
| `topic_id` | `uuid` |

## Primary key

```text
(problem_id, topic_id)
```

---

# 11. `mistakes`

## Purpose

Canonical catalog of structured struggle categories selected after a problem attempt.

## Initial categories

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

## Columns

| Column | Type | Null |
|---|---|---:|
| `id` | `uuid` | No |
| `code` | `text` | No |
| `name` | `text` | No |
| `description` | `text` | Yes |
| `is_active` | `boolean` | No |
| `created_at` | `timestamptz` | No |

These are not personal notes. They are structured categories used to identify recurring failure modes.

---

# 12. `attempts`

## Purpose

Records what happened when a user attempted a problem.

This is one of the central tables in DSA OS.

## Columns

| Column | Type | Null | Purpose |
|---|---|---:|---|
| `id` | `uuid` | No | PK |
| `user_id` | `uuid` | No | Owner |
| `problem_id` | `uuid` | No | Problem attempted |
| `started_at` | `timestamptz` | No | Start |
| `completed_at` | `timestamptz` | Yes | Finish |
| `duration_seconds` | `integer` | Yes | Actual elapsed time |
| `result` | `text` | No | Attempt outcome |
| `initial_approach` | `text` | Yes | First thought before solving |
| `used_hint` | `boolean` | No | Hint dependency |
| `saw_approach` | `boolean` | No | Approach dependency |
| `saw_solution` | `boolean` | No | Complete solution dependency |
| `created_at` | `timestamptz` | No | Record creation |

## Result values

```text
independent
hint
approach
solution
failed
```

Meaning from the user's perspective:

- **independent** — solved without hint/approach/solution
- **hint** — solved after using a hint
- **approach** — needed the approach before solving
- **solution** — needed the complete solution
- **failed** — could not solve

## Why store actual duration

The user may spend 14 minutes or 48 minutes. The application should remember the actual elapsed time if it tracks a timer.

The product does not need an `estimated_minutes` field in the problem catalog.

## Why store the initial approach

The initial approach records what the user thought before seeing help. That gives DSA OS evidence about how the user's reasoning is developing.

## Constraints

If `completed_at` is present:

```text
completed_at >= started_at
```

If `duration_seconds` is present:

```text
duration_seconds >= 0
```

---

# 13. `attempt_mistakes`

## Purpose

Many-to-many connection between an attempt and one or more mistake categories.

Example:

```text
Attempt A101
    ├── pattern_recognition
    └── edge_case
```

## Columns

| Column | Type |
|---|---|
| `attempt_id` | `uuid` |
| `mistake_id` | `uuid` |

## Primary key

```text
(attempt_id, mistake_id)
```

## Example

User attempts Binary Search and reports:

> I couldn't recognize the approach and also got the boundary condition wrong.

Store:

```text
A101 → pattern_recognition
A101 → edge_case
```

After many attempts, Analytics can identify recurring mistakes.

---

# 14. `journal_entries`

## Purpose

Permanent personal Pattern Journal records.

The Journal answers:

> “What should I remember from this problem?”

## Columns

| Column | Type | Null | Purpose |
|---|---|---:|---|
| `id` | `uuid` | No | PK |
| `user_id` | `uuid` | No | Owner |
| `problem_id` | `uuid` | No | Problem |
| `attempt_id` | `uuid` | Yes | Source attempt |
| `pattern_id` | `uuid` | Yes | Main learned pattern |
| `failed_idea` | `text` | Yes | Failed approach |
| `key_observation` | `text` | Yes | Key insight |
| `time_complexity` | `text` | Yes | e.g. O(n) |
| `space_complexity` | `text` | Yes | e.g. O(n) |
| `what_to_remember` | `text` | No | Reusable lesson |
| `pattern_recognition` | `text` | Yes | Recognition state |
| `created_at` | `timestamptz` | No | Created |
| `updated_at` | `timestamptz` | No | Updated |

## Pattern recognition values

```text
independent
after_hint
not_recognized
```

## Distinction from Attempts

### Attempt

> What happened while I was solving?

### Journal

> What should I retain from the experience?

## Uniqueness

For MVP, prefer one current journal entry per problem per user:

```text
unique(user_id, problem_id)
```

Updating the entry does not erase the historical attempts.

---

# 15. `revisions`

## Purpose

Stores the user's **current revision schedule** for a problem.

It answers:

> “When should this problem be reviewed next?”

## Columns

| Column | Type | Null | Purpose |
|---|---|---:|---|
| `id` | `uuid` | No | PK |
| `user_id` | `uuid` | No | Owner |
| `problem_id` | `uuid` | No | Problem |
| `journal_entry_id` | `uuid` | Yes | Associated journal |
| `next_review_at` | `timestamptz` | No | Next scheduled review |
| `current_interval_days` | `integer` | No | Current interval |
| `review_count` | `integer` | No | Completed review count |
| `status` | `text` | No | active/paused |
| `created_at` | `timestamptz` | No | Created |
| `updated_at` | `timestamptz` | No | Updated |

## Uniqueness

```text
unique(user_id, problem_id)
```

A user should have one current revision schedule for a problem.

## Important

Do **not** use this table to store the entire revision history.

That belongs to `revision_attempts`.

---

# 16. `revision_attempts`

## Purpose

Historical record of every completed revision session.

## Columns

| Column | Type | Null | Purpose |
|---|---|---:|---|
| `id` | `uuid` | No | PK |
| `revision_id` | `uuid` | No | Revision item |
| `user_id` | `uuid` | No | Owner |
| `reviewed_at` | `timestamptz` | No | Review timestamp |
| `recall_result` | `text` | No | easy/partial/forgot |
| `user_pattern_answer` | `text` | Yes | Pattern recalled by user |
| `user_approach_answer` | `text` | Yes | Approach recalled by user |
| `previous_interval_days` | `integer` | Yes | Old interval |
| `new_interval_days` | `integer` | Yes | New interval |
| `next_review_at` | `timestamptz` | Yes | New scheduled date |
| `created_at` | `timestamptz` | No | Record creation |

## Recall values

```text
easy
partial
forgot
```

### Easy recall

User remembers the pattern and approach comfortably.

### Partial

User remembers part of the solution but misses an important idea/detail.

### Forgot

User cannot reconstruct the approach meaningfully.

## Why store the user's answers

Revision is active recall. Keeping the actual recalled text allows the product to compare memory against the original Journal record and supports richer analytics later.

---

# 17. `daily_tasks`

## Purpose

Persists the **actual tasks assigned for a specific user/date**.

This table is essential for stable Dashboard behavior.

The application should not choose a different pair of problems every time the user refreshes the page.

## Columns

| Column | Type | Null | Purpose |
|---|---|---:|---|
| `id` | `uuid` | No | PK |
| `user_id` | `uuid` | No | Owner |
| `task_date` | `date` | No | User's local date |
| `task_type` | `text` | No | new_problem/revision/contest |
| `slot_number` | `smallint` | No | Daily ordering |
| `problem_id` | `uuid` | Yes | New problem task |
| `revision_id` | `uuid` | Yes | Revision task |
| `status` | `text` | No | pending/completed/skipped |
| `source` | `text` | No | scheduler/manual/system |
| `completed_at` | `timestamptz` | Yes | Completion |
| `created_at` | `timestamptz` | No | Creation |

## Task types

```text
new_problem
revision
contest
```

## Final weekly generation

### Monday–Friday

```text
slot 1 → new_problem
slot 2 → new_problem
slot 3 → revision
```

### Saturday

```text
slot 1 → revision
slot 2 → revision
slot 3 → revision
```

### Sunday

```text
slot 1 → contest
```

No new-problem or revision task is generated on Sunday.

## Important consistency rules

A `new_problem` task must have `problem_id` and no `revision_id`.

A `revision` task must have `revision_id` and no `problem_id`.

A `contest` task does not need either.

These rules should be validated both in application logic and with database constraints where practical.

## Idempotency

Use a uniqueness rule around:

```text
(user_id, task_date, task_type, slot_number)
```

The scheduler must safely handle repeated execution without creating duplicate daily tasks.

---

# 18. `daily_activity`

## Purpose

Compact daily aggregate used primarily by Calendar and quick history queries.

## Columns

| Column | Type | Null | Purpose |
|---|---|---:|---|
| `id` | `uuid` | No | PK |
| `user_id` | `uuid` | No | Owner |
| `activity_date` | `date` | No | User-local day |
| `problems_solved` | `smallint` | No | Successfully solved problems |
| `revisions_completed` | `smallint` | No | Completed revisions |
| `contest_participated` | `boolean` | No | Contest participation |
| `updated_at` | `timestamptz` | No | Last update |

## Uniqueness

```text
unique(user_id, activity_date)
```

## Source events

- `problems_solved` comes from successful problem attempts.
- `revisions_completed` comes from completed revision attempts.
- `contest_participated` comes from contest participation.

The normal user UI should not manually edit these aggregates.

---

# 19. `contest_participations`

## Purpose

Stores the user's participation in contests/challenges.

Sunday is dedicated to the LeetCode contest according to the finalized product schedule.

## Columns

| Column | Type | Null | Purpose |
|---|---|---:|---|
| `id` | `uuid` | No | PK |
| `user_id` | `uuid` | No | Owner |
| `contest_date` | `date` | No | User-local date |
| `platform` | `text` | No | e.g. leetcode |
| `contest_name` | `text` | No | Contest name |
| `url` | `text` | Yes | Contest URL |
| `participated` | `boolean` | No | Participation state |
| `created_at` | `timestamptz` | No | Record creation |

## MVP scope

Store participation, not detailed contest rating analytics.

Do not add ranking, score, rating, percentile, etc. until contest analytics become a real requirement.

---

# 20. `weekly_curriculum`

## Purpose

Stores the fixed weekly curriculum used by Dashboard and scheduling logic.

## Columns

| Column | Type | Null | Purpose |
|---|---|---:|---|
| `id` | `uuid` | No | PK |
| `day_of_week` | `smallint` | No | 1–7 |
| `focus_title` | `text` | No | Focus title |
| `focus_description` | `text` | Yes | Optional explanation |
| `is_active` | `boolean` | No | Current |
| `created_at` | `timestamptz` | No | Created |
| `updated_at` | `timestamptz` | No | Updated |

## Final curriculum

```text
Monday
Arrays + Hashing

Tuesday
Two Pointers + Sliding Window

Wednesday
Binary Search + Prefix Sum

Thursday
Linked List + Stack

Friday
Trees + BST

Saturday
Graphs

Sunday
LeetCode Contest
```

This is configuration/data, not another UI page.

---

# 21. Entity Ownership Matrix

| Entity | Global or User-owned | User isolation required |
|---|---|---:|
| `profiles` | User | Yes |
| `user_settings` | User | Yes |
| `problems` | Global | No, but writes restricted |
| `patterns` | Global | No, but writes restricted |
| `topics` | Global | No, but writes restricted |
| `problem_patterns` | Global | No |
| `problem_topics` | Global | No |
| `mistakes` | Global | No |
| `attempts` | User | Yes |
| `attempt_mistakes` | Through user attempt | Yes |
| `journal_entries` | User | Yes |
| `revisions` | User | Yes |
| `revision_attempts` | User | Yes |
| `daily_tasks` | User | Yes |
| `daily_activity` | User | Yes |
| `contest_participations` | User | Yes |
| `weekly_curriculum` | Global | No |

---

# 22. Normalization — DSA OS Example

Normalization means organizing data so that the same fact is not unnecessarily copied in many places.

## Bad design

Imagine `attempts` contains:

```text
attempt_id
user_name
user_email
problem_title
platform
problem_url
difficulty
pattern_name
pattern_description
result
journal_text
revision_date
```

If the user solves Two Sum 10 times, the database repeats:

```text
Two Sum
LeetCode
Easy
Hash Map
URL
```

10 times.

That creates duplication and makes updates dangerous.

## Normalized design

`problems` stores the problem once:

```text
P101 | Two Sum | LeetCode | Easy | URL
```

`patterns` stores the pattern once:

```text
PT01 | Hash Map
```

`problem_patterns` connects them:

```text
P101 | PT01
```

Each attempt stores only its relationship:

```text
A001 | User1 | P101 | independent
A002 | User1 | P101 | hint
```

This means:

> Store a fact in the entity it belongs to, then reference it elsewhere.

## Do not over-normalize

Normalization does not mean creating dozens of microscopic tables.

A separate table is appropriate when the concept:

- has its own identity
- has its own lifecycle
- is reused by many records
- needs independent querying
- needs its own constraints

That is why Problems, Patterns, Attempts, Journal Entries, and Revision records are separate entities.

---

# 23. Why Attempts and Revision Attempts Are Separate

These are two different events.

## Attempt

> I tried to solve Two Sum for the first time.

Possible result:

```text
Solved independently
```

## Revision Attempt

> I reviewed Two Sum later to test memory.

Possible result:

```text
Partial recall
```

They must not be the same entity because they answer different product questions.

---

# 24. Current State vs Historical State

## Current state

`revisions`:

```text
Two Sum
Next review: Sep 5
Interval: 14 days
```

## Historical state

`revision_attempts`:

```text
Aug 24 → Easy
Aug 28 → Partial
Sep 5  → Easy
```

If only the current state were stored, the product would lose the information necessary to understand retention over time.

---

# 25. Final Spaced-Repetition Model

The user's finalized weekly workload is:

```text
Monday–Friday
2 new problems + 1 revision

Saturday
3 revisions only

Sunday
LeetCode contest only
```

This is a **daily workload policy**, while revision intervals are an **adaptive scheduling policy**.

They are not the same thing.

## 25.1 Revision intervals

A practical MVP policy:

### After a first successful problem attempt

```text
independent → 3 days
hint        → 2 days
approach    → 2 days
solution     → 1 day
failed       → 1 day
```

### After revision

Easy recall moves the item to a longer interval, approximately:

```text
3 → 7 → 14 → 30 → 60 days
```

Partial recall moves it to a shorter interval.

Forgot returns it to a short interval.

These values are a starting policy, not a claim of mathematical optimality.

## 25.2 Daily selection policy

The scheduler first finds all due/overdue revision candidates, then selects the allowed number for that weekday.

### Monday–Friday

```text
LIMIT 1
```

### Saturday

```text
LIMIT 3
```

### Sunday

```text
LIMIT 0
```

## 25.3 Priority

Recommended priority order:

```text
1. Overdue
2. Previously forgotten
3. Previously partial
4. Normally due
5. Oldest due date
6. Weak-pattern tie-breaker
```

This avoids making the user review every due problem on weekdays while still allowing Saturday to act as the higher-capacity review day.

---

# 26. Daily Task Generation

The scheduler should create persistent tasks once per local day.

## Monday example

```text
daily_tasks

2026-08-31 | new_problem | slot 1 | Two Sum
2026-08-31 | new_problem | slot 2 | Valid Anagram
2026-08-31 | revision    | slot 3 | Longest Substring
```

## Saturday example

```text
2026-09-05 | revision | slot 1 | Binary Search
2026-09-05 | revision | slot 2 | Two Sum
2026-09-05 | revision | slot 3 | Valid Anagram
```

## Sunday example

```text
2026-09-06 | contest | slot 1 | —
```

Once generated, the Dashboard should read these rows rather than reselecting problems.

---

# 27. New Problem Selection Logic

For Monday–Friday:

1. Read the current weekly curriculum focus.
2. Identify relevant patterns/topics.
3. Calculate the user's weak patterns when sufficient history exists.
4. Prefer appropriate difficulty.
5. Prefer unsolved problems.
6. Avoid recent duplicates.
7. Select the target number of problems.
8. Persist them into `daily_tasks`.

The recommendation engine should be deterministic and explainable for the MVP.

---

# 28. Difficulty Logic

Do not increase difficulty simply because the user has been active for a certain number of days.

A sensible starting distribution can be:

```text
Early stage
80% Easy
20% Medium

Developing
60% Easy
40% Medium

Stronger
30% Easy
60% Medium
10% Hard
```

The actual selection should be influenced by recent independent performance.

This logic belongs in business logic, not database triggers.

---

# 29. Analytics Unlock Rule

Analytics becomes meaningful only after enough evidence exists.

## Final rule

Unlock Analytics after the user has solved at least **10 distinct problems successfully**.

A successful problem result is:

```text
independent
hint
approach
solution
```

`failed` does not count as a solved problem.

## Before the threshold

Show a clean state:

> Your analytics will appear after you solve 10 problems.

Do not generate misleading charts with insufficient evidence.

---

# 30. Analytics Source Data

## Problems Solved

Count distinct successfully solved problems for the user.

Conceptually:

```sql
COUNT(DISTINCT problem_id)
WHERE result IN ('independent', 'hint', 'approach', 'solution')
```

## Independent Solve Rate

Recommended definition:

```text
independent successful solves
--------------------------------
all successful solves
```

Example:

```text
32 independent
50 successful

64% independent solve rate
```

## Revision Recall

Recommended:

```text
easy recall revisions
----------------------
all completed revisions
```

## Recurring mistakes

Count rows in `attempt_mistakes` by mistake category.

## Focus Areas

Derived from user performance across patterns, using inputs such as:

- independent solve rate
- pattern recognition
- hint/solution dependency
- revision recall
- recent performance

Exact scoring belongs in `DSA_OS_BUSINESS_LOGIC.md`.

---

# 31. Calendar Rules

Calendar is historical activity, not scheduling.

## Green intensity

Final user-approved rules:

```text
0 solved
→ neutral

1 solved
→ light green

2+ solved
→ dark green

Weekend + contest
→ dark green
```

The calendar should primarily communicate problems solved.

Contest participation is shown in the selected-day detail panel.

## Selected day

Only display:

```text
Problems Solved
Revision
Contest
```

Do not show pattern recognition, journal entries, or analytics inside the Calendar day detail.

---

# 32. Streak Calculation

An active day can be defined as one where the user has at least one meaningful activity:

```text
problems_solved >= 1
OR revisions_completed >= 1
OR contest_participated = true
```

The streak counts consecutive local calendar days.

This means:

- weekday problem solving can maintain the streak
- Saturday revisions can maintain the streak
- Sunday contest participation can maintain the streak
- a completely inactive day breaks the streak

Do not make the current streak manually editable in the MVP.

---

# 33. Daily Activity Synchronization

## Problem success

After a successful attempt:

```text
daily_activity.problems_solved += 1
```

The same event should be linked to its source `attempt`.

## Revision completion

After a successful revision flow:

```text
daily_activity.revisions_completed += 1
```

## Contest participation

When the user marks the contest as participated:

```text
daily_activity.contest_participated = true
```

---

# 34. Transaction Boundaries

Some operations update several tables and should be atomic.

## Problem completion transaction

A typical successful completion can require:

```text
1. create attempt
2. create attempt_mistakes
3. create/update journal entry where applicable
4. create/update revision
5. complete daily_task
6. update daily_activity
```

Where these operations must succeed together, wrap them in a server-side database transaction.

## Revision completion transaction

```text
1. create revision_attempt
2. calculate new interval
3. update revisions
4. complete daily_task
5. update daily_activity
```

Do not leave the system with a revision attempt recorded but no next-review state when those operations are intended to be atomic.

---

# 35. Foreign-Key Delete Strategy

## User deletion

Deleting a user should cascade to user-owned records, subject to Supabase/Auth lifecycle behavior.

User-owned data includes:

- profiles
- settings
- attempts
- attempt_mistakes
- journal entries
- revisions
- revision attempts
- daily tasks
- daily activity
- contest participation

## Problem deletion

Do not hard-delete a problem that has user history.

Prefer:

```text
is_active = false
```

This preserves historical attempts/journals/revisions.

## Pattern/topic/mistake deletion

Prefer deactivation when historical records reference the entity.

---

# 36. Index Strategy

Create indexes based on actual access patterns.

## `attempts`

Useful indexes:

```text
(user_id, problem_id)
(user_id, created_at DESC)
(user_id, result)
(user_id, completed_at DESC)
```

## `attempt_mistakes`

```text
(attempt_id)
(mistake_id)
```

## `journal_entries`

```text
(user_id, created_at DESC)
(user_id, pattern_id)
(user_id, problem_id)
```

## `revisions`

```text
(user_id, next_review_at)
(user_id, status)
(user_id, problem_id)
```

The most important revision query is effectively:

> give me this user's active due/overdue revision candidates ordered for selection.

## `revision_attempts`

```text
(revision_id, reviewed_at DESC)
(user_id, reviewed_at DESC)
(user_id, recall_result)
```

## `daily_tasks`

```text
(user_id, task_date)
(user_id, task_date, status)
(user_id, task_date, task_type)
```

## `daily_activity`

```text
unique(user_id, activity_date)
```

## `problems`

Useful for:

```text
platform
difficulty
is_active
slug
```

For title search, add PostgreSQL full-text/trigram search only when the MVP search requirements justify it.

---

# 37. Search Strategy

Problems must support title/keyword search.

Start simple:

- title
- slug

Later, PostgreSQL full-text/trigram search can cover additional searchable fields.

Do not introduce an external search engine for the MVP.

Journal search can initially use PostgreSQL text search or simple `ILIKE`-style queries, then be upgraded only if the dataset requires it.

---

# 38. Timezone Rules

Store event timestamps as:

```text
timestamptz
```

Examples:

- `attempts.started_at`
- `attempts.completed_at`
- `revision_attempts.reviewed_at`
- `created_at`

Date-only records use the user's local calendar date:

- `daily_tasks.task_date`
- `daily_activity.activity_date`
- `contest_participations.contest_date`

The application determines these using the user's configured timezone.

Do not treat server UTC midnight as the user's day boundary.

---

# 39. Data Duplication Rules

Avoid duplicating the same semantic field merely for convenience.

Examples:

## Do not put pattern name in attempts

Use:

```text
attempts.problem_id
problem_patterns
patterns
```

Instead of:

```text
attempts.pattern_name = 'Hash Map'
```

## Do not put user problem status in `problems`

A problem is global.

User-specific status comes from attempts/revisions/daily tasks.

## Do not manually store Analytics totals

Derive them from event data unless performance later requires an explicit materialized aggregate.

---

# 40. When Derived Data Is Appropriate

Derived data is acceptable when it improves performance and has a clear source of truth.

`daily_activity` is an example.

It summarizes source events into a daily aggregate for Calendar and history queries.

The application must be able to reconstruct or validate it from canonical events if needed.

Do not let derived aggregates become independently editable truth.

---

# 41. RLS / Supabase Security

Because multiple users will use DSA OS, all user-owned data must be isolated.

## Tables requiring user isolation

RLS should be enabled for:

```text
profiles
user_settings
attempts
attempt_mistakes
journal_entries
revisions
revision_attempts
daily_tasks
daily_activity
contest_participations
```

## Typical ownership rule

Conceptually:

```sql
auth.uid() = user_id
```

For `profiles`, the row key itself represents the user.

## Shared reference data

These are shared:

```text
problems
patterns
topics
problem_patterns
problem_topics
mistakes
weekly_curriculum
```

Authenticated users can read them, while administrative writes should be restricted.

---

# 42. RLS Policy Intent by Table

## Profiles

User can:

- read own profile
- update own profile

Cannot read another user's profile.

## User Settings

User can:

- read own settings
- update own settings
- create own settings

## Attempts

User can:

- read own attempts
- create own attempts
- update only permitted own attempt state

Cannot read another user's attempts.

## Attempt Mistakes

Access must be limited through the user's own attempts.

## Journal Entries

User can read, create, update, and optionally delete only their own entries.

## Revisions

User can access only their own revision items.

Sensitive schedule mutation should preferably be performed through trusted server-side application logic.

## Revision Attempts

User can read their own review history and create their own review events.

## Daily Tasks

User can read their own tasks. Creation should be controlled by scheduler/server logic.

## Daily Activity

User can read their own activity. Writes should be service/application controlled.

## Contest Participation

User can read and create/update their own participation records.

---

# 43. Common Database Queries

## Today's tasks

```text
SELECT daily_tasks
WHERE user_id = current_user
AND task_date = local_today
ORDER BY slot_number
```

## Due revisions

```text
SELECT revisions
WHERE user_id = current_user
AND status = active
AND next_review_at <= now
ORDER BY priority
LIMIT target
```

`target` is:

```text
1 on Monday–Friday
3 on Saturday
0 on Sunday
```

## Problem library

Filter by:

- status derived from user history
- difficulty
- platform
- pattern
- topic

## Calendar day

For a selected date, combine:

```text
daily_activity
attempts
revision_attempts
contest_participations
```

## Analytics threshold

Count distinct successful `problem_id` values for the current user.

Analytics unlocks at 10.

---

# 44. Seed Data

The MVP should include enough reference data for the application to be meaningful immediately after setup.

## Patterns

At least:

```text
Arrays & Hashing
Two Pointers
Sliding Window
Binary Search
Prefix Sum
Linked List
Stack
Trees
BST
Graphs
DFS
BFS
Recursion
Backtracking
Greedy
Dynamic Programming
Heap
Intervals
Union Find
```

## Topics

At least:

```text
Arrays
Strings
Linked Lists
Stacks
Queues
Trees
Graphs
Heaps
Intervals
Matrices
```

## Problems

Initial seed target:

```text
50–100 problems
```

Then expand toward 500+.

Problems may come from supported external coding platforms. Do not copy third-party problem statements into the database unless the source/license/terms permit that use.

---

# 45. Migration Strategy

Use versioned SQL migrations rather than manually building production schema through random dashboard clicks.

Suggested sequence:

```text
001_profiles.sql
002_user_settings.sql
003_patterns.sql
004_topics.sql
005_problems.sql
006_problem_relationships.sql
007_mistakes.sql
008_attempts.sql
009_attempt_mistakes.sql
010_journal_entries.sql
011_revisions.sql
012_revision_attempts.sql
013_daily_tasks.sql
014_daily_activity.sql
015_contest_participations.sql
016_weekly_curriculum.sql
017_rls_policies.sql
018_indexes.sql
019_seed_data.sql
```

These filenames are illustrative; a different migration naming scheme is acceptable if it remains deterministic and version-controlled.

---

# 46. Recommended PostgreSQL Types

## IDs

Use:

```sql
uuid
```

## Event timestamps

Use:

```sql
timestamptz
```

## Date-only values

Use:

```sql
date
```

## Clock-only preference

Use:

```sql
time
```

## Durations

Use:

```sql
integer
```

in seconds.

## Small counts

Use `smallint` where the value is naturally small.

Use `integer` where the range could realistically grow.

---

# 47. Constraint Strategy

Prefer database constraints for invariants that must always hold.

Examples:

```text
difficulty ∈ easy/medium/hard
result ∈ independent/hint/approach/solution/failed
recall_result ∈ easy/partial/forgot
pattern_recognition ∈ independent/after_hint/not_recognized
interval >= 1
review_count >= 0
duration_seconds >= 0
```

Application validation with Zod should provide user-facing validation; database constraints provide final data integrity.

---

# 48. Optional SQL Schema Skeleton

The implementation agent should generate exact migration SQL from this model. The following is a conceptual skeleton, not a copy-paste production migration.

```sql
create table problems (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  platform text not null,
  url text not null,
  difficulty text not null
    check (difficulty in ('easy', 'medium', 'hard')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table patterns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table problem_patterns (
  problem_id uuid not null references problems(id) on delete restrict,
  pattern_id uuid not null references patterns(id) on delete restrict,
  is_primary boolean not null default false,
  primary key (problem_id, pattern_id)
);
```

The full schema should be generated as migrations after final review rather than manually maintaining duplicate SQL snippets in several locations.

---

# 49. Daily Scheduling Algorithm — Data Perspective

## Monday–Friday

```text
Read weekly curriculum for today
        ↓
Find candidate unsolved problems
        ↓
Weight current weak patterns
        ↓
Apply difficulty preference
        ↓
Exclude recent duplicates
        ↓
Choose 2
        ↓
Find due/overdue revisions
        ↓
Choose highest-priority 1
        ↓
Persist 3 daily_tasks
```

## Saturday

```text
Find due/overdue revisions
        ↓
Rank
        ↓
Choose 3
        ↓
Persist 3 daily_tasks
```

## Sunday

```text
Persist 1 contest task
No new problems
No revision task
```

---

# 50. Why the One-Revision Rule Is No Longer a Problem

The product no longer requires one revision item every day without flexibility.

Instead:

```text
Weekdays → 1 revision
Saturday → 3 revisions
Sunday → 0 revisions
```

The revision system still uses actual adaptive intervals.

The daily quota controls workload; the interval determines eligibility.

This is the important distinction.

Example:

```text
Two Sum due Monday
→ selected Monday

Binary Search due Tuesday
→ selected Tuesday

Longest Substring becomes due Saturday
→ can be selected Saturday
```

If several items become overdue, priority determines which items enter the fixed daily quota.

This keeps the user's routine predictable without throwing away spaced-repetition logic.

---

# 51. Historical Integrity

Never rewrite an old attempt merely because a later attempt was better.

Example:

```text
Aug 20 → Two Sum → failed
Aug 21 → Two Sum → hint
Aug 25 → Two Sum → independent
```

All three events matter.

Analytics can then understand improvement over time.

The current “best/current status” can be derived from the latest relevant attempt, but history remains intact.

---

# 52. Problem Status Derivation

The Problems page may need a user-facing status.

Do not store one global `status` on `problems`.

Derive user-specific status from their latest attempts/revision data.

Example:

```text
No attempts
→ Not attempted

Latest successful independent attempt
→ Solved independently

Latest relevant attempt used hint
→ Solved with hint

Active revision due
→ Needs revision
```

The exact precedence should be defined in business logic.

---

# 53. Journal Status Derivation

Journal filters such as `Comfortable` and `Needs Review` should also preferably derive from revision/recall history rather than creating redundant state fields unless later performance requires caching.

For example:

```text
Recent easy recalls
→ Comfortable

Recent forgot/partial or overdue
→ Needs Review
```

Exact classification belongs in business logic.

---

# 54. Data Flow Into Each Screen

## Dashboard

Reads:

- `daily_tasks`
- `problems`
- `revisions`
- `weekly_curriculum`
- user performance aggregates

## Problems

Reads:

- `problems`
- `patterns`
- `topics`
- user's `attempts`
- user's `revisions`

## Problem Workspace

Reads/writes:

- `problems`
- `attempts`
- `attempt_mistakes`
- `daily_tasks`

## Pattern Journal

Reads/writes:

- `journal_entries`
- `problems`
- `patterns`
- `attempts`

## Revision

Reads/writes:

- `revisions`
- `revision_attempts`
- `journal_entries`
- `daily_tasks`

## Analytics

Reads/aggregates:

- `attempts`
- `attempt_mistakes`
- `problem_patterns`
- `revision_attempts`

## Calendar

Reads:

- `daily_activity`
- `attempts`
- `revision_attempts`
- `contest_participations`

## Settings

Reads/writes:

- `profiles`
- `user_settings`

---

# 55. Database Does Not Own the UI

The database should not know about:

- dashboard card locations
- exact button labels
- colors
- animations
- modal positioning
- screen layout

Those belong to the Design System and Screen Specification.

Database stores product facts and relationships.

---

# 56. Database Does Not Own All Business Intelligence

The database stores reliable facts.

Application services calculate:

- recommended problems
- pattern strength
- revision priority
- next revision date
- analytics summaries
- calendar visual intensity

Keep those calculations testable and isolated.

---

# 57. Future-Proofing Without Overengineering

The model intentionally supports future additions such as:

- more coding platforms
- AI hints
- AI feedback
- Interview Mode
- richer contest analytics
- richer pattern mastery
- recommendation history

But do not create tables for these future features until their actual requirements are defined.

---

# 58. Final MVP Data Model Checklist

## User

- [x] authenticated identity via Supabase Auth
- [x] profile
- [x] timezone
- [x] no avatar

## Problem library

- [x] platform-agnostic
- [x] external URL
- [x] title
- [x] difficulty
- [x] active/inactive
- [x] no description required
- [x] no estimated minutes

## Patterns/topics

- [x] canonical patterns
- [x] broad topics
- [x] many-to-many relationships

## Attempts

- [x] result
- [x] initial approach
- [x] actual duration
- [x] hint/approach/solution dependency
- [x] mistake categories

## Pattern Journal

- [x] failed idea
- [x] key observation
- [x] pattern
- [x] complexity
- [x] what to remember
- [x] pattern recognition

## Revision

- [x] current schedule
- [x] review history
- [x] active recall answers
- [x] recall result
- [x] adaptive interval

## Daily workload

- [x] Mon–Fri: 2 new + 1 revision
- [x] Saturday: 3 revisions
- [x] Sunday: contest only
- [x] persistent daily tasks
- [x] idempotent scheduler

## Calendar

- [x] 0 → neutral
- [x] 1 → light green
- [x] 2+ → dark green
- [x] weekend contest → dark green
- [x] selected-day work only

## Analytics

- [x] locked until 10 distinct solved problems
- [x] independent solve rate
- [x] revision recall
- [x] recurring mistakes
- [x] focus areas

## Security

- [x] RLS for user-owned data
- [x] user isolation
- [x] controlled reference-data writes

---

# 59. Final Database North Star

The database should make this product promise possible:

> **Every meaningful action the user takes creates reliable information that can improve a future action.**

```text
Solve a problem
    ↓
learn from the attempt
    ↓
store the lesson
    ↓
review it later
    ↓
measure retention
    ↓
identify weakness
    ↓
recommend better practice
    ↓
repeat
```

The database is therefore not just storage.

It is the **memory and feedback foundation of DSA OS**.
