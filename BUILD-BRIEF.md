# Takaful Volunteer Platform — Build Brief

You are being asked to evolve an existing, working, production system into a
complete volunteer management platform. This document is the specification.

Read it in full before proposing anything.

**Companion document: `PROJECT-SUMMARY.md`** describes the current codebase,
data model, routes and verified behaviour in detail. Read that first. This
brief assumes you have.

---

## PART 0 — Five hard constraints

These are not preferences. A proposal that violates any of them is rejected.

### 1. Do not rewrite

The existing system is production, serving a real organisation, with real
data. It is well-architected. You extend it. You do not start again, you do not
replace the framework, you do not "modernise" working code. Every existing
table, module and principle listed in Part 2 stays unless there is a specific,
argued reason to change it.

### 2. Nothing about the volunteer journey may be hard-coded

Today the six stages exist as a number 1–6 with no requirements attached.
Tomorrow an administrator must be able to change what Stage 3 requires — add a
course, raise the hours from 20 to 25, require a supervisor evaluation — from a
screen, with no developer, no deploy, no migration.

If changing a requirement needs a code change, the design has failed.

### 3. Build a real progression engine

Stages are not awarded because an admin clicked a button. The system evaluates
requirements and decides eligibility. Manual award becomes an **override** for
exceptional cases, requiring a reason, fully audited.

### 4. Courses, hours, activities and certificates are one connected system

A volunteer joins an activity → attends → a supervisor confirms → hours become
verified → those hours count toward a stage requirement → completing the stage
unlocks the next → completing a course issues a certificate → the certificate
is publicly verifiable.

These are not five features that happen to share a database. They are one
pipeline. Design them together.

### 5. Migrations must be safe and preserve existing data

Additive, reversible, tested against a copy before production. Existing rows
keep their meaning. No destructive migration is acceptable. The site must not
go down.

---

## PART 1 — Principles inherited from the existing system

These already hold. Keep them. Breaking one requires an explicit argument.

1. **The database enforces what matters.** Code-level checks exist for clean
   error messages; the CHECK constraint underneath is what makes the rule true.
   26 such behaviours are currently probed and pass with zero holes.
2. **Anything that could appear in an external report is append-only.** The
   hours ledger is corrected by inserting a reversing entry that points at the
   row it corrects. The original stays. A total can always be recomputed from
   scratch and explained line by line.
3. **Totals are computed in SQL, in one place.** A page that fetches fifty rows
   and sums them is quietly wrong the day there are fifty-one.
4. **Scores that decide a credential are computed on the server.** The browser
   sends which option was picked; the score it computed for its own feedback is
   discarded.
5. **Capabilities are named after the act, not the role** — `hours.verify`, not
   `isSupervisor`. Every page calls `can()`; no page compares roles itself.
6. **Never show a control the viewer's capabilities would refuse.**
7. **Both languages or neither.** Dictionary types make a missing translation a
   compile error.
8. **Sensitive data is not selected unless the screen genuinely needs it.** The
   application queue computes age in SQL so the birth date never leaves the
   database.
9. **Every consequential decision carries a reason, kept forever.**
10. **Credentials freeze a snapshot at issue.** A later profile edit cannot
    change what an already-issued certificate says.
11. **Nobody verifies, grants or decides for themselves** — enforced by CHECK
    constraints, not by hiding buttons.

---

## PART 2 — What exists today (do not rebuild)

Preserve and build on: `users`, `profiles`, `profiles_sensitive`, `user_roles`,
`membership_status_history`, `sessions`, `guardian_consents`,
`volunteer_applications`, `audit_logs`, `activities`, `hour_entries`,
`stage_progress`, `certificates`, `course_progress`, the `verified_minutes`
view, `src/lib/authz.ts`, server-side quiz scoring, the bilingual dictionary
architecture, and the append-only ledger design.

See `PROJECT-SUMMARY.md` §6, §7 for the full model and rules.

---

## PART 3 — The target: eight connected systems

