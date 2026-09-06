# DSA OS — Business Logic Specification

> Version: 1.0  
> Status: Final MVP business-rules source of truth  
> Companion documents:
> - `DSA_OS_DESIGN_SYSTEM.md`
> - `DSA_OS_SCREEN_SPEC.md`
> - `DSA_OS_DATABASE.md`

---

## 1. Purpose

This document defines the deterministic rules that make DSA OS operate as one coordinated learning system.

It is intentionally separate from:

- **Design System** — visual rules
- **Screen Specification** — UI/UX and screen behavior
- **Database Specification** — tables, keys, constraints, persistence

The business-logic layer decides:

- what the user is assigned today
- which problem is selected
- when a problem enters revision
- which revision is selected
- how revision intervals change
- how attempts affect progress
- how patterns become Focus Areas
- when Analytics becomes available
- how Calendar activity is calculated
- how streaks work
- how recommendations adapt
- how all these systems coordinate without duplicate or contradictory state

---

# 2. Product North Star

DSA OS exists to improve:

1. independent problem solving
2. pattern recognition
3. learning from mistakes
4. long-term retention
5. consistency

Problem count is useful context, but it is not the primary measure of mastery.

The core loop is:

```text
Weekly Curriculum
      ↓
Daily Scheduler
      ↓
Daily Tasks
      ↓
Problem / Revision / Contest
      ↓
Actual User Event
      ↓
Attempt / Revision / Contest Record
      ↓
Journal / Revision State / Activity
      ↓
Analytics + Recommendations
      ↓
Future Daily Scheduling
```

Every meaningful action should produce reliable data that can improve a later action.

---

# 3. Final Weekly Operating Model

The default DSA OS week is fixed:

| Day | New Problems | Revisions | Contest |
|---|---:|---:|---|
| Monday | 2 | 1 | No |
| Tuesday | 2 | 1 | No |
| Wednesday | 2 | 1 | No |
| Thursday | 2 | 1 | No |
| Friday | 2 | 1 | No |
| Saturday | 0 | 3 | No |
| Sunday | 0 | 0 | LeetCode contest |

### Important product rules

- Saturday is revision-only.
- Sunday is contest-only.
- Sunday never receives normal new-problem or revision tasks.
- Weekly curriculum is shown in Dashboard; it is not a separate planning page.
- User preferences may adjust normal weekday quantities where allowed, but must not silently convert Saturday or Sunday into a different type of day.
- Historical days must never be rewritten because current settings changed.

---

# 4. Business-Logic Layers

Keep the business logic separated into these layers:

```text
A. Identity & time
B. Curriculum
C. Daily task scheduling
D. Problem recommendation
E. Problem attempts
F. Journal
G. Revision scheduling
H. Daily activity
I. Calendar
J. Streak
K. Analytics
L. Pattern mastery
M. Recommendation feedback
```

No React component should contain the canonical rules for these systems.

---

# 5. Authoritative Data vs Derived Data

## 5.1 Authoritative event data

These are facts that actually happened:

- `attempts`
- `revision_attempts`
- `contest_participations`

Examples:

> User solved Two Sum independently.

> User forgot Binary Search during revision.

> User participated in Sunday's contest.

These records should be preserved.

## 5.2 Current-state data

These represent the current state:

- `revisions`
- `daily_tasks`
- `user_settings`

Example:

> Two Sum is currently due on September 5.

## 5.3 Derived/aggregate data

These summarize authoritative records:

- `daily_activity`
- Analytics metrics
- pattern mastery
- streak

Derived values must not contradict authoritative records.

---

# 6. Time and Timezone Rules

The user's configured timezone determines:

- "today"
- day of week
- task date
- revision due-day interpretation
- Calendar date
- streak date
- reminder time

Store actual event timestamps as `timestamptz`.

Convert to the user's timezone before determining the local date.

Never calculate user-facing daily logic from UTC date alone.

### Example

If a user is in IST:

```text
23:58 IST → Monday
00:03 IST → Tuesday
```

These are different DSA days even if UTC timestamps are close.

---

# 7. User Initialization

On successful signup:

```text
Supabase Auth identity
        ↓
profile
        ↓
default user_settings
```

Defaults:

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

No avatar is required.

---

# 8. Daily Scheduling — Core Rule

The scheduler is responsible for ensuring a user's current day has the correct persisted tasks.

It must be:

- deterministic
- idempotent
- timezone-aware
- concurrency-safe
- explainable

### High-level algorithm

```text
get user timezone
        ↓
calculate local date
        ↓
calculate local weekday
        ↓
load existing daily_tasks
        ↓
if already planned:
      return existing tasks
else:
      determine day type
      select required tasks
      persist them atomically
```

Never regenerate a completed day just because the Dashboard was refreshed.

---

# 9. Daily Scheduler by Day

