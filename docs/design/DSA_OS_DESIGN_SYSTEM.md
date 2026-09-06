# DSA OS — Unified Design System

> **Version:** 1.0  
> **Status:** Unified design-system source of truth  
> **Designed in:** Google Stitch  
> **Implementation target:** Next.js + TypeScript + Tailwind CSS + shadcn/ui

---

## 0. Purpose of This Document

This document consolidates the visual and interaction language of the finalized DSA OS Stitch screens into **one implementation-ready design system**.

It supersedes the individual Stitch-generated `DESIGN.md` files as the primary visual reference for implementation.

The source exports all contained a similar Stitch-generated “Silk — Neomorphic / Soft UI” design description, but the finalized screens evolved beyond that generic description during iterative UX refinement. In particular:

- the Dashboard evolved to a **green-forward primary accent**
- the Calendar evolved to a **green activity-intensity system**
- some later screens retained indigo/violet accents from earlier generations
- the product architecture changed during iteration
- several navigation items were intentionally removed
- some screen-specific behaviors are now different from the original generated descriptions

Therefore, this document deliberately resolves those inconsistencies instead of simply concatenating the individual Stitch `DESIGN.md` files.

**Rule:** When the individual exported HTML/CSS, screenshots, or per-screen `DESIGN.md` conflicts with this document, this document is the authoritative design-system specification. Screen-specific requirements in the relevant screen specification should still be respected where explicitly stated.

---

# 1. Product Design Philosophy

## 1.1 Product identity

DSA OS is a focused personal operating system for improving DSA problem-solving ability.

The interface should communicate:

- clarity
- focus
- intelligence
- calmness
- progress
- technical sophistication
- consistency

It should feel like a serious developer product, not a generic educational portal.

## 1.2 Core UX philosophy

The product is built around:

**Today → Think → Solve → Learn → Remember → Improve**

The screens have intentionally different psychological roles:

| Screen | Primary question |
|---|---|
| Dashboard | What should I do today? |
| Problems | What can I practice? |
| Problem Workspace | How should I approach this problem? |
| Pattern Journal | What did I learn from this problem? |
| Revision | Can I still remember it? |
| Analytics | Am I actually improving? |
| Calendar | What did I actually do on each day? |
| Settings | How should DSA OS behave for me? |

Never let one screen absorb another screen's purpose unnecessarily.

## 1.3 Minimalism rule

Every UI element must answer at least one of these:

1. What should I do?
2. What do I need to know?
3. What did I learn?
4. How am I improving?
5. What should I do next?

If an element does none of these, it probably does not belong.

---

# 2. Brand

## 2.1 Name

**DSA OS**

## 2.2 Sidebar subtitle

**Mission Control**

This is the canonical product subtitle.

Do not use:

- “Mastering Algorithms”
- other screen-specific taglines
- alternative brand subtitles

## 2.3 Brand personality

DSA OS should feel:

- developer-oriented
- focused
- modern
- disciplined
- intelligent
- quietly motivating

Avoid:

- childish gamification
- loud productivity-app language
- corporate SaaS language
- excessive motivational copy
- gaming/cyberpunk aesthetics

---

# 3. Theme

## 3.1 Primary visual theme

**Light-first, soft neutral UI**

The finalized screens use a cool, pale neutral background with soft surfaces and subtle depth.

The base visual environment should remain calm and low-contrast.

## 3.2 Background

Canonical base:

- **Cool neutral background:** `#E8EAF0`

This is the primary application canvas.

## 3.3 Surfaces

Surfaces should remain within the same neutral family as the background.

Do not introduce large blocks of unrelated surface colors.

Use:

- base background
- slightly lifted surfaces
- subtle translucent/elevated states only where appropriate

## 3.4 Dark mode

Dark mode is supported conceptually by Settings but is not the canonical visual source for the current Stitch designs.

When implementing dark mode:

- preserve the same hierarchy
- preserve the green primary accent
- avoid simply inverting all light-mode colors
- maintain sufficient contrast
- preserve the soft, calm visual language

Dark mode should be treated as a theme variant, not a separate design language.

---

# 4. Color System

## 4.1 Primary accent — DSA OS Green

The finalized Dashboard and Calendar establish green as the strongest product-wide primary accent.

Canonical primary:

- **Primary Green:** `#16A34A`

Use it for:

- primary CTA emphasis
- active controls
- positive progress
- primary links where emphasis is needed
- selected/current states
- Calendar activity intensity
- successful completion
- important actionable highlights

A lighter supporting green may be used for surfaces and activity states.

Useful supporting greens:

- `#BBF7D0` — very light activity / soft success surface
- `#4ADE80` — medium activity
- `#166534` — deep activity / high-intensity state

Do not overuse the darkest green.

## 4.2 Legacy indigo/violet

Some exported screens retained the earlier Stitch indigo/violet system:

- `#6366F1`
- `#7C3AED`

These are considered **legacy/secondary accents**, not the primary product color.

Implementation rule:

- do not use indigo/violet as the primary CTA color
- do not introduce purple merely because a screen's old export used it
- normalize primary interactive emphasis toward DSA OS green
- a muted indigo/lavender may remain as a very limited tertiary visual accent if needed for an existing screen state, but it should never compete with green

## 4.3 Semantic colors

### Success

Use green-family treatment.

Examples:

- solved independently
- completed revision
- completed daily problem

### Warning / needs review

Use restrained amber.

Recommended:

- `#F59E0B`
- soft amber surface where required

Use for:

- Needs Review
- Partial recall
- mild attention states

Do not make it look like an error.

### Error / destructive

Use restrained red.

Recommended:

- `#DC2626`

Use only for:

- actual failure
- destructive actions
- destructive confirmation
- genuine problem states

Do not use red simply because a pattern is weak.

## 4.4 Neutrals

Use neutral typography hierarchy rather than many accent colors.

Primary text:
- deep neutral, approximately `#20212A` / equivalent accessible dark neutral

Secondary text:
- muted neutral gray

Tertiary metadata:
- softer neutral gray

Do not use low-contrast gray for critical readable content.

---

# 5. Typography

## 5.1 Font

Canonical font:

**Plus Jakarta Sans**

Use consistently across the product.

## 5.2 Weight

Preferred:

- medium for body
- semibold for headings
- regular for secondary/supporting copy
- avoid excessive bold

## 5.3 Hierarchy

Use typography rather than color to establish hierarchy.

Recommended conceptual levels:

### Display / page title

Large, semibold.

Examples:

- ANALYTICS
- PATTERN JOURNAL
- REVISION
- CALENDAR

### Section title

Medium/semibold.

Examples:

- TODAY'S MISSION
- FOCUS AREAS
- RECURRING MISTAKES
- DUE TODAY

### Body

Readable medium/regular.

### Metadata

Muted, smaller.

Examples:

- difficulty
- timestamps
- last reviewed
- estimated time

## 5.4 Copy style

Prefer concise copy.

Good:

- “Start Today’s Session”
- “Review Now”
- “Open on LeetCode ↗”
- “What will you remember next time?”
- “Can you recall the approach?”
- “Focus next”

Avoid:

- “Congratulations!!!”
- “You’re crushing it!!!”
- excessive exclamation marks
- long motivational paragraphs
- corporate marketing copy

---

# 6. Layout System

## 6.1 Desktop reference

Primary reference viewport:

**1440 × 900**

Design should make effective use of the viewport without forcing unnecessary scrolling for primary actions.

## 6.2 Main shell

Typical desktop composition:

```text
┌───────────────┬─────────────────────────────────────┐
│ Sidebar       │ Main application content            │
│               │                                     │
│ ~230–260px    │ flexible content width              │
│               │                                     │
└───────────────┴─────────────────────────────────────┘
```