```
Identity & Profile
        ↓
  Journey Engine  ←── the core; everything reports into it
     ↙   ↓   ↘
Academy Activities Evaluations
     ↘   ↓   ↙
       Hours
        ↓
    Credentials
        ↓
Communications & Analytics
```

Every one of them reads and writes the same Volunteer Record.

---

## PART 4 — The volunteer journey (the core model)

### Required flow

```
Register → Complete Profile → Application → Accepted → Stage 1
  → Required Learning → Pass Assessment → Verified Hours
  → Required evaluation/activity → Stage Completed → Stage 2 unlocked
  → … → Stage 6 → Graduate / Alumni
```

### Stage status (computed, never stored as a manual flag)

`Locked` · `Available` · `In Progress` · `Requirements Completed` ·
`Awaiting Approval` · `Completed`

### Requirement types (all configurable per stage)

| Type | Configuration |
|---|---|
| Course completion | which course, minimum score |
| Verified volunteer hours | how many |
| Assessment pass | which, pass mark |
| Mandatory activity attendance | which, or any of a category |
| Supervisor evaluation | which form, who may sign |
| Document / consent | which document |
| Final manual approval | which capability may approve |

Each requirement is optional or required, ordered, and independently
configurable. The numbers in the user's examples (12 hours, 20 hours, 75%) are
**illustrations of the mechanism, not fixed values**.

### The volunteer must always see why a stage is locked

Not `Stage 2 🔒`. Instead:

```
To unlock Stage 2:
✅ Foundations of Volunteering — complete
✅ Assessment — passed
🟠 8 / 12 verified volunteering hours   (4 remaining)
⬜ Supervisor evaluation
```

The platform guides the volunteer. The organisation should not have to explain
what to do next.

### Admin override

Manual stage award becomes `Override progression`, requiring a reason, and
recording actor + timestamp + previous state + new state + reason in the audit
log. Example reason: *"Previous certified volunteering experience accepted."*

---

## PART 5 — Academy

Keep: structured content blocks, server-side scoring, bilingual content, the
international-standards grounding.

### Add

**Microlearning structure.** Course → Module → Lesson → Block. Not one long
page of text. A lesson is 5–10 minutes.

**Per-block progress, saved continuously.** Today progress is written only at
the end and there is no resume point. Required: `course, module, lesson,
position, completed blocks, checkpoints, attempt, last activity`, so the portal
can say *"Communication Skills — Module 3, Lesson 2 — Continue"*.

**Content block types to support:** text, image, video, audio, callout,
accordion, cards, comparison, timeline, scenario, interactive question,
multiple choice, true/false, matching, ordering, reflection, downloadable
material, final quiz.

**Scenario learning**, especially for safeguarding. Not *"what is correct?"* but
*"You are at a children's activity and a child wants to tell you something
sensitive. What do you do?"* → choose → `✅ Good choice` or `⚠️ Think again`,
each with an explanation.

**Completion based on meaningful action, not time served.** Do not force a
video to play for eight minutes. Completion = required lessons done, required
interactions done, checkpoints answered, assessment passed. Some pages may
simply be *Mark as complete*.

**Assessment engine:** question bank (e.g. 50 questions, 15 drawn per attempt),
with admin-configurable pass mark, max attempts, cooldown, question
randomisation, choice randomisation, whether answers are shown, whether retries
are allowed. Keep **all attempts**, not just the best:

```
Attempt 1   62%   Failed
Attempt 2   74%   Failed
Attempt 3   88%   Passed
```

**Learning paths, not a catalogue:** `Required for your stage` first, then
`Recommended`, then `Optional`.

**Course versioning.** If a course changes after someone took it, their
certificate and their attempt must still refer to the version they took —
mirroring how certificates already freeze a snapshot.

---

## PART 6 — Activities and hours

### Activities (the `activities` table exists but has no UI)

Opportunity cards: title, date, time, location, hours value, spots taken/total,
minimum stage, project. Filters: date, area, location, required stage,
available spots, project.