## Monday–Friday

Default:

```text
2 new problems
1 revision
```

Task order:

```text
slot 1 → new problem
slot 2 → new problem
slot 3 → revision
```

## Saturday

```text
slot 1 → revision
slot 2 → revision
slot 3 → revision
```

No new problems.

## Sunday

```text
slot 1 → contest
```

No normal problems.

No revision.

---

# 10. Daily Task Idempotency

The same user's date must not receive duplicate task slots.

Conceptually enforce uniqueness around:

```text
(user_id, task_date, task_type, slot_number)
```

If two processes try to generate the same day concurrently:

- one wins
- the other treats the task as already created
- no duplicate assignments appear

---

# 11. Daily Task Stability

Once today's task exists, do not silently replace it because:

- Analytics changed
- the user refreshed
- a different problem scored higher later
- the weekly focus was recalculated
- the user opened another page

The assignment is stable for that day unless an explicit administrative/replanning operation is introduced later.

---

# 12. New Problem Candidate Selection

A new-problem candidate should normally satisfy:

- problem is active
- problem is not already assigned today
- problem is appropriate for current curriculum
- problem is not currently due for revision
- problem has not been attempted too recently
- difficulty is appropriate
- candidate is not an immediate duplicate
- candidate is available on a supported external platform

---

# 13. New Problem Selection Priority

Rank candidates using:

```text
1. Current curriculum relevance
2. Weak-pattern relevance
3. Difficulty fit
4. Recency / novelty
5. Unsolved preference
6. Diversity
```

Do not select randomly once meaningful user history exists.

---

# 14. Curriculum + Weakness Balance

For weekday two-problem sessions, prefer:

```text
Problem 1 → current focus / weak pattern
Problem 2 → curriculum-aligned reinforcement or complementary pattern
```

Do not automatically assign both problems to the weakest pattern every day.

This prevents:

```text
weakness
→ repeated same pattern
→ repeated failure
→ frustration
→ even more same pattern
```

The system should reinforce weaknesses without tunnel vision.

---

# 15. Problem Recency Rule

A successfully attempted problem should not normally reappear as a "new problem" immediately.

Default exclusion window:

```text approximately 14 days
```

This is a starting business rule, not a user-facing setting.

If there are too few eligible problems, relax the window rather than failing to produce a daily plan.

Never create fake problems.

---

# 16. Difficulty Adaptation

Difficulty is adaptive, not a reward for streak length.

Initial target:

```text 80% Easy
20% Medium
0% Hard
```

Developing:

```text 60% Easy
40% Medium
```

Advanced:

```text 30% Easy
60% Medium
10% Hard
```

These are long-run target distributions, not strict per-day quotas.

### Increase difficulty when

- independent solving is stable
- recent success is healthy
- hint/solution dependence is not rising
- pattern recognition is improving

### Reduce difficulty when

- recent failures cluster
- help dependence increases
- the user repeatedly misses the same pattern

Do not increase difficulty just because the user has maintained a streak.

---

# 17. Fallback Problem Selection

A daily plan should not fail just because the ideal candidate pool is too small.

Fallback sequence:

```text current curriculum + weak pattern
↓
current curriculum
↓
weak pattern
↓
active unsolved problem with suitable difficulty
↓
active problem with least recent attempt
```

A fallback must still respect:

- no duplicate daily assignment
- platform URL validity
- active problem state
- reasonable difficulty

---

# 18. Sunday Contest Logic

Sunday is a distinct product state.

Dashboard should show:

```text
LEETCODE CONTEST DAY

Participate in today's contest.
[ Open LeetCode Contest ↗ ]
```

No normal new problems.

No revision task.

After participation is recorded:

```text contest_participations
+
daily_activity.contest_participated = true
+
daily_task.status = completed
```

Contest ranking, rating, score, and detailed performance are deferred.

---

# 19. Saturday Revision Logic

Saturday is dedicated to memory consolidation.

The scheduler:

```text find due/overdue candidates
        ↓
rank candidates
        ↓
select up to 3
```

If only two candidates exist:

```text assign 2
```

Do not duplicate a revision to reach three.

---

# 20. Revision Eligibility

A problem becomes eligible for revision after a meaningful learning attempt.

Default initial intervals:

| Attempt outcome | Initial interval |
|---|---:|
| Independent | 3 days |
| Hint | 2 days |
| Approach | 2 days |
| Solution | 1 day |
| Failed | 1 day |

The exact interval is stored on the revision schedule.

---

# 21. Revision Ladder

Use a simple, explainable interval ladder:

```text
1 day
3 days
7 days
14 days
30 days
60 days
```

This is the MVP baseline.

Do not implement a complex scientific spaced-repetition algorithm before real usage data justifies it.

---

# 22. Revision Result Rules

