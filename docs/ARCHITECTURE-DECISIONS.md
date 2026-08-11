# Architecture decisions

The ten questions from `BUILD-BRIEF.md` Part 14, answered before the first
migration. Each records the decision, the reasoning, and what it costs — so a
future maintainer can tell a deliberate choice from an accident.

Decision 10 is **provisional** and needs the association to confirm it.

---

## 1. Hour allocation

**Decision.** A verified hour is *allocated* to at most one stage requirement.
Allocation is automatic, in chronological order of the work, to the earliest
unsatisfied hours-requirement on the volunteer's current journey. Lifetime
total and per-stage allocation are separate figures, both derivable.

**Why.** "24 lifetime hours" and "Stage 2 needs 6 more" must both be true at
once and never contradict. Letting one hour satisfy two stages would make the
six-stage journey meaningless — someone could complete Stage 5 with Stage 1's
hours.

**Cost.** An `hour_allocations` table, and a recompute step. Correcting a
verified hour must recompute allocations for that volunteer from scratch, which
may un-satisfy a requirement. That is correct and must be visible, not hidden.

**Configurable?** No. If an organisation later wants hours to count toward
several stages, that is a new mode, not a tweak.

---

## 2. Journey versioning semantics

**Decision.** A volunteer is pinned to one journey version, stored on the user,
set when their application is accepted. They stay on it for the whole journey.
An admin may move someone to another version, which requires a reason and is
audited; requirements already satisfied stay satisfied.

**Why.** Pinning per stage sounds fairer but means a volunteer's rules change
under them mid-journey, which is exactly the harm versioning exists to prevent.
One version per person is explainable in a sentence: *"You are on the 2026
requirements."*

**Cost.** Long-running volunteers may sit on an old version for years. Mitigated
by the admin move, used deliberately rather than silently.

---

## 3. Requirement re-evaluation

**Decision.** A completed stage is frozen. Adding a requirement to a stage
never makes an already-completed stage incomplete, and never revokes a
credential already issued for it.

**Why.** The alternative tells someone who finished last spring that they did
not, which is both wrong and corrosive to trust in every other figure the
platform reports.

**Implementation.** Completion is recorded in `stage_progress` as a fact with a
timestamp, not derived on every read. The evaluator computes progress for
stages that are *not yet complete*; a completed stage is read from history.

---

## 4. Course versioning and requirement satisfaction

**Decision.** A requirement names a course, not a course version. A pass of any
version satisfies it. A requirement may optionally pin a minimum version for
cases where the content changed materially.

**Why.** Content is edited constantly — a typo fix should not invalidate a
thousand passes. The pin exists for the real case: a safeguarding course
rewritten to a new standard, where the old pass genuinely no longer means what
it meant.

---

## 5. Progression evaluation timing

**Decision.** Computed on read, from one function. No stored progress
percentages. A future cache table is allowed only if it can be fully rebuilt
and a check can prove it matches the computed value.

**Why.** Stored progress drifts the moment anything writes without going
through the one path — and something always does. Correctness first; this is a
volunteer platform, not a trading system, and the read cost is small.

**Trigger to revisit.** If evaluating one volunteer's journey exceeds ~100 ms
or the dashboard needs it for hundreds of people at once.

---

## 6. Attempt retention vs. certificate score

**Decision.** Every attempt is kept. A certificate freezes the score of the
attempt that earned it. A later, better attempt updates the volunteer's record
but **never** alters an already-issued certificate.

**Why.** This is the rule certificates already follow for names. A verifier who
checks the same code twice must see the same document; if the score can move,
the credential means nothing.

---

## 7. Who may verify

**Decision.** Three refusals, all enforced by the database:

1. You may not verify your own hours. *(Already enforced.)*
2. You may not verify hours for an activity you led.
3. You may not sign an evaluation of yourself.

**Why.** The supervisor who ran an activity has the strongest reason to inflate
its hours — their own activity looks better. Rule 1 without rule 2 is a gap
with the shape of a loophole.

**Cost.** A small organisation may have one supervisor at an activity. The
answer is a second verifier or a program admin, not weakening the rule. If this
proves impractical in the field, it is changed deliberately, with a reason
recorded — not quietly.

---

## 8. Notification delivery guarantees

**Decision.** The in-app notification is the source of truth and is written in
the same transaction as the event. Email is a copy, queued, retried with
backoff, and logged. A failed email never blocks or rolls back the event.

**Why.** A volunteer's stage unlocking must not depend on an SMTP server. And
the platform must be able to answer *"was Ahmad told?"* — hence the delivery
log.

---

## 9. Achievement idempotency

**Decision.** Achievements are derived from state and recomputed. If the
underlying state falls below the threshold — a verified hour corrected downward
— the achievement is marked revoked with a reason. The row stays.

**Why.** Deleting it rewrites history and a volunteer who saw a badge yesterday
finds no trace of it today. Keeping it while wrong makes every other figure
suspect. Revoked-with-a-reason is the only honest option, and matches how
certificates already behave.

---

## 10. Multi-tenancy — PROVISIONAL, NEEDS CONFIRMATION

**Provisional decision.** Single-tenant. One organisation: Takaful.

**Why this is defensible.** Nearly everything that multi-tenancy would buy is
already achieved by making the journey, courses, requirements and activities
*data configured by an admin* rather than code. A second organisation would
need its own data, not its own build.

**Why it is still the most expensive question here.** Adding `organisation_id`
to twenty tables, every query, every permission check and every unique index
after there is production data is the single most painful migration on this
list. Deciding it late is how that happens.

**What this costs if the answer changes later.** A large, risky migration
touching every table — feasible, but the kind of work that takes weeks and
carries real risk to live data.

**The cheap insurance, if the answer is "maybe".** Introduce an
`organisations` table now with exactly one row, and carry `organisation_id` on
the handful of tables that would anchor a tenant (`users`, `activities`,
`journey_versions`, `courses`). Perhaps two days of work now against weeks
later.

> **Question for the association:** is there any intention — even a distant one
> — to offer this platform to other Lebanese youth organisations? If the honest
> answer is "possibly", take the insurance now.

**Proceeding under:** single-tenant, without the insurance, until told
otherwise. This document is the record that it was a decision rather than an
oversight.