**Registration with a clear reason on refusal.** Not a vague error:
*"This activity requires Stage 3. You are currently Stage 2."*

`My Activities`: Upcoming · Completed · Cancelled · Waiting list.

### Attendance → hours

Preferred flow: volunteer registers → attends → at the end the supervisor
confirms attendance (*"Mohammad — 4h 45m"*) → hours are verified, either
automatically on supervisor confirmation or pending a second verification,
per organisation policy (configurable).

Optional QR check-in / check-out, supervisor-controlled. **Do not use GPS**
unless there is a real need — it adds privacy burden and complexity for little
gain.

### Manual / external hours stay

Not all volunteering is booked through the platform. Fields: date, start, end,
organisation or activity, description, supervisor, evidence (optional or
required, configurable), notes. Status: pending verification.

**Add overlap detection.** Hours currently carry a date but no start/end time,
so overlapping entries cannot be detected. Add `start_time`, `end_time`,
`activity_id`, attendance status, verification, supervisor — then warn:
*"You already logged volunteering hours between 10:00 and 13:00 on this date."*

### Hour allocation — read this carefully

If Stage 1 requires 10 hours and Stage 2 requires 20, the same hour must not
silently satisfy both, unless organisation policy says it should.

```
Stage 1   required 10h   allocated 10h   complete
Stage 2   required 20h   allocated 14h   6h remaining
Lifetime verified: 24h
```

Lifetime total and per-stage allocation are different questions with different
answers. The model must express both.

---

## PART 7 — Credentials

`Certificates` becomes `My Credentials`.

**Self-service, eligibility-controlled.** The volunteer generates their own
certificate, but only where the system says they qualify:

```
✅ Course Certificate            Download
✅ Stage 2 Completion            Generate
✅ 50 Volunteer Hours            Generate
🔒 Stage 3 Certificate           Complete Stage 3 first
```

**Each certificate carries:** logo, name snapshot, type, achievement or course,
verified hours where relevant, issue date, certificate ID, QR code,
verification URL, verification metadata.

**Actions:** view, download PDF, print, copy verification link, share.

**Design the credential layer so Open Badges 3.0 remains possible later** —
issuer, achievement criteria, evidence, recipient, aligned with Verifiable
Credentials. Do not implement it now. Do not design a model that forecloses it.

### Achievements (separate from certificates)

Recognition, not gamification: *First Volunteer Activity · 25 Verified Hours ·
50 Verified Hours · Stage Completed · Safeguarding Trained · Academy Level
Completed*.

**No public leaderboard of hours.** Ranking volunteers by hours rewards
quantity over quality. Use milestones, personal progress and team achievements
instead.

---

## PART 8 — The volunteer portal

Replace the current thin `/account` with:

`Home · My Journey · Academy · Opportunities · My Activities · My Hours ·
Certificates · Achievements · Notifications · My Profile · Help`

### Home

```
Hello Mohammad 👋
You are in Stage 2
█████████████░░░░░  68%

Your next step
  Complete Communication Skills — 12 minutes remaining
  [ Continue Course → ]
```

**One next step, not fifteen cards.** Then a compact summary (hours 18/25,
courses 3/4, activities 5, certificates 3), then upcoming activity, continue
learning, recent achievement, latest notification.

### My Journey — the signature feature

A visual roadmap of all six stages with the current position marked, each stage
expandable to show its requirements and exactly what remains. This is what makes
the platform a journey rather than a form.

### Profile becomes a Volunteer Record

Personal information · volunteering profile (interests, skills, availability,
languages, areas) · documents (guardian consent, required forms) · privacy
(password, sessions, notification preferences, data options).

---

## PART 9 — The admin platform

```
OVERVIEW      Dashboard · Decision Center
VOLUNTEERS    Members · Applications · Journey Progress · Evaluations
ACTIVITIES    Activities · Registrations · Attendance · Hours · Verification
ACADEMY       Courses · Course Builder · Learners · Assessments · Question Bank
CREDENTIALS   Certificates · Achievements · Verification
COMMUNICATION Notifications · Email Templates · Email Log
ANALYTICS     Volunteers · Journey Funnel · Activities · Academy · Hours · Reports
ADMINISTRATION Journey Builder · Roles & Permissions · Users · Audit · Security · Settings
```