Revision has exactly three user-facing results:

```text
Easy recall
Partial
Forgot
```

## Easy recall

Move forward on the ladder.

Examples:

```text
3 → 7
7 → 14
14 → 30
30 → 60
```

## Partial

Shorten/reset toward an earlier interval.

Example policy:

```text
14 → 3
30 → 7
7 → 3
3 → 1
```

## Forgot

Reset to:

```text
1 day
```

The functions that compute these transitions must be centralized.

---

# 23. Due Date vs Daily Quota

This is one of the most important architectural distinctions.

The revision engine determines:

> Which problems are due?

The daily scheduler determines:

> How many of those can I show today?

Therefore:

```text
revision engine
→ due candidates

daily schedule
→ 1 weekday / 3 Saturday
```

A user may have 7 due candidates but receive only 1 on Tuesday.

The remaining candidates remain due/overdue.

---

# 24. Revision Priority

When selecting due revisions:

```text
1. Overdue
2. Previously forgotten
3. Previously partial
4. Normally due
5. Oldest due date
6. Weak-pattern relevance
```

Do not interpret being unselected because of a daily quota as recall failure.

---

# 25. Important Overdue Rule

There are two different situations:

### A. Not reviewed because daily quota was full

Do not change the interval as though the user forgot.

### B. Reviewed and selected “Forgot”

This is genuine memory failure and should reset the schedule.

These must remain separate.

---

# 26. Revision Flow

Pre-recall:

```text
problem title
difficulty
last reviewed
recall questions
```

Do not reveal:

- pattern
- key observation
- journal answer
- solution
- complexity

User answers:

```text
What pattern does this problem use?

Can you explain the approach?
```

Then:

```text
Check My Recall
↓
reveal Journal knowledge
↓
compare
↓
Easy / Partial / Forgot
↓
calculate next interval
```

---

# 27. Revision Scheduling Transaction

Completing a revision should be handled as one business operation:

```text
1. validate active revision
2. prevent duplicate submission
3. create revision_attempt
4. calculate next interval
5. calculate next_review_at
6. update revisions current state
7. mark daily task complete
8. increment daily activity
```

If the operation is retried, it must not create duplicate history or double-count activity.

---

# 28. Duplicate Revision Submission

If two browser tabs submit the same revision:

- only one revision attempt should become the official completion
- the daily task should be completed once
- daily activity should increment once
- schedule should update once

Use transaction/locking/uniqueness strategies as appropriate.

---

# 29. Problem Attempt State Machine

Preferred:

```text
not_started
   ↓
started
   ↓
completed
```

An abandoned attempt is not a solved problem.

A failed problem attempt is still useful learning evidence.

---

# 30. Attempt Outcome State

Use:

```text
independent
hint
approach
solution
failed
```

Meaning:

### Independent

Solved without help.

### Hint

Used a hint.

### Approach

Needed/saw the approach before successful completion.

### Solution

Needed the complete solution.

### Failed

Could not solve.

---

# 31. Attempt Consistency Rules

The system must prevent contradictions such as:

```text
result = independent
AND
saw_solution = true
```

Recommended validation:

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

---

# 32. What Counts as a Solved Problem?

Successful outcome:

```text
independent
hint
approach
solution
```

Failed outcome:

```text
failed
```

For "Problems Solved" Analytics, count **distinct problems with at least one successful attempt**, not raw attempts.

Example:

```text
Two Sum
attempt 1 = failed
attempt 2 = hint
attempt 3 = independent

Problems solved = 1
```

---

# 33. Multiple Attempts

Never overwrite historical attempts.

Example:

```text
Attempt 1 → failed
Attempt 2 → hint
Attempt 3 → independent
```

All three remain historical evidence.

The current problem status can use the latest relevant successful result.

---

# 34. Manual Practice

A manually selected problem from `/problems` follows the same attempt flow as a daily problem.

It:

- creates an attempt
- can create/update Journal
- can create/update Revision
- contributes to Analytics
- contributes to Calendar activity if it produces meaningful activity

It does not retroactively become a completed daily task merely because the same problem was manually solved.

---

# 35. Daily Task Completion

## New problem task

Completed when a successful outcome is recorded.

A failed attempt does not falsely become a successful completion.

## Revision task

Completed when the recall result is submitted.

## Contest task

Completed when contest participation is recorded.

---

# 36. Daily Activity

`daily_activity` is a historical aggregate.

Update it from real events:

```text
successful problem attempt
→ problems_solved += 1

completed revision
→ revisions_completed += 1

contest participation
→ contest_participated = true
```

Do not let the UI directly invent daily activity.

---

# 37. Calendar Color Rules

Final rules:

```text
0 solved
→ neutral

1 solved
→ light green

2+ solved
→ dark green

weekend + contest
→ dark green
```