## 6.3 Sidebar

The sidebar is persistent on desktop.

Characteristics:

- narrow/moderate width
- understated
- clear active state
- icon + label
- grouped navigation
- Settings at bottom

The sidebar must never visually overpower the main content.

## 6.4 Main content

Use:

- strong alignment
- consistent page padding
- controlled section spacing
- readable content width
- purposeful whitespace

Avoid:

- arbitrary floating components
- excessive nesting
- excessive card borders
- giant empty areas
- “every element is a card” styling

---

# 7. Visual Depth and Surface Treatment

The original Stitch exports describe a soft/neomorphic direction. The finalized product should preserve the **soft dimensionality** but not blindly force every component into heavy neomorphism.

## 7.1 Preferred approach

Use:

- soft surface elevation
- subtle outer shadows
- subtle inset treatment for inputs
- restrained borders where needed
- consistent surface/background relationship

## 7.2 Raised surfaces

Use a soft shadow model roughly in the range of:

```css
box-shadow:
  6px 6px 12px rgba(0, 0, 0, 0.06),
  -6px -6px 12px rgba(255, 255, 255, 0.55);
```

Adjust opacity and size based on component scale.

## 7.3 Pressed/inset surfaces

For inputs and pressed states, a subtle inset treatment can be used:

```css
box-shadow:
  inset 4px 4px 8px rgba(0, 0, 0, 0.05),
  inset -4px -4px 8px rgba(255, 255, 255, 0.45);
```

## 7.4 Important correction from the Stitch export

The generated Stitch specification says to never combine neomorphism with borders. The finalized screens, however, use subtle borders in places where they improve structure.

**Final rule:**
Use borders when they improve accessibility, grouping, selection, or component definition. Do not add borders everywhere.

Depth should remain subtle.

---

# 8. Border Radius

Use a consistent rounded language.

Recommended range:

- small controls: `10–12px`
- buttons: `12–16px`
- cards/surfaces: `16–20px`
- major modal: `20–24px`

Avoid:

- tiny sharp corners
- excessive pill-shaped containers
- every element becoming a pill

Pills should be reserved for:

- compact filters
- status badges
- difficulty badges
- small state indicators

---

# 9. Spacing

Use a consistent spacing scale.

Conceptually:

- 4px — micro spacing
- 8px — tight spacing
- 12px — compact control spacing
- 16px — standard component spacing
- 20px — card/internal spacing
- 24px — section spacing
- 32px — major section separation
- 40px+ — page-level separation

Do not leave huge empty spaces merely because the viewport has available room.

Whitespace must support:

- hierarchy
- readability
- grouping
- focus

not decoration.

---

# 10. Icons

Use a consistent line-icon system.

Preferred:

**Lucide-style icons**

Icons should:

- have consistent stroke weight
- use the same general optical size
- support labels rather than replace them when meaning is important
- use semantic colors sparingly

Avoid mixing:

- emoji
- filled icons
- thin line icons
- different icon families

The Dashboard may use a small amount of emoji for natural human moments (e.g. streak/fire), but this should be restrained.

---

# 11. Buttons

## 11.1 Primary button

Primary action:

- DSA OS green
- high contrast
- medium/semibold text
- rounded
- subtle depth

Examples:

- Start Today’s Session →
- Open on LeetCode ↗
- Check My Recall →
- Practice This Pattern →

## 11.2 Secondary button

Use:

- neutral raised/inset surface
- subtle border or shadow
- dark neutral text
- lower visual weight

## 11.3 Tertiary action

Use:

- plain text
- subtle icon
- minimal surface

Examples:

- Edit
- Review Now
- View All

## 11.4 Button rules

Do not make every button primary.

A screen should have one visually dominant action.

---

# 12. Inputs and Forms

Inputs should feel integrated with the soft UI.

Use:

- pale neutral surface
- subtle inset treatment
- strong focus outline
- clear placeholder
- readable label