### Decision Center

One screen: *"21 things need your attention"* — applications waiting, hours
awaiting verification, evaluations waiting, certificate exceptions, guardian
consent issues. The admin should never hunt across pages.

### Journey Builder

Per stage: title AR/EN, description, icon, order. Then `+ Add Requirement`
choosing from course, hours, assessment, activity, supervisor evaluation,
document, manual approval. Save. Done. No developer.

### Journey versioning — critical

If Stage 3 requires 20 hours today and 30 next year, what happens to people
already partway through?

Requirements are **versioned**. `Journey Version 2026`, `Journey Version 2027`.
An admin decides *"new volunteers use 2027 requirements"*, with a separate,
explicit migration policy for existing volunteers. **History is never quietly
rewritten under someone who already met the old bar.**

### Course Builder

Course → Module → Lesson → Block → Quiz, with Arabic and English preview, and
`Draft / Published / Archived` states.

### Member record — 360°

Overview (stage, status, hours, academy, activities, certificates) plus tabs:
Journey · Learning · Activities · Hours · Certificates · Roles · Application ·
Documents · History · Audit.

Keep the existing discipline: sensitive fields are selected only by screens
that genuinely need them.

### Stage progress table with blockers

| Volunteer | Stage | Progress | Blocker |
|---|---:|---:|---|
| Ahmad | 2 | 85% | Needs 3h |
| Sara | 3 | 90% | Evaluation |
| Omar | 1 | 60% | Course |
| Maya | 4 | 95% | Approval |

---

## PART 10 — Analytics

Not "total members". Required:

**Acquisition** — registrations, applications, acceptance rate.
**Journey** — % at each stage, completion funnel, average stage duration, where
volunteers drop off.
**Retention** — active, inactive, returning.
**Hours** — total, by activity, by programme, by stage, average per member,
time to verification.
**Academy** — starts, completions, drop-off lesson, pass rate, average score,
attempts, completion time.
**Activities** — registrations, attendance rate, no-show rate, capacity
utilisation, hours generated.
**Certificates** — issued, downloaded, shared, publicly verified, revoked.

### The funnel matters most

```
2,100 Registered → 1,520 Applied → 1,140 Accepted
→ 980 Stage 1 → 720 Stage 2 → 510 Stage 3 → …

Biggest drop-off: Stage 2 → Stage 3
```

Then let the admin drill in: is it the course, the hours, the evaluation, or
inactivity? Analytics must support a decision, not decorate a page.

---

## PART 11 — Communications

The platform currently sends **no email at all**. This is its single largest
gap: a rejected applicant learns only by logging in.

**Notifications centre** in-app: hours approved · stage unlocked 🎉 · new
activity available · application accepted · course now available · certificate
ready · activity starts tomorrow.

**Email** for the consequential ones, with templates, a delivery log, and
per-user preferences.

**Account recovery**: email verification on signup, password reset. Neither
exists today.

---

## PART 12 — Safeguarding, security, accessibility

### Safeguarding

Volunteers start at 15, so this is not optional. Guardian consent status,
age-aware permissions, restricted access to sensitive information, a
safeguarding reporting workflow, and a dedicated capability. **Not every admin
should be able to read a disclosure.**

### Security

Keep capability-based authorisation. Add: rate limiting (nothing currently
throttles login attempts), MFA for sensitive staff roles, password reset, email
verification, session management, security event logging, CI tests, backups,
monitoring, error tracking.

**Deny by default, and authorise on the server for every request.** A hidden
button is not an protected endpoint.

### Accessibility — target WCAG 2.2 AA

Keyboard navigation, visible focus, adequate touch targets, accessible
authentication, subtitles and transcripts for video, sufficient contrast,
screen-reader labels, and never colour alone to convey state.