Problem count is the primary intensity signal.

Revision completion is visible in selected-day details, but should not make a zero-problem day visually look like a two-problem day.

No fourth “super-dark” contest color is required.

---

# 38. Calendar Selected-Day Details

Show only:

```text
Problems Solved
Revision
Contest
```

Problem details:

- title
- difficulty
- outcome

Revision details:

- problem
- recall result

Contest:

- participation/name if known

Do not include:

- pattern recognition
- journal text
- analytics
- streak
- motivation
- extra learning insights

---

# 39. Streak Logic

An active day is:

```text
problems_solved >= 1
OR revisions_completed >= 1
OR contest_participated = true
```

Current streak = consecutive active local dates ending on the latest eligible date according to the product's "today" rule.

### Important

Saturday revision activity can maintain a streak.

Sunday contest participation can maintain a streak.

A completely inactive day breaks the streak.

---

# 40. Streak vs Daily Task Completion

A user does not need to complete every scheduled task to necessarily have an active day.

Example:

```text
Monday
2 assigned + 1 revision
user solves 1 problem
```

This is still meaningful activity and may maintain the streak.

Streak measures consistency of meaningful practice, not perfect task completion.

---

# 41. Streak Edge Cases

If the user performs an event just before midnight and another just after midnight:

- assign events to their correct local dates
- do not merge them
- do not double-count a date

If the user travels/timezone changes, current and future day calculations use the configured/current timezone policy.

Historical event timestamps remain immutable.

---

# 42. Pattern Journal Logic

A Journal Entry is the user's canonical reusable lesson for a problem.

Normally:

```text
attempt
↓
journal entry
```

A manual Journal entry is allowed.

Manual Journal creation with no attempt must not count as a solved problem.

---

# 43. Journal Uniqueness

MVP rule:

```text
one active journal entry per user + problem
```

Repeated learning should update that canonical entry rather than create duplicates.

Historical attempts remain separate.

---

# 44. Journal Fields

Canonical:

```text
failed_idea
key_observation
pattern
time_complexity
space_complexity
what_to_remember
pattern_recognition
```

Minimum useful content:

```text
problem
pattern
what_to_remember
```

---

# 45. Journal → Revision Relationship

Revision should reveal the user's current Journal knowledge.

If the Journal is edited:

```text
future revision reveal
→ uses the updated Journal
```

Historical revision responses do not change.

---

# 46. Pattern Recognition Logic

Pattern recognition is a core signal.

Journal recognition values:

```text
independent
after_hint
not_recognized
```

Revision separately records the user's recalled pattern answer and overall recall result.

Do not pretend to automatically grade free-text pattern answers in the MVP.

The user self-rates after comparing.

---

# 47. Mistake Logic

Allowed mistake categories:

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

Multiple mistakes may apply to one attempt.

Example:

```text
Binary Search attempt
→ pattern_recognition
→ edge_case
```

---

# 48. Mistake Counting

Each selected mistake occurrence counts once per attempt.

Example:

```text Attempt A1:
pattern_recognition
edge_case

counts:
pattern_recognition +1
edge_case +1
```

Do not count the same mistake twice on the same attempt unless the data model explicitly represents multiple separate observations later.

---

# 49. Analytics Unlock

Full Analytics becomes available only after:

```text 10 distinct successfully solved problems
```

Count unique problem IDs with a successful attempt.

Do not count:

- failed attempts
- repeated solves of the same problem

At 9:

```text Analytics locked state
```

At 10:

```text Analytics enabled
```

---

# 50. Analytics Before Unlock

Show:

```text
Your analytics will appear after 10 solved problems.

Keep practicing. Once there is enough data,
DSA OS will show meaningful trends and focus areas.
```

Do not show misleading performance percentages based on tiny samples.

---

# 51. Analytics Metrics

## Problems Solved

```text distinct successful problem IDs
```

## Independent Solve Rate

```text independent successful attempts
/
all successful attempts
```

This is an attempt-based skill metric.

## Revision Recall

```text easy recall revision attempts
/
all completed revision attempts
```

## Day Streak

Derived from meaningful daily activity.

---

# 52. Pattern Mastery

Pattern mastery should be a derived signal, not a manually editable number.

Minimum recommended evidence:

```text 3 or more relevant attempts
```

Below that:

```text insufficient data
```

Do not call a pattern weak based on one bad problem.

---

# 53. Pattern Score

Starting deterministic formula:

```text
pattern_score =
    0.40 * independent_solve_rate
  + 0.25 * pattern_recognition_rate
  + 0.20 * revision_recall_rate
  + 0.15 * recent_success_rate
```

Each component is normalized to:

```text 0–1
```

If a component lacks enough data, redistribute its weight across available signals rather than treating missing data as zero.

---

# 54. Pattern Status Thresholds

Starting classification:

```text < 0.50
Focus

0.50–0.69
Developing

0.70–0.84
Solid

>= 0.85
Strong
```

These are starting thresholds to validate with real user data.

Never use language such as:

> “You are bad at Recursion.”

Use:

> Focus

or:

> Developing

---

# 55. Recent Performance

Recent evidence should influence recommendations more than very old evidence.

Use a recent window or simple recency weighting.

Avoid allowing a strong result from months ago to completely hide current weakness.

---

# 56. Insufficient Data Rule

Do not manufacture certainty.

Examples:

```text
1 attempt
→ insufficient data

2 attempts
→ limited evidence

3+ attempts
→ eligible for pattern assessment
```

The UI can still show raw activity before Analytics unlocks, but it should not make strong claims.

---

# 57. Recommendation Engine

The recommendation engine converts performance evidence into future problem choices.

Inputs:

```text
current curriculum
pattern score
independent solve rate
help dependency
recent performance
difficulty performance
recency
revision/retention signals
problem availability
```

---

# 58. Recommendation Score

Use a normalized score such as:

```text
recommendation_score =
    0.30 * curriculum_relevance
  + 0.30 * weakness_relevance
  + 0.15 * difficulty_fit
  + 0.15 * novelty
  + 0.10 * recent_fit
```

Keep weights in one business-logic module.

Do not scatter constants across UI code.

---

# 59. Recommendation Guardrails

Even if a problem has a high recommendation score:

- exclude today's duplicates
- exclude very recent attempts
- exclude problems already solved and not yet eligible for re-practice
- exclude currently scheduled revision items from new-problem selection
- respect active/inactive problem status

---

# 60. Recommendation Diversity

Recommendations should balance:

```text weakness
+
curriculum
+
variety
+
difficulty
+
novelty
```

Do not recommend the same pattern indefinitely.

Do not recommend a hard problem simply because it has a weak-pattern match.

---

# 61. Feedback Loop

The intended adaptive loop is:

```text
User performance
      ↓
Pattern / mistake evidence
      ↓
Focus area
      ↓
Recommendation
      ↓
New problem
      ↓
New performance evidence
```

A recommendation should be explainable:

- “Matches this week's focus”
- “Recursion is currently a focus area”
- “You haven't practiced this pattern recently”

---

# 62. Avoiding a Negative Learning Loop

Bad behavior:

```text
Recursion weak
→ only recursion
→ repeated failures
→ recommendation keeps increasing recursion
```

Correction:

- lower difficulty
- introduce familiar reinforcement
- mix one weak-pattern problem with one compatible curriculum problem
- consider recent failure rate
- reduce concentration if repeated failure persists

The system should train the weakness without overwhelming the learner.

---

# 63. Difficulty Feedback Loop

If a user repeatedly:

```text
fails Easy
or
needs solutions on Easy
```

do not move to harder problems.

If a user consistently solves Medium problems independently:

```text
increase Medium share gradually
```

If the user is performing well but revision recall is poor:

```text
do not equate solving ability with retention
```

These are separate signals.

---

# 64. Normalization of Learning Signals

Do not mix incompatible quantities directly.

Bad:

```text
40 minutes
+ 2 solved
+ 1 failed
```

Good:

Convert signals to normalized indicators:

```text
independent_solve_rate
revision_recall_rate
recent_success_rate
```

then combine them.

---

# 65. Manual Settings vs Business Rules

User settings can influence:

```text
problem target
difficulty preference
revision target
practice availability
theme
notifications
```

They must not directly alter:

```text
Sunday = contest-only
Saturday = revision-only
Analytics unlock = 10
Calendar color semantics
```

These remain product rules.

---

# 66. Settings Changes

Apply preference changes to future scheduling.

Do not rewrite historical tasks.

If the user changes:

```text 2 problems/day → 3
```

future planning uses 3.

For an already-generated day:

- preserve existing tasks
- do not silently replace completed work
- optionally append a new task only if an explicit same-day expansion feature is later added

MVP should prefer stability.

---

# 67. User Disables Reminders

Disabling reminders must:

- stop reminder delivery
- not modify tasks
- not modify revision dates
- not break streak logic

Notifications are presentation behavior, not learning-state behavior.

---

# 68. Manual Replanning

No full manual re-planning UI is required for MVP.

If an admin/developer operation exists later, it must:

- preserve completed history
- record what was changed
- avoid creating duplicates
- never rewrite authoritative attempts

---

# 69. Problem Deactivation

Problems should be deactivated rather than deleted if history depends on them.

A deactivated problem:

- no longer appears in new recommendations
- no longer appears in new daily assignments
- remains visible in historical Attempts/Journal/Calendar where appropriate

---

# 70. Pattern Deactivation

Same principle.

Do not delete a pattern that historical journal entries reference.

