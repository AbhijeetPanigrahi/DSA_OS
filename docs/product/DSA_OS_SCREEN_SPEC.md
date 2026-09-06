# DSA OS — Screen Specification

> Version: 1.0
> Status: Current UX / screen-behavior source of truth
> Companion document: `DSA_OS_DESIGN_SYSTEM.md`
> Purpose: Define the responsibility, content, interactions, states, navigation, and data needs of every finalized DSA OS screen and contextual workflow.

---

# 1. Product UX Foundation

## 1.1 Product purpose

DSA OS is a focused personal operating system for improving DSA problem-solving ability.

It exists because repeatedly learning DSA concepts does not guarantee that a learner can recognize the correct approach when facing a new coding problem.

The product therefore prioritizes:

- independent problem solving
- pattern recognition
- deliberate reflection
- structured learning capture
- spaced recall
- recognition of recurring mistakes
- evidence-based improvement

Problem count is a context metric, not the product's primary success metric.

## 1.2 Core learning loop

```text
Dashboard
   ↓
Choose problem
   ↓
Problem Workspace
   ↓
Think before coding
   ↓
Open on LeetCode / external platform
   ↓
Solve
   ↓
Return to DSA OS
   ↓
Record result
   ↓
Pattern Journal
   ↓
Revision
   ↓
Analytics
   ↓
Identify weak areas
   ↓
Future recommendations
   ↓
Dashboard
```

## 1.3 The five questions the product answers

1. What should I do today?
2. How should I approach this problem?
3. What did I learn from this problem?
4. Can I still remember it later?
5. Am I actually improving?

## 1.4 Screen-responsibility rule

Every screen must have a clear primary question.

| Surface | Primary question |
|---|---|
| Dashboard | What should I do today? |
| Problems | What problems can I practice? |
| Problem Workspace | How should I approach this problem? |
| Pattern Journal | What did I learn from this problem? |
| Revision | Can I still remember it? |
| Analytics | Am I actually improving? |
| Calendar | What did I actually do? |
| Settings modal | How should DSA OS behave? |

If a feature can be handled contextually without a new destination, keep it contextual.

---

# 2. Final Navigation Architecture

## 2.1 Main navigation

The finalized MVP navigation is:

```text
DSA OS
Mission Control

MAIN
Dashboard
Problems
Patterns
Journal
Revision
Analytics

PRACTICE
Interview Mode (future/deferred)

HISTORY
Calendar

SYSTEM
Settings
```

## 2.2 Items intentionally removed as standalone pages

Do not create these as separate navigation destinations:

- Today's Plan
- Weekly Plan
- Notes
- Journey
- Daily Reflection

Their responsibilities are handled by:

- Today's Plan → Dashboard
- Weekly Plan → Dashboard's This Week section + curriculum data
- Notes → Pattern Journal for the current MVP
- Journey → Calendar
- Daily Reflection → contextual Dashboard/end-of-day interaction

## 2.3 Contextual experiences

These are real user experiences but should not appear in the main navigation:

- Problem Workspace
- Post-attempt result
- Pattern Journal creation
- Revision reveal state
- Revision completion state
- Daily Reflection
- Settings modal

---

# 3. Route Map

Recommended application routes:

```text
/
/login
/signup

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

Settings is primarily a modal state opened from the global application shell. It does not need to be a full standalone page.

Authentication routes should be protected appropriately.

---

# 4. Dashboard

## 4.1 Purpose

The Dashboard is the user's morning command center.

It should answer immediately:

- What should I do today?
- What should I do next?
- What do I need to review?
- What should I improve?
- What is this week's curriculum focus?

## 4.2 Information hierarchy

1. Header / greeting / streak
2. Today's Mission
3. Next Up
4. Revision Due
5. This Week
6. Focus Areas
7. Reflect & Remember contextual actions
8. Small learning insight

The dashboard is not an analytics page.

## 4.3 Header

Show:

- greeting
- current date
- day/journey context where useful
- compact but visually rewarding streak

Example:

```text
Good morning, Abhijeet 👋
Monday, August 24 · Day 17