### Mobile first, and low bandwidth

Assume most volunteers use a phone on a weak Lebanese connection. A full
lesson, logging hours, QR check-in, uploading evidence, downloading a
certificate, registering for an activity and taking a quiz must all work on
mobile without a desktop. Selectable video quality, transcripts, optimised
images, no heavy animation, and resume without re-downloading tens of
megabytes.

---

## PART 13 — Data model additions

Extend; do not replace. Conceptually needed (exact table boundaries are yours
to determine at schema design):

```
journey_versions              course_versions
journey_stages                course_modules
stage_requirements            course_lessons
stage_requirement_progress    lesson_progress
                              course_attempts
activity_registrations        question_bank
activity_attendance
activity_checkins             evaluations
hour_allocations              notifications
                              notification_preferences
certificate_templates         email_deliveries
credential_files              achievements
uploads / documents           user_achievements
```

---

## PART 14 — Decisions to resolve before writing code

These are the choices that, left open, force a schema rewrite in two months.
Answer each explicitly, in writing, before the first migration.

1. **Hour allocation.** Are hours consumed by a stage, or counted against it?
   Can one hour satisfy two requirements? Is allocation automatic, or chosen?
   What happens to allocations when a verified hour is later corrected?

2. **Journey versioning semantics.** Is a volunteer pinned to the version they
   started, or to the version current when they entered each stage? What
   happens to someone mid-stage when a version changes? Can an admin move
   someone between versions, and what does that do to completed requirements?

3. **Requirement re-evaluation.** When a requirement is added to a stage that
   people have already completed, are they retroactively incomplete? (Almost
   certainly not — but the rule must be written down and enforced.)

4. **Course versioning and requirement satisfaction.** If Stage 2 requires
   "Communication Skills" and the course is replaced by version 3, does a
   version-1 pass still satisfy it?

5. **Progression evaluation timing.** Computed on read, or recalculated on
   write and stored? Read is always correct but costly; stored is fast but can
   drift. Whichever you choose, there must be a way to recompute from scratch
   and prove the stored value matches.

6. **Attempt retention vs. certificate score.** All attempts are kept — but
   which score does the credential carry, and does a later better attempt
   change an already-issued certificate? (It must not.)

7. **Who owns verification.** Can the supervisor who ran an activity verify
   its hours? The current schema forbids verifying your own hours; does it also
   forbid verifying hours for an activity you led?

8. **Notification delivery guarantees.** Is an email failure retried? Is the
   in-app notification the source of truth and email a copy?

9. **Achievement idempotency.** Achievements are derived from state. What
   happens when the underlying state is corrected downward — is *50 Verified
   Hours* revoked when a correction drops someone to 48?

10. **Multi-tenancy.** Is this ever intended to serve organisations other than
    Takaful? The answer changes the model fundamentally, and changing it later
    is the most expensive migration on this list.

---

## PART 15 — Delivery

Design the **complete architecture up front**. Implement **in testable phases**
so nothing breaks in production:

```
Foundation → Journey Engine → Academy → Activities & Hours
→ Credentials → Notifications → Analytics → Final QA
```

Each phase: migration → backend → permissions → UI → bilingual copy →
end-to-end test on real data → deploy.

### Definition of done

A phase is complete when its workflow has been exercised end to end against a
real database, in both languages, on mobile, by a user holding each relevant
capability and by one holding none — not when it compiles.

### The five features that make this a platform rather than a website

1. My Journey interactive roadmap
2. Automatic stage unlocking
3. Academy microlearning and scenarios
4. Activities → verified hours → stage progression
5. Self-service verifiable certificates and achievements

---

## PART 16 — What "finished" means

Eight systems, one Volunteer Record:

**Identity & Profile → Journey Engine → Academy → Activities → Hours →
Evaluations → Credentials → Communications & Analytics**

A system that manages, teaches, tracks, evaluates and credentials a volunteer
from the day they register to the day they graduate — not a place to sign up
and type in hours.