Mark inactive.

Historical analytics may still reference it.

---

# 71. Contest Failure / Missing Contest

If Sunday contest cannot be opened:

- Dashboard should still load
- show a fallback external link if available
- allow participation to be recorded manually
- do not block the rest of the application

Do not require an API integration for the MVP.

---

# 72. External Platform Independence

A problem is not inherently a LeetCode problem.

Use:

```text platform
+
url
```

Supported initial platforms may include:

```text LeetCode
GeeksforGeeks
HackerRank
Codeforces
CodeChef
Other
```

Generic UI labels should derive from stored platform data.

---

# 73. External Solve Does Not Equal Verified Solve

DSA OS does not independently verify code submissions in the MVP.

The user records their outcome.

Therefore the product must not claim:

> “LeetCode verified success”

unless a future platform integration actually verifies it.

The current event is:

> User recorded the outcome.

---

# 74. Attempt Duration

Store actual elapsed duration if the Workspace timer is used.

Do not store estimated problem duration.

Do not use duration as the primary mastery signal.

Duration may support future Interview Mode and secondary analytics.

---

# 75. Daily Task vs Activity

A task is an intended action.

An activity is an actual event.

Example:

```text daily_task:
Two Sum assigned

attempt:
Two Sum solved independently

daily_activity:
problems_solved += 1
```

Never infer actual learning only from the fact that a task existed.

---

# 76. Calendar vs Analytics

Calendar asks:

> What happened?

Analytics asks:

> What does it mean?

Do not duplicate analytics interpretations inside Calendar.

Do not make Calendar responsible for mastery calculations.

---

# 77. Dashboard vs Scheduler

The Dashboard is a presentation layer.

The Scheduler determines:

> What should be shown?

The Dashboard should not independently invent today's problem selection rules.

It reads persisted daily tasks.

---

# 78. Dashboard vs Revision Engine

Dashboard:

> shows today's selected revision

Revision engine:

> determines which candidates are due and how schedules change

The two should not implement different notions of “due.”

---

# 79. Problem Page vs Recommendation Engine

Problems page:

> lets the user browse/search the library.

Recommendation engine:

> chooses appropriate problems for a user's daily practice.

A manual filter selection must not alter the recommendation algorithm.

---

# 80. Journal vs Attempt

Attempt:

> What happened?

Journal:

> What should I remember?

Do not store all Journal knowledge redundantly inside Attempts.

The attempt may hold the raw initial approach and outcome.

The Journal stores the curated reusable lesson.

---

# 81. Journal vs Revision

Journal:

> source of stored knowledge

Revision:

> test whether the user can recall it

Do not let Revision rewrite the Journal automatically unless the user explicitly chooses to edit it.

---

# 82. Revision History

Never overwrite historical revision attempts.

Example:

```text Aug 24 → easy
Aug 29 → partial
Sep 05 → easy
Sep 19 → forgot
```

All remain queryable.

The current schedule exists separately.

---

# 83. Transactional Operations

## Complete Problem

Prefer one server-side operation:

```text validate attempt
↓
finalize attempt
↓
save mistakes
↓
create/update journal
↓
create/update revision
↓
complete daily task if applicable
↓
update daily activity
```

## Complete Revision

```text validate revision
↓
record revision attempt
↓
calculate interval
↓
update revision
↓
complete daily task
↓
update daily activity
```

## Contest Participation

```text validate Sunday/context
↓
record participation
↓
complete contest task
↓
update daily activity
```

---

# 84. Idempotency

Important operations must be retry-safe.

### Daily generation

Repeated call → same tasks.

### Problem completion

Repeated request with same logical submission → no duplicate completion.

### Revision completion

Repeated request → no double revision history.

### Contest recording

Repeated click → no duplicate participation event.

Use database constraints and/or idempotency keys where needed.

---

# 85. Concurrency

The application may have:

- multiple tabs
- multiple devices
- duplicate requests
- retry after network timeout

Business logic must assume concurrency.

Never rely solely on:

```text client state
```

for correctness.

Database transaction + constraint + server validation is authoritative.

---

# 86. Server-Side Authorization

Every business operation must verify:

```text authenticated user
+
resource belongs to user
+
transition is legal
```

Examples:

A user cannot submit a revision belonging to another user.

A user cannot edit another user's Journal.

A user cannot manipulate another user's daily activity.

RLS should enforce data isolation in addition to application checks.

---

# 87. User Data Isolation

User-owned operations must use the authenticated user ID.

Never accept arbitrary `user_id` from untrusted client input as the source of ownership.

Derive identity from the authenticated session.

---

# 88. Business Logic Error Handling

If daily recommendation fails:

```text fallback to valid curriculum-aligned candidate
```

If analytics calculation fails:

```text show unavailable state
```

Do not invent numbers.