🔥 6 DAY STREAK
```

The streak is motivational but must not overpower Today's Mission.

## 4.4 Today's Mission

### Purpose

Show the user's actual new problem-solving work for today.

### Contains

- current curriculum focus
- one-line learning objective
- today's problem(s)
- problem completion state
- progress
- primary session CTA

Example:

```text
TODAY'S MISSION

Arrays + Hashing

Today's focus: Build stronger pattern recognition.

1 of 2 problems completed

✓ Contains Duplicate
○ Valid Anagram

[ Start Today's Session → ]
```

### Rules

Do not put the following inside the mission checklist:

- Pattern Journal
- Daily Reflection
- detailed analytics
- unnecessary metrics

Pattern Journal and Daily Reflection are separate contextual actions.

## 4.5 Problem rows

Each problem row is interactive.

The preferred daily flow is:

```text
Dashboard problem
→ Problem Workspace
→ Open on LeetCode
→ Solve externally
→ Return
→ Record result
```

The pattern should remain hidden in contexts where pattern recognition is intentionally being tested.

## 4.6 Start Today's Session

This action should take the user to the first incomplete daily problem or the appropriate contextual daily workflow.

There is no separate Today's Plan page.

## 4.7 Next Up

Shows the next actionable problem.

Display:

- title
- difficulty
- estimated time
- action

Do not expose the pattern when pattern recognition is intended.

The user may click the row itself or its action.

## 4.8 Revision Due

Shows a concise summary of revisions due today.

Display:

- number due
- one/two representative due problems
- Review Now action

The complete revision workflow lives on Revision.

## 4.9 This Week

The weekly curriculum is a compact section inside Dashboard.

Canonical curriculum:

```text
Monday      Arrays + Hashing
Tuesday     Two Pointers + Sliding Window
Wednesday   Binary Search + Prefix Sum
Thursday    Linked List + Stack
Friday      Trees + BST
Saturday    Graphs
Sunday      Mixed Interview Practice
```

The section should visually communicate:

- completed days
- current day
- upcoming days

It should not duplicate today's individual problem names.

Clicking a day may open Problems filtered to that focus.

## 4.10 Focus Areas

Focus Areas are the most important improvement opportunities derived from user performance.

Example:

```text
Recursion        42%  FOCUS
Binary Search    56%
Sliding Window   61%
```

Use calm language. Avoid presenting weak patterns as failures or alerts.

## 4.11 Reflect & Remember

A compact contextual section may expose:

- Pattern Journal pending work
- Daily Reflection when relevant

Pattern Journal becomes relevant after problem attempts.

Daily Reflection becomes relevant after meaningful daily practice.

Neither should dominate the morning mission.

## 4.12 Learning insight

One small contextual insight is sufficient.

Example:

> Try identifying the pattern before thinking about optimization.

This is guidance, not another task.

## 4.13 Daily completion state

After all intended daily new-problem work is complete:

```text
Today's mission complete ✓

[ Review Today's Progress → ]
```

Avoid excessive gamification.

---

# 5. Problems

## 5.1 Purpose

Problems is the complete DSA problem library.

It answers:

> What problems can I practice?

This library is the source from which daily practice, recommendations, manual practice, and future interview pools can be selected.

## 5.2 Search

Search should conceptually cover:

- title
- keywords
- patterns
- topics

Placeholder:

`Search problems...`

## 5.3 Filters

Use only necessary filters:

Primary status:

- All
- Unsolved
- Solved
- Needs Revision

Dropdowns:

- Difficulty
- Pattern
- Topic

Do not create a large row of dozens of visible pattern pills.

## 5.4 Sort

Default:

**Recommended**

Other sensible options:

- Difficulty
- Recently Added
- Recently Attempted
- Alphabetical

## 5.5 Recommended ordering

The recommendation system should conceptually prioritize:

1. current weak patterns
2. appropriate difficulty
3. problems not recently attempted
4. current curriculum focus
5. unsolved problems

This is business logic, not a UI setting.

## 5.6 Problem list

Use a scalable list/table hybrid.

Every row should contain:

- problem title
- difficulty
- pattern
- status
- last attempt
- row action affordance

Do not make the list a giant card grid.

## 5.7 Status values

Possible states:

- Not attempted
- Solved independently
- Solved with hint
- Solved after approach
- Solved after solution
- Needs revision

## 5.8 Opening a problem

Clicking a problem opens its Problem Workspace.

The Problems page itself should not open LeetCode directly as its primary behavior.

Correct flow:

```text
Problems
→ Problem Workspace
→ Before You Code
→ Open on LeetCode
```

## 5.9 Intentionally excluded metadata

Do not display unless a future requirement justifies it:

- company lists
- acceptance rate
- social counts
- comments
- likes
- solution previews
- long descriptions
- complexity

## 5.10 Scale

The UI must work with 50, 500, or 1000+ problems.

Use pagination or load-more behavior.

---

# 6. Problem Workspace

## 6.1 Purpose

The Problem Workspace is a contextual preparation and attempt-recording environment for one problem.

It is not:

- a LeetCode clone
- a code editor
- an online judge
- a permanent sidebar destination

## 6.2 Core flow

```text
Select problem
↓
Before You Code
↓
Record initial approach
↓
Open on LeetCode
↓
Solve externally
↓
Return to DSA OS
↓
Record outcome
↓
Create Pattern Journal Entry
```

## 6.3 Header

Show:

- back action
- problem title
- difficulty
- estimated time / target where useful
- timer if tracking an attempt

Do not expose the problem's pattern before the attempt.

## 6.4 Before You Code

Checklist:

- Can I explain the problem in my own words?
- What is the brute-force approach?
- What is its time complexity?
- What am I repeatedly searching for?
- Can I eliminate repeated work?
- Is there a useful data structure?
- What are the important edge cases?

The checklist is a thinking framework, not a compliance form.

## 6.5 Initial approach

Allow a focused text input:

> Describe your first approach before looking for the optimal solution.

The first idea may be incorrect; capturing it is useful learning data.

## 6.6 Open on LeetCode

Primary action:

**Open on LeetCode ↗**

The external URL comes from problem data.

The MVP does not need to reproduce the coding editor.

## 6.7 After solving

The user records one outcome:

- Solved independently
- Solved with a hint
- Found the approach but couldn't implement
- Needed to see the solution
- Couldn't solve

## 6.8 Struggle categories

Allow multiple:

- Problem understanding
- Finding approach
- Pattern recognition
- Optimization
- Implementation
- Edge case
- Time management

## 6.9 Pattern concealment

Do not reveal the correct pattern during the pre-attempt phase.

This is a critical product behavior.

## 6.10 Journal handoff

After recording the attempt, provide:

**Create Pattern Journal Entry →**

The full journal form is not duplicated here.

---

# 7. Pattern Journal

## 7.1 Purpose

Pattern Journal is the permanent DSA knowledge base.

It answers:

> What should I remember from this problem?

## 7.2 Layout

Two-column knowledge workspace:

```text
LEFT   → find entries
RIGHT  → understand selected entry
```

## 7.3 Search

Search across:

- problem
- pattern
- failed idea
- key observation
- remember-next-time

## 7.4 Filters

Keep lightweight:

- All
- Needs Review
- Comfortable
- Pattern dropdown

## 7.5 Entry preview

Show:

- problem
- pattern
- difficulty
- short key-observation preview
- result/status
- date

The left column must remain scannable when hundreds of entries exist.

## 7.6 Entry detail

Canonical fields:

```text
Problem
Failed Idea
Key Observation
Pattern
Time Complexity
Space Complexity
What I'll Remember
Pattern Recognition
```

## 7.7 Pattern Recognition

Possible states:

- Recognized independently
- Recognized after hint
- Did not recognize

This data feeds Analytics and recommendation logic.

## 7.8 Actions

- Open on LeetCode ↗
- Edit Entry

## 7.9 Creation flow

Normally launched from Problem Workspace after an attempt.

Can also be created manually from Journal.

The Journal page is primarily a knowledge library, not a generic notes app.

---

# 8. Revision

## 8.1 Purpose

Revision is the active-recall engine.

It answers:

> Can I still remember how to solve this?

## 8.2 Main screen scope

Primary focus:

**Due Today**

Do not clutter the primary screen with extensive upcoming scheduling statistics.

## 8.3 Queue

Each due item shows:

- problem title
- difficulty
- last reviewed date
- due/overdue state

Do not reveal the pattern before recall.

## 8.4 Recall flow

```text
Select due problem
↓
What pattern does this problem use?
↓
Can you explain the approach?
↓
Check My Recall
↓
Reveal stored journal knowledge
↓
Rate recall
↓
Schedule next review
↓
Next problem
```

## 8.5 Recall questions

Only two required recall prompts:

1. What pattern does this problem use?
2. Can you explain the approach?

Do not add separate:

- Key Observation recall
- Time Complexity recall
- Space Complexity recall
- full code recall

These are useful elsewhere but not necessary in the core revision flow.

## 8.6 Reveal state

After Check My Recall, show:

### Your Recall
The user's answers.

### From Your Journal
The expected:

- pattern
- key observation
- stored approach

The purpose is comparison and learning, not punitive grading.

## 8.7 Recall rating

Exactly:

- Easy recall
- Partial recall
- Forgot

## 8.8 Scheduling

Business logic determines the next interval based on recall quality.

Conceptually:

- Easy recall → longer interval
- Partial recall → shorter interval
- Forgot → review soon

Exact intervals belong to the backend algorithm.

## 8.9 Completion

After rating, show:

- revision complete
- recall result
- next review scheduled

Actions:

- Next Due Problem
- Back to Revision

---

# 9. Analytics

## 9.1 Purpose

Analytics answers:

> Am I actually improving?

It should interpret user activity rather than becoming a wall of charts.

## 9.2 Summary metrics

Only:

- Problems Solved
- Independent Solve Rate
- Revision Recall
- Day Streak

Independent Solve Rate is the most important skill indicator.

## 9.3 Main trend

Use one major chart:

**Independent Solve Rate over time**

No chart wall.

## 9.4 Focus Areas

Show approximately five relevant patterns.

Prioritize weak patterns while keeping some stronger patterns for context.

## 9.5 Recurring Mistakes

Rank common failure modes:

- Pattern recognition
- Finding an approach
- Edge cases
- Optimization
- Implementation

## 9.6 Your Next Focus

Tell the user:

- current weak pattern
- why it needs attention
- recommended practice
- direct action to practice that pattern

Example:

> Recursion is currently your weakest pattern.

```text
1. Easy recursion problem
2. Medium recursion problem
3. Mixed problem
```

## 9.7 Progress sentence

A short deterministic sentence may summarize the current picture.

Example:

> You're becoming more independent at solving problems, but pattern recognition is still your biggest opportunity.

## 9.8 Excluded analytics

Do not include unless a later product requirement requires them:

- total study time
- average session length
- clicks
- journal count
- multiple redundant trend charts
- pie charts purely for decoration
- excessive difficulty distributions

---

# 10. Calendar

## 10.1 Purpose

Calendar is the visual practice history.

It answers:

> What did I actually do on each day?

It is not a scheduling application.

## 10.2 Main layout

Desktop:

```text
Large monthly calendar | Selected-day detail
```

The calendar is the hero.

## 10.3 Activity intensity

The primary signal is **problems solved**.

Canonical states:

### 0 activity
Neutral cell.

### 1 solved problem
Very light green.

### 2 solved problems
Dark green.

### Weekend high-intensity
Saturday/Sunday with 2+ solved problems AND contest/challenge participation:

Deepest green.

Revisions may contribute as a secondary signal but must not make a zero-problem day look like a high-output day.

## 10.4 Selected day

Clicking a date opens its history panel.

Only show:

### Problems Solved
- title
- difficulty
- result

### Revision
- problem
- recall result

### Contest
- participation/name if available

Do not show:

- Pattern Recognition
- Journal entries
- analytics
- streak
- motivational copy
- pattern learning summary

## 10.5 No activity

```text
NO ACTIVITY

No DSA practice recorded for this day.
```

Do not fabricate data.

## 10.6 Current date

Current day may receive a subtle outline or small Today indicator.

Actual activity intensity still determines its fill.

---

# 11. Settings Modal

## 11.1 Purpose

Settings is a quick system-preferences interaction, not a destination page.

## 11.2 Open behavior

When the user clicks Settings:

1. Centered modal opens.
2. Background dims.
3. Current screen remains visible.
4. Modal receives focus.
5. User can edit settings without leaving context.

## 11.3 Close behavior

Close by:

- X button
- clicking outside the modal
- Escape key

Clicking inside the modal does not close it.

## 11.4 Modal sections

Only:

- Profile
- Practice
- Revision
- Notifications
- Appearance
- Account & Data

## 11.5 Profile

- Profile picture
- Name
- Email
- Timezone

## 11.6 Practice

- Problems per day
- Difficulty
- Practice days

Default problems/day:

**2**

Default difficulty:

**Adaptive**

## 11.7 Revision

- Revisions per day
- Revision mode: Adaptive / Fixed

Default:

**3 revisions/day**

**Adaptive** mode

Do not expose complex interval schedules as user-facing settings.

## 11.8 Notifications

Only:

- Daily practice reminder
- Revision reminder
- Reminder time

## 11.9 Appearance

- Light
- Dark
- System

Do not provide a large customization panel.

## 11.10 Account & Data

- Export My Data
- Sign Out
- Delete Account

Delete Account requires a confirmation dialog.

---

# 12. Daily Reflection

## 12.1 Purpose

Daily Reflection is about the learner's overall day rather than one specific problem.

It answers:

> How did my DSA practice go today?

## 12.2 Placement

Contextual from Dashboard.

Not a main page.

## 12.3 Trigger

Offer after meaningful daily practice or when the daily problem workload is complete.

## 12.4 Content

Keep concise:

- overall feeling/confidence
- biggest struggle
- what became clearer
- focus for tomorrow

## 12.5 Relationship to Journal

Pattern Journal:

> What did this problem teach me?

Daily Reflection:

> How did today's learning session go?

Do not merge these concepts.

---

# 13. Weekly Curriculum

## 13.1 Purpose

The weekly curriculum provides directional context, not task duplication.

## 13.2 Placement

Embedded in Dashboard under This Week.

No dedicated page.

## 13.3 Canonical structure

```text
Monday      Arrays + Hashing
Tuesday     Two Pointers + Sliding Window
Wednesday   Binary Search + Prefix Sum
Thursday    Linked List + Stack
Friday      Trees + BST
Saturday    Graphs
Sunday      Mixed Interview Practice
```

## 13.4 Behavior

Clicking a day may route to Problems filtered to that focus.

Do not display all specific assigned problems in the weekly roadmap.

---

# 14. Future / Deferred Interview Mode

Interview Mode is conceptually a separate practice mode but is outside the immediate core MVP design implementation.

When implemented later:

- no pattern reveal before solving
- no hints
- no journal access during the attempt
- explicit timer
- mixed/adaptive problem selection
- post-session report

Do not allow Interview Mode behavior to leak into the normal Problem Workspace.

---

# 15. Global Interaction Principles

## 15.1 Primary action rule

Every screen should have one clear primary action.

## 15.2 Clickable rows

Where a whole row represents an object, the whole row may be clickable rather than requiring tiny buttons.

## 15.3 Progressive disclosure

Do not expose all learning information before the user needs it.

Especially:

- hide patterns before intentional recognition
- hide journal answers before revision recall
- show detailed data only after an object is selected

## 15.4 Preserve context

Modal experiences and contextual workflows should return the user naturally to the previous surface.

## 15.5 Avoid dead-end screens

Every state should provide an obvious next action or return route.

---

# 16. Global States

Every data-driven screen should account for:

## Loading

Use layout-preserving skeletons.

## Empty

Explain why the state is empty and what to do next.

## Error

Give a concise recovery action.

## Success

Use subtle confirmation.

## Disabled

Disable only when the action genuinely cannot be performed.

---

# 17. Accessibility / Keyboard Behavior

## Global

- semantic HTML
- keyboard navigable controls
- visible focus indicators
- accessible form labels
- meaningful button names
- sufficient contrast

## Settings modal

- focus trap while open
- Escape closes
- focus returns to triggering control
- background content is inaccessible while modal is active

## Calendar

Color must not be the only way to understand selected activity. Selected-day details provide textual interpretation.

## Revision

Recall controls must have clear labels and support keyboard interaction.

---

# 18. Responsive Behavior

## Desktop

Reference target:

1440 × 900

## Tablet

Preserve hierarchy and stack secondary sections when needed.

## Mobile

- sidebar becomes a drawer/navigation sheet
- sections stack
- large controls become full-width when appropriate
- filters may become a filter sheet/drawer
- Calendar selected-day details move below the calendar
- Settings modal becomes near-full-screen

Do not allow horizontal scrolling as a substitute for responsive layout.

---

# 19. Cross-Screen Data Relationships

## Problem → Attempt

A problem may have many attempts by a user.

## Attempt → Journal

A completed attempt may create/update a Pattern Journal entry.

## Journal → Revision

A journal/learned problem can enter spaced repetition.

## Revision → Analytics

Recall results feed retention metrics.

## Attempt → Analytics

Attempt outcomes feed independent solve rate, mistakes, and pattern mastery.

## Attempt / Revision / Contest → Calendar

These real events create historical daily activity.

## Analytics → Problems

Weak patterns can drive recommended problem filters/selections.

## Problems → Dashboard

The daily selection engine chooses new problems from the same complete library.

---

# 20. Daily Problem Selection Behavior

Default daily target:

**2 new problems**

Selection should conceptually prioritize:

1. current weekly curriculum
2. weak patterns
3. appropriate difficulty
4. unsolved problems
5. problems not recently attempted
6. occasional mixed-pattern exposure

Do not assign hard problems merely because the user has been active.

Difficulty should adapt to actual performance.

---

# 21. Revision Behavior

Every completed problem may enter revision unless the system intentionally excludes it.

Revision priority should consider:

- result quality
- recognition quality
- previous recall quality
- recency
- current mastery

A simple deterministic system is acceptable for MVP.

---

# 22. Analytics Behavior

Important source signals:

- independent solve result
- hint dependency
- solution dependency
- pattern recognition
- mistake categories
- revision recall
- recent performance
- problem difficulty

Analytics should interpret these into:

- Independent Solve Rate
- Revision Recall
- Focus Areas
- Recurring Mistakes
- Next Focus

Avoid deriving “improvement” from activity volume alone.

---

# 23. Calendar Behavior

Daily activity should be derived from actual events.

Primary calendar intensity driver:

**Problems solved**

Secondary contributors:

- revision completed
- contest/challenge participation

Do not treat journal creation or page visits as equivalent to meaningful practice.

---

# 24. Data Requirements by Screen

## Dashboard

Needs:

- user profile
- current date
- streak
- daily problem assignments
- problem statuses
- revisions due
- weekly curriculum
- focus patterns
- journal/reflection status

## Problems

Needs:

- complete problem library
- filters
- user attempt state
- last attempt
- recommendation metadata

## Problem Workspace

Needs:

- problem metadata
- external URL
- attempt state
- initial approach
- timer state if used
- result
- struggle categories

## Pattern Journal

Needs:

- journal entries
- linked problem
- linked pattern
- attempt result
- recognition state

## Revision

Needs:

- due queue
- revision history
- journal answer
- recall state
- next review date

## Analytics

Needs:

- attempts
- outcomes
- patterns
- mistakes
- revision results
- streak/history

## Calendar

Needs:

- problems solved per date
- problem results
- revisions
- recall results
- contest participation

## Settings

Needs:

- profile
- preferences
- notification preferences
- timezone
- appearance settings

---

# 25. MVP Scope

## In MVP

- Authentication
- Dashboard
- Problems library
- Problem Workspace
- Pattern Journal
- Revision
- Analytics
- Calendar
- Settings modal
- This Week curriculum in Dashboard
- Daily Reflection contextual flow

## Deferred

- full online judge
- in-browser arbitrary code execution
- AI hint engine
- AI interview coach
- social features
- leaderboards
- subscriptions
- browser extension
- mobile app
- complex contest analytics
- large notification infrastructure
- full Notion-style notes

---

# 26. UX Quality Checklist

## Dashboard

- Can the user understand what to do in roughly five seconds?
- Is Today's Mission the strongest priority?
- Is the primary CTA obvious?
- Is weekly context useful without becoming noise?

## Problems

- Can the library scale to hundreds or thousands of problems?
- Are filters useful without clutter?
- Is the title the main scan target?

## Problem Workspace

- Is the thinking checklist useful?
- Is the pattern hidden when recognition is intended?
- Is Open on LeetCode obvious?
- Is recording the result fast?

## Pattern Journal

- Can the user find old lessons quickly?
- Is “What I’ll Remember” easy to identify?
- Is the page clearly different from Workspace?

## Revision

- Is recall tested before answers are revealed?
- Are there only necessary recall questions?
- Does the user always know what to do next?

## Analytics

- Does every metric answer a useful question?
- Is independent solve rate prominent?
- Is the next practice action obvious?

## Calendar

- Is activity understandable at a glance?
- Does clicking a date reveal useful history?
- Is it clearly different from Analytics?

## Settings

- Does the user stay in context?
- Does outside click/Escape work?
- Are only meaningful settings exposed?

---

# 27. Final Product Map

```text
                            DSA OS
                              │
                       ┌──────┴──────┐
                       │  DASHBOARD  │
                       │    Today    │
                       └──────┬──────┘
                              │
             ┌────────────────┼────────────────┐
             ↓                ↓                ↓
          PROBLEMS         REVISION        THIS WEEK
             │
             ↓
      PROBLEM WORKSPACE
             │
       OPEN LEETCODE
             │
       RECORD OUTCOME
             │
             ↓
      PATTERN JOURNAL
             │
             ↓
          REVISION
             │
             ↓
          ANALYTICS
             │
             ↓
       FOCUS NEXT AREA
             │
             └──────────────→ DASHBOARD

CALENDAR
└── Historical record of actual practice

SETTINGS
└── Modal preferences and account controls
```

---

# 28. Implementation Source-of-Truth Rules

1. `DSA_OS_DESIGN_SYSTEM.md` defines global visual language.
2. This document defines UX, information architecture, screen behavior, interactions, states, and relationships.
3. Finalized Stitch exports are visual references.
4. Current product decisions override obsolete generated UI.
5. Do not resurrect removed pages because an older Stitch export still contains them.
6. Do not add features merely because a page has available space.
7. Do not add navigation destinations unless they solve a genuinely distinct user need.
8. Prefer contextual workflows over additional pages.
9. Keep business logic separate from UI components.
10. Use persisted, real user data for progress, history, revision, and analytics.

---

# 29. UX North Star

DSA OS should guide the user through:

```text
OPEN DSA OS
↓
KNOW WHAT TO DO
↓
THINK BEFORE CODING
↓
SOLVE INDEPENDENTLY
↓
RECORD WHAT HAPPENED
↓
CAPTURE THE LESSON
↓
RECALL IT LATER
↓
SEE REAL IMPROVEMENT
↓
PRACTICE THE WEAKEST AREA
```

Every screen should reinforce this loop.

The user should never need to wonder what the interface expects them to do next.

The system should remain concise, purposeful, and focused on genuine improvement in DSA problem solving.