For focused controls:

- use DSA OS green as primary focus indicator
- avoid neon outlines
- avoid intense purple focus unless it is a deliberately retained tertiary state

---

# 13. Badges and Status

## Difficulty

Use compact badges:

- Easy
- Medium
- Hard

Keep them subtle.

Do not use extremely saturated colors.

## Attempt status

Canonical statuses:

- Not attempted
- Solved independently
- Solved with hint
- Solved after approach
- Solved after solution
- Needs revision
- Could not solve

## Revision result

- Easy recall
- Partial recall
- Forgot

## Pattern recognition

- Recognized independently
- Recognized after hint
- Did not recognize

Status styling should remain calm.

---

# 14. Global Navigation — Final

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
Interview Mode

HISTORY
Calendar

SYSTEM
Settings
```

## Explicitly removed

Do not implement as navigation pages:

- Today's Plan
- Weekly Plan
- Notes
- Journey

## Why

### Weekly Plan
The weekly curriculum is fixed and belongs as a compact **This Week** section inside Dashboard.

### Daily Reflection
A lightweight end-of-day interaction, not a main navigation page.

### Notes
Redundant with structured Journal knowledge for the current MVP.

### Journey
Replaced by the final **Calendar** history experience.

### Today's Plan
Redundant with Dashboard's daily mission.

---

# 15. Dashboard Design System

## Purpose

Answer:

> “What should I do today?”

## Primary hierarchy

1. Streak / morning context
2. Today’s Mission
3. Next Up
4. Revision Due
5. This Week / daily curriculum context
6. Focus Areas
7. Reflect/Remember shortcuts
8. small learning insight

## Today's Mission

Contains:

- current curriculum focus
- short learning objective
- today’s problems
- task progress
- Open on LeetCode action
- Start Today’s Session action

Do NOT put the Pattern Journal or end-of-day reflection inside the mission checklist.

## Streak

The streak is a motivational element.

Preferred display:

- fire icon
- large number
- compact “DAY STREAK” label if needed

The streak should attract attention but not overpower Today’s Mission.

## This Week

Compact curriculum roadmap.

Fixed weekly curriculum:

| Day | Focus |
|---|---|
| Monday | Arrays + Hashing |
| Tuesday | Two Pointers + Sliding Window |
| Wednesday | Binary Search + Prefix Sum |
| Thursday | Linked List + Stack |
| Friday | Trees + BST |
| Saturday | Graphs |
| Sunday | Mixed Interview Practice |

Show:

- completed days
- today
- future days

Do not duplicate individual problem names here.

## Focus Areas

Use:

- Recursion
- Binary Search
- Sliding Window
- etc.

Use small progress indicators, not large charts.

Frame weak areas as improvement opportunities.

Prefer “Focus Areas” over “Weak Areas”.

---

# 16. Problems Page Design System

## Purpose

Answer:

> “What problems can I practice?”

The Problems page is the **complete problem library**.

## Main UI

- search
- status filters
- difficulty filter
- pattern filter
- topic filter
- sorting
- problem list

## Default sorting

**Recommended**

Recommendation logic should prioritize:

1. weak patterns
2. appropriate difficulty
3. not recently attempted
4. current curriculum
5. unsolved problems

## Problem list

Each row should show:

- title
- difficulty
- pattern
- status
- last attempt
- action affordance

Do not show:

- company lists
- acceptance rate
- likes
- solution preview
- irrelevant social metrics

## Daily selection relationship

The Dashboard’s daily problems are selected from the same problem library.

The Problems page does not become a “Today’s Problems” page.

---

# 17. Problem Workspace Design System

## Purpose

Answer:

> “How should I approach this problem?”

This is a contextual workspace, not a permanent navigation page.

## Core flow

```text
Select Problem
↓
Before You Code
↓
Initial Approach
↓
Open on LeetCode
↓
Return
↓
Record Result
↓
Create Pattern Journal Entry
```

## Before You Code checklist

Canonical prompts:

- Can I explain the problem in my own words?
- What is the brute-force approach?
- What is its time complexity?
- What am I repeatedly searching for?
- Can I eliminate repeated work?
- Is there a useful data structure?
- What are the important edge cases?

## Initial approach

A focused text area where the user records their first thought.

## External solving

DSA OS does not recreate LeetCode.

Primary action:

**Open on LeetCode ↗**

## After solving

Record:

- solved independently
- solved with hint
- found approach but couldn’t implement
- needed solution
- couldn’t solve

Then capture struggle categories:

- understanding
- finding approach
- pattern recognition
- implementation
- optimization
- edge case

## Critical behavior

Do not reveal the target pattern before the user attempts the problem.

---

# 18. Pattern Journal Design System

## Purpose

Answer:

> “What did I learn from this problem?”

The Journal is the user’s **permanent DSA knowledge base**.

## Main layout

Two-column knowledge workspace:

```text
Left: journal library
Right: selected entry
```

## Search

Search across:

- problem
- pattern
- key observation
- failed idea
- what I’ll remember

## Filters

Keep lightweight:

- All
- Needs Review
- Comfortable
- Pattern dropdown

## Entry fields

Canonical structure:

- Problem
- Failed Idea
- Key Observation
- Pattern
- Time Complexity
- Space Complexity
- What I’ll Remember
- Pattern Recognition

## Important visual hierarchy

“What I’ll Remember” is a key reusable insight and should receive subtle emphasis.

## Pattern recognition

Record:

- Recognized independently
- Recognized after hint
- Did not recognize

This becomes useful data for Revision and Analytics.

## Journal distinction

Problem Workspace:
> What happened while I was solving?

Pattern Journal:
> What should I remember?

---

# 19. Revision Design System

## Purpose

Answer:

> “Can I still remember it?”

Revision is an **active-recall workflow**, not a list of solved problems.

## Primary flow

```text
Select due problem
↓
Recall Pattern
↓
Recall Approach
↓
Check My Recall
↓
Reveal Journal Knowledge
↓
Rate Recall
↓
Schedule Next Review
↓
Next Problem
```

## Pre-recall information

Do NOT reveal the pattern before recall.

Show:

- problem title
- difficulty
- last reviewed date

Do not show:

- pattern
- key observation
- journal answer
- complexity

## Recall questions

Only:

1. What pattern does this problem use?
2. Can you explain the approach?

Do not add separate key-observation and complexity questions to the core revision UI.

## Recall result

Exactly:

- Easy recall
- Partial recall
- Forgot

## Next review

The system schedules the next review based on result.

The exact algorithm belongs to backend logic, not settings/UI clutter.

---

# 20. Analytics Design System

## Purpose

Answer:

> “Am I actually improving?”

## Primary metrics

Only:

- Problems Solved
- Independent Solve Rate
- Revision Recall
- Day Streak

Independent Solve Rate is the most important skill metric.

## Primary chart

One major chart:

**Independent Solve Rate over time**

No chart wall.

## Focus Areas

Show approximately five relevant patterns, especially weak ones.

## Recurring Mistakes

Show ranked mistake categories.

## Your Next Focus

Provide an actionable recommendation:

- current weakest pattern
- why it matters
- suggested practice

## One-sentence insight

Provide a concise interpretation of progress.

## Do not include

- total study hours
- clicks
- session counts
- journal counts
- dozens of charts
- easy/medium/hard pie charts
- decorative analytics

Analytics should interpret learning data, not merely count activity.

---

# 21. Calendar Design System

## Purpose

Answer:

> “What did I actually do on each day?”

This is a visual history page.

## Page name

**Calendar**

Not Journey.

## Main structure

```text
Monthly calendar
+
Selected-day detail panel
```

## Calendar activity intensity

Primary visual signal is **problems solved**.

Suggested states:

### 0 solved / no activity
Neutral.

### 1 solved
Very light green.

### 2 solved
Dark green.

### Weekend high-intensity
If Saturday/Sunday includes:
- 2+ problems
- coding contest/challenge participation

Use deepest green.

Revisions can contribute lightly but should not overpower problem count.

## Selected day

Show only:

### Problems Solved
- title
- difficulty
- result

### Revision
- problem
- recall result

### Contest
- contest/challenge participation

Do NOT show:

- pattern recognition
- journal entries
- analytics
- streak
- motivational content
- learning insights

## Important distinction

Calendar:
> “What did I do?”

Analytics:
> “What does it mean?”

---

# 22. Settings Design System

## UX pattern

Settings is a **modal**, not a standalone page.

Interaction:

```text
Click Settings
↓
Centered modal opens
↓
Background dims
↓
Change settings
↓
Click outside / Escape / X
↓
Modal closes
```

## Modal

Desktop:

- large centered modal
- approximately 760–900px wide
- fixed header
- scrollable internal content if necessary
- soft overlay

## Modal sections

Only:

- Profile
- Practice
- Revision
- Notifications
- Appearance
- Account & Data

## Profile

- profile picture
- name
- email
- timezone

## Practice

- problems per day
- difficulty
- practice days

## Revision

- revisions per day
- adaptive/fixed mode

## Notifications

- daily practice reminder
- revision reminder
- reminder time

## Appearance

- light
- dark
- system

## Account & Data

- export data
- sign out
- delete account

## Explicitly exclude

- XP settings
- gamification
- custom color picker
- font selection
- layout density controls
- analytics configuration
- calendar configuration
- custom curriculum editor
- subscription UI
- social settings
- integrations unless later justified

---

# 23. Calendar and Weekly Curriculum Relationship

Weekly curriculum is a **system-level curriculum rule**, not a separate page.

Canonical weekly structure:

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
Mixed Interview Practice
```