If revision scheduling fails:

```text preserve last valid schedule
```

Do not overwrite valid state with null/invalid state.

---

# 89. No-Fake-Data Rule

User-facing progress must always be traceable to real data.

Never fake:

- solve counts
- streaks
- revision results
- calendar activity
- analytics
- pattern mastery

Seed data is acceptable for development/demo environments, but production user progress must come from actual records.

---

# 90. Data Sufficiency

Use confidence thresholds.

Examples:

```text pattern attempts < 3
→ no strong mastery label

distinct solved problems < 10
→ Analytics locked

revision attempts = 0
→ no revision retention percentage
```

Never turn missing data into a false zero.

---

# 91. Historical Immutability

Historical events should not be changed simply because business logic changes later.

Examples:

- past attempt result
- past revision result
- past contest participation
- past Calendar date

If a business algorithm is improved later, new calculations may be recomputed, but original events remain.

---

# 92. Business Rule Versioning

Revision algorithms and recommendation algorithms may evolve.

Do not store unexplained magic numbers throughout the codebase.

Centralize:

```text revision intervals
recommendation weights
pattern thresholds
recency windows
```

If an algorithm changes significantly in production later, consider storing its version for auditability.

---

# 93. Streak Recalculation

Do not maintain streak using fragile manual increments only.

Prefer deriving it from activity history.

If a cached streak is introduced for performance, it must be rebuildable from authoritative daily activity.

---

# 94. Daily Activity Rebuildability

`daily_activity` should be reconstructable from source events.

If data corruption happens, developers should be able to recompute:

```text attempts
+
revision_attempts
+
contest_participations
→ daily_activity
```

This is an important reliability property.

---

# 95. Analytics Rebuildability

Analytics must be derived from source records.

For example:

```text attempts
→ solve metrics

attempt_mistakes
→ recurring mistakes

problem_patterns + attempts
→ pattern performance

revision_attempts
→ retention
```

Do not store only a final percentage without retaining the underlying events.

---

# 96. Daily Scheduler Pseudocode

Conceptually:

```text
function ensureDailyTasks(user, localDate):

    existing = getDailyTasks(user.id, localDate)

    if existing is complete:
        return existing

    weekday = getLocalWeekday(localDate)

    if weekday in MONDAY..FRIDAY:
        ensure 2 new-problem tasks
        ensure 1 revision task

    if weekday == SATURDAY:
        ensure up to 3 revision tasks

    if weekday == SUNDAY:
        ensure 1 contest task

    persist atomically

    return today's tasks
```

Important:

> “ensure” means create missing tasks without duplicating/replacing existing ones.

---

# 97. Revision Selection Pseudocode

```text
candidates =
    active revisions
    where next_review_at <= now
    for current user

rank candidates by:
    overdue
    forgotten
    partial
    due date
    weakness relevance

limit =
    1 on Mon–Fri
    3 on Saturday
    0 on Sunday

persist selected revision task(s)
```

---

# 98. New Problem Selection Pseudocode

```text
candidates =
    active problems
    matching curriculum
    not assigned today
    not recently attempted
    not current revision
    suitable difficulty

score each candidate

sort descending

select required number
while enforcing diversity
```

If candidate pool is insufficient, progressively relax non-critical filters.

Never relax:

- active problem
- valid URL
- duplicate-in-day protection
- Sunday/Saturday structural rules

---

# 99. Recommendation Explanation

Store or derive enough information to explain why something was recommended.

Examples:

```text
Current curriculum
Weak pattern
Not practiced recently
Difficulty fit
```

The user does not need a complicated explanation engine.

One short reason is enough.

---

# 100. Testing Matrix

Before production, test:

## Daily schedule

- Monday
- Friday
- Saturday
- Sunday
- user with no history
- user with many due revisions
- user with fewer than 3 Saturday revisions
- duplicate scheduler call

## Revision

- initial solve
- independent
- hint
- approach
- solution
- failed
- easy recall
- partial
- forgot
- overdue
- quota overflow
- duplicate submission

## Problems

- each platform
- duplicate assignments
- recent attempt exclusion
- weak-pattern recommendation
- insufficient candidates
- inactive problem

## Analytics

- 0 solved
- 9 solved
- exactly 10
- repeated same problem
- insufficient pattern evidence
- no revision history

## Calendar

- 0 solved
- 1 solved
- 2 solved
- Saturday revision-only
- Sunday contest
- timezone boundary

## Security

- user A cannot access user B's data
- user A cannot mutate user B's tasks
- user A cannot submit user B's revision

---

# 101. Key Invariants

The following must always remain true:

1. Monday–Friday follow the weekday task model.
2. Saturday has no new-problem tasks.
3. Sunday has no new-problem or revision tasks.
4. Daily task generation is idempotent.
5. A user has at most one current revision record per problem.
6. Revision history is never overwritten.
7. A user's Journal entry is unique per problem in the MVP.
8. A failed attempt is not a solved problem.
9. A repeated successful solve of one problem does not increase distinct-problem count by more than one.
10. Analytics does not unlock before 10 distinct solved problems.
11. Calendar reflects real activity.
12. Streak is based on real activity, not planned activity.
13. No user can access another user's private data.
14. Historical events are preserved.
15. Business logic is server-authoritative.
16. No recommendation may create a duplicate daily task.
17. No revision quota may create fake revisions.
18. Missing data is never treated as evidence of failure.
19. Sunday contest activity does not create a normal problem task.
20. Saturday revision activity does not create a new-problem task.

---

# 102. Final Coordination Model

```text
                         WEEKLY CURRICULUM
                                  │
                                  ▼
                        ┌─────────────────┐
                        │ DAILY SCHEDULER │
                        └───────┬─────────┘
                                │
              ┌─────────────────┼──────────────────┐
              ▼                 ▼                  ▼
        NEW PROBLEMS         REVISION           CONTEST
              │                 │                  │
              ▼                 ▼                  ▼
           ATTEMPT            RECALL          PARTICIPATION
              │                 │                  │
       ┌──────┼──────┐          │                  │
       ▼      ▼      ▼          ▼                  ▼
    Outcome Mistakes Journal  Revision        Contest Record
       │             │          │                  │
       └─────────────┴──────────┼──────────────────┘
                                ▼
                         DAILY ACTIVITY
                                │
                 ┌──────────────┼──────────────┐
                 ▼              ▼              ▼
             CALENDAR        STREAK        ANALYTICS
                                             │
                                     ┌───────┴───────┐
                                     ▼               ▼
                               FOCUS AREAS     MISTAKES
                                     │
                                     ▼
                           RECOMMENDATION ENGINE
                                     │
                                     ▼
                              FUTURE TASKS
                                     │
                                     └──────→ DASHBOARD
```

---

# 103. Final Example — Normal Weekday

Suppose Wednesday is:

```text
Binary Search + Prefix Sum
```

Scheduler:

```text
2 new problems
1 revision
```

Selection:

```text
Problem 1 → Binary Search / weak area
Problem 2 → Prefix Sum
Revision → highest priority due item
```

User solves Problem 1 independently.

System:

```text attempt
→ daily task complete
→ mistake data
→ journal
→ revision schedule
→ daily activity
```

User solves Problem 2 with a hint.

System records:

```text result = hint
```

Revision later happens.

System records:

```text revision_attempt
→ easy/partial/forgot
→ next interval
→ daily activity
```

Calendar and Analytics can now use the same underlying evidence.

---

# 104. Final Example — Saturday

Scheduler:

```text revision candidates = 8
quota = 3
```

Ranks:

```text overdue + forgot
overdue
partial
normal
...
```

Selects top 3.

User completes:

```text 1 easy
1 partial
1 forgot
```

System updates three revision schedules independently.

Daily activity:

```text problems_solved = 0
revisions_completed = 3
```

Calendar remains neutral because there were no solved problems, while the selected-day details show the three revisions.

---

# 105. Final Example — Sunday

Scheduler:

```text contest task only
```

Dashboard:

```text LeetCode Contest Day
```

No normal new problems.

No revision.

User participates.

System records contest participation and daily activity.

Calendar records Sunday activity.

Streak can continue.

---

# 106. Final Architecture Rule

The most important rule in the entire system is:

> **The same business fact must have one authoritative source.**

Examples:

- Attempt outcome → `attempts`
- Revision outcome → `revision_attempts`
- Current revision schedule → `revisions`
- Daily assignment → `daily_tasks`
- Historical activity aggregate → `daily_activity`
- Problem definition → `problems`
- Pattern definition → `patterns`
- User preference → `user_settings`

Other screens read and derive from these facts.

They do not independently invent their own versions.

---

# 107. Final North Star

DSA OS should behave like one coordinated system:

```text
WHAT SHOULD I DO?
        ↓
Dashboard

WHAT SHOULD I PRACTICE?
        ↓
Problems + Scheduler

HOW SHOULD I THINK?
        ↓
Problem Workspace

WHAT DID I LEARN?
        ↓
Pattern Journal

CAN I STILL REMEMBER?
        ↓
Revision

AM I IMPROVING?
        ↓
Analytics

WHAT DID I ACTUALLY DO?
        ↓
Calendar
```

The system should remain:

- deterministic where correctness matters
- adaptive where learning benefits
- conservative where data is insufficient
- resilient to retries and concurrency
- secure across users
- minimal enough to understand
- explainable enough to defend in an engineering interview

**Every meaningful action should either create durable learning evidence or improve the next decision. Nothing else needs to exist.**