The Dashboard exposes this as:

**This Week**

The backend can store/serve this curriculum.

Do not create a Weekly Plan page unless the product requirements change.

---

# 24. Daily Reflection

Daily Reflection is a lightweight end-of-day activity.

It is NOT a primary navigation destination.

Suggested content:

- overall feeling/confidence
- biggest struggle
- what became clearer
- what to focus on tomorrow

It should be accessible from Dashboard after meaningful daily activity.

Do not create a separate large page.

---

# 25. Component Library

The implementation should provide reusable primitives for:

## Layout

- AppShell
- Sidebar
- Header
- PageHeader
- SectionHeader

## Controls

- Button
- IconButton
- Input
- Textarea
- Select
- SegmentedControl
- Toggle
- Checkbox
- Radio

## Status

- DifficultyBadge
- StatusBadge
- PatternBadge
- FocusBadge
- RecallStatus

## Surfaces

- Card
- Surface
- Divider
- Modal
- Popover

## Content

- ProblemRow
- ProblemCard
- JournalEntryRow
- JournalDetail
- RevisionRow
- TaskRow
- PatternRow
- Metric
- ProgressIndicator

## Calendar

- CalendarGrid
- CalendarDay
- ActivityIntensity
- DayDetailPanel

## Charts

- TrendChart
- PatternProgress

Do not implement each screen as a collection of one-off styles.

---

# 26. Interaction States

Every interactive element should define:

- default
- hover
- focus
- pressed
- selected
- disabled
- loading
- success
- error where appropriate

Do not rely solely on color changes to communicate state.

Selected states may use:

- subtle accent surface
- small accent indicator
- typography emphasis

---

# 27. Accessibility

Maintain:

- semantic HTML
- keyboard navigation
- visible focus state
- readable contrast
- accessible labels
- accessible modal behavior
- focus trapping for modal
- Escape-to-close
- screen-reader-friendly controls

Interactive elements must not depend solely on color.

Calendar activity needs a text/tooltip representation so color is not the only signal.

---

# 28. Responsive Design

## Desktop

Primary reference is 1440 × 900.

## Tablet

Preserve:

- hierarchy
- readable text
- compact navigation
- controlled stacking

## Mobile

Use:

- collapsed/sidebar drawer navigation
- vertical stacking
- full-width primary controls
- simplified secondary metadata

Do not allow horizontal overflow.

Settings modal becomes nearly full-screen on mobile.

Calendar uses:

- compact cells
- selected-day panel below

Problems use:

- simplified row metadata
- filter drawer/sheet

---

# 29. Motion

Motion should be subtle and purposeful.

Allowed:

- hover transitions
- modal open/close
- subtle progress completion
- calendar selection
- active navigation transition
- button press feedback

Avoid:

- constant animated backgrounds
- confetti
- excessive bouncing
- gamified animations
- large page transitions

Motion should reinforce state, not distract.

---

# 30. Loading States

Use skeletons or restrained loading placeholders.

Avoid:

- spinners everywhere
- large blank regions
- layout shifts

Loading state should preserve the final layout as much as possible.

---

# 31. Empty States

Empty states should explain:

1. what is empty
2. why it is empty
3. what the user can do next

Examples:

### Problems
“Your problem library is empty.”

### Journal
“Your first solved problem can become your first reusable lesson.”

### Revision
“Complete a few problems and they’ll appear here for recall.”

### Calendar
“No DSA practice recorded for this day.”

Do not create fake data merely to make the UI look full.

---

# 32. Error States

Errors should be:

- concise
- actionable
- non-technical for users

Examples:

“Couldn’t load your revisions. Try again.”

“Your journal entry wasn’t saved. Please retry.”

Do not expose stack traces.

---

# 33. Data Visualization Rules

The product is deliberately minimalist.

Use charts only when they answer a clear question.

Current approved chart concepts:

- Analytics: independent solve rate trend
- Analytics: compact pattern/mistake lists
- Calendar: activity intensity grid

Do not introduce redundant charts.

---

# 34. Product-Wide Density Rules

## Prefer

- compact lists
- meaningful whitespace
- clear hierarchy
- aligned columns
- reusable components

## Avoid

- giant cards
- nested cards inside cards
- repeated statistics
- redundant headings
- repeated descriptions
- filler content
- excessive whitespace
- information overload

The target is:

**high information value / low cognitive load**

not “use every pixel.”

---

# 35. Navigation Rules

## Dashboard

Primary morning destination.

## Problems

Complete library.

## Problem Workspace

Contextual route, not sidebar destination.

## Pattern Journal

Permanent knowledge library.

## Revision

Daily active recall.

## Analytics

Progress interpretation.

## Calendar

Historical record.

## Settings

Modal utility.

Do not add navigation destinations for features that can be handled contextually.

---

# 36. Data/UX Consistency Rules

The same user activity can appear in several places, but each screen should show it differently according to purpose.

Example: Two Sum

### Dashboard
> Today's problem.

### Problems
> Library item + status.

### Problem Workspace
> Active attempt.

### Journal
> Learning record.

### Revision
> Recall task.

### Analytics
> Contributes to performance metrics.

### Calendar
> Appears as a historical activity on the date completed.

Never duplicate the entire information record on every screen.

---

# 37. Critical Learning Rules

## Pattern concealment

Hide the pattern during:

- daily challenge context where recognition is intended
- Problem Workspace before attempt
- Revision before recall
- Interview Mode

Show the pattern in:

- Problems library
- Pattern Journal
- Pattern-focused contexts after recall

## LeetCode relationship

DSA OS is not a LeetCode clone.

Actual coding happens on LeetCode or another external platform.

DSA OS handles:

- thinking preparation
- attempt metadata
- reflection
- journal
- revision
- analytics
- history

---

# 38. Recommended Responsive Breakpoints

Use the implementation’s standard Tailwind breakpoints, with these conceptual roles:

- mobile: `< 640px`
- small tablet: `640–767px`
- tablet: `768–1023px`
- desktop: `1024px+`
- large desktop: `1280px+`

Design should not be brittle around exact widths.

---

# 39. Design Tokens — Suggested Implementation Layer

Create centralized tokens instead of hardcoding visual values inside components.

Example conceptual tokens:

```ts
colors:
  background
  surface
  surfaceElevated
  text
  textMuted
  primary
  primarySoft
  success
  successSoft
  warning
  warningSoft
  danger
  dangerSoft
  border

radius:
  sm
  md
  lg
  xl

shadow:
  soft
  softInset

spacing:
  1
  2
  3
  4
  5
  6
  8
  10
```

Do not duplicate constants across files.

---

# 40. Final Brand/Color Reconciliation

The individual Stitch exports consistently documented:

- background `#E8EAF0`
- indigo `#6366F1`
- violet `#7C3AED`

However, the finalized screens visibly evolved to a green-forward language, especially in:

- Dashboard
- Calendar
- Problem Workspace
- Analytics

Therefore the implementation source of truth is:

### Primary
**DSA OS Green — `#16A34A`**

### Neutral canvas
**`#E8EAF0`**

### Success
Green family

### Warning
Amber

### Error
Red

### Legacy tertiary
Indigo/violet may remain only where required for a very small supporting accent, but should be normalized down over time.

Do not let separate screens develop independent primary colors.

---

# 41. Final Architecture-Level UI Rules

1. Dashboard is the primary daily destination.
2. Weekly curriculum is embedded in Dashboard; no Weekly Plan page.
3. Calendar is a history surface, not scheduling software.
4. Settings is a modal.
5. Pattern Journal is a knowledge base, not a generic notes app.
6. Revision is active recall, not a solved-problem list.
7. Analytics is diagnostic, not a chart wall.
8. Problems is the complete searchable problem library.
9. Problem Workspace is contextual, not a permanent navigation destination.
10. Do not create pages just because a feature exists.

---

# 42. Final Screen Inventory

The current MVP screen inventory is:

### Primary

- Dashboard
- Problems
- Problem Workspace
- Pattern Journal
- Revision
- Analytics

### Supporting

- Calendar
- Settings modal

### Embedded/contextual

- This Week curriculum
- Daily Reflection
- Post-attempt result
- Pattern Journal creation
- Revision completion/reveal states

### Not separate pages

- Today's Plan
- Weekly Plan
- Notes
- Journey

---

# 43. Final Quality Standard

A screen is considered visually complete when:

- it clearly belongs to DSA OS
- it uses the same global design language
- the primary action is obvious
- the page has one clear purpose
- no redundant feature is present
- no unnecessary metric is present
- spacing is intentional
- content fits the viewport intelligently
- empty/loading/error states are considered
- it remains coherent with the other screens

A screen should never be made “fuller” simply to eliminate whitespace.

---

# 44. Implementation Rule for Antigravity

Antigravity should treat:

1. **This document** as the global visual source of truth.
2. The finalized Stitch HTML/screenshot for a screen as a visual reference.
3. Screen-specific requirements from the product specification as functional requirements.

When a per-screen export conflicts with this system:

- global design rules come from this document
- screen behavior comes from the current product/screen specification
- obsolete generated Stitch UI should not be reproduced

Do not copy the individual exported HTML into production blindly.

Rebuild the UI as reusable React/Next.js components using the tokens and component rules above.

---

# 45. Final Design North Star

DSA OS should feel like:

> **A calm, intelligent command center for becoming better at DSA.**

It should help the user:

**Know what to solve.  
Think before coding.  
Learn from mistakes.  
Remember patterns.  
See genuine progress.**

The product should remain concise, focused and purposeful.

**Do not add interface elements simply because space exists.**

Every element must earn its place.
