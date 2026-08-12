# Takaful Youth Association — takafullb.com

A technical summary of the site as it stands, written to be handed to another
AI so it can propose improvements. Everything below describes what exists and
has been verified, not what is planned. Where something is missing or weak, it
says so.

---

## 1. What the organisation is

Takaful (جمعية تكافل) is a Lebanese youth volunteering association, founded
2020, based in Tripoli, north Lebanon. Registration number (علم وخبر) 898.
Contact: info@takafullb.com, +961 81 206 341.

It runs volunteering programmes and a training academy. Volunteers are accepted
from age 15, which shapes several product decisions (guardian consent, child
safeguarding).

---

## 2. Stack

| | |
|---|---|
| Framework | Next.js 16.2.12, App Router, Turbopack, React 19.2.4 |
| Language | TypeScript, strict |
| Styling | Tailwind CSS 4, CSS-first `@theme` |
| Database | PostgreSQL 17 (Neon, via Vercel Marketplace) |
| DB driver | `pg`, single `DATABASE_URL` |
| Passwords | `@node-rs/argon2` — Argon2id, m=19456 t=2 p=1 (OWASP baseline) |
| Validation | `zod` |
| Hosting | Vercel (Hobby/free), auto-deploy from GitHub `main` |
| Repo | github.com/msharafeddine8-passion/takaful |
| DNS | Registrar Hostinger; A `@` → 216.198.79.1, CNAME `www` → Vercel. Mail (MX/SPF/DKIM/DMARC) still at Hostinger, untouched |

Note: the site was moved off Hostinger hosting to Vercel because the user's ISP
in Lebanon has no route to any Hostinger IP prefix, making the site unreachable
for a portion of Lebanese visitors. Vercel's anycast IPs are reachable.

---

## 3. Internationalisation

Fully bilingual Arabic (default, RTL) and English (LTR), via a `/[lang]`
dynamic segment. All copy lives in `src/lib/dictionaries/{ar,en}.ts` typed
against `types.ts` — adding a string requires adding it in all three, so the
two languages cannot drift. `alternatesFor()` in `src/lib/seo.ts` emits
per-page canonical + hreflang with `x-default` → Arabic.

---

## 4. Routes

### Public
| Route | Purpose |
|---|---|
| `/[lang]` | Home |
| `/[lang]/about` | About the association |
| `/[lang]/areas` | The five programme areas |
| `/[lang]/projects` | Projects |
| `/[lang]/gallery` | 43 photos extracted from the institutional portfolio |
| `/[lang]/journey` | The six-stage volunteer journey, explained |
| `/[lang]/contact` | Contact |
| `/[lang]/academy` | Course catalogue |
| `/[lang]/academy/[slug]` | A course: content, quizzes, finish bar |
| `/[lang]/verify` | **Public certificate verification — no account needed** |

### Account (signed in)
| Route | Purpose |
|---|---|
| `/[lang]/join` | Register |
| `/[lang]/login` | Sign in |
| `/[lang]/account` | Dashboard: membership status, next step |
| `/[lang]/account/apply` | Volunteer application form |
| `/[lang]/account/hours` | Log hours, see totals, stage, full history |

### Staff (capability-gated)
| Route | Purpose |
|---|---|
| `/[lang]/staff` | Overview: two decision queues + six figures |
| `/[lang]/staff/applications` | Review and decide volunteer applications |
| `/[lang]/staff/hours` | Verify or reject logged hours |
| `/[lang]/staff/members` | Member roster with search |
| `/[lang]/staff/members/[id]` | One member: roles, stages, certificates, hours |
| `/[lang]/staff/audit` | Audit log with filter |

---

## 5. The academy

Five Level-1 courses, all published, content written against recognised
international standards (IFRC Volunteering Policy 2022, Keeping Children Safe
International Child Safeguarding Standards 2024, CHS 2024, UNV SWVR 2026, UN
SDGs). Content is universal — written for any volunteer at any organisation,
not Takaful-specific.

1. `volunteering-foundations` — Foundations of Volunteering (90 min)
2. `communication-skills` — Communication Skills (75 min)
3. `teamwork` — Teamwork (70 min)
4. `working-with-children` — Working with Children (90 min, **80% pass mark**)
5. `digital-basics` — Basic Computer Skills (60 min)

Content is structured data, not prose blobs: a `Block` union of
`text | list | ordered | callout | grid | compare | quiz`, each with
`Record<Locale,string>` values.

**Scoring is server-side.** The browser sends which option was picked per
question; it never sends a score, and the score it computed for its own
feedback is discarded. `completeCourseAction` recomputes from the course
content, because that number decides whether a certificate is issued.
Unanswered counts as wrong. Re-attempts keep the best result. No attempt limit.

The safeguarding course reads the reporting contact from
`ORG.safeguardingFocalPoint`, so the course and the rest of the site cannot
disagree about who a volunteer should call.

---

## 6. Data model

Two migrations, PostgreSQL, 15 tables, 25 CHECK constraints, one view.

**001 — identity and applications**
`users`, `profiles`, `profiles_sensitive`, `user_roles`,
`membership_status_history`, `sessions`, `guardian_consents`,
`volunteer_applications`, `audit_logs`

**002 — hours, stages, certificates**
`activities`, `hour_entries`, `stage_progress`, `certificates`,
`course_progress`, plus the `verified_minutes` view

### Governing design rules
- **One identity per person.** Never duplicated, never hard-deleted.
- **Status changes append, never overwrite.** `membership_status_history` is
  the source of truth; current status is the newest row.
- **Append-only wherever a figure could appear in an external report.**
  The hours ledger is corrected by inserting a reversing entry that points at
  the row it corrects — the original stays. A total can always be recomputed
  from scratch and explained line by line.
- **Certificates freeze a snapshot at issue.** A later profile edit cannot
  change what an already-issued certificate says, or a verifier checking the
  same code twice would see two different documents.
- **Sensitive fields are a separate table** (`profiles_sensitive`) with
  different access rules. The application review queue does not select them,
  and computes age in SQL so the birth date never leaves the database.

### Rules the database enforces, not just the code
All of these are CHECK constraints or partial unique indexes, and all have been
probed against the live database (26 behaviours, 0 holes):

- Nobody verifies their own hours, grants themselves a role, awards themselves
  a stage, or decides their own application.
- A verified or rejected entry must name who decided and when.
- A rejection must carry a reason.
- Only a correction entry may be negative; ordinary entries are 5 min–24 h.
- Hours cannot be dated in the future.
- One open volunteer application per person (partial unique index).
- An application decision must record `decided_by` and `decided_at`.
- A stage is reached once; stages are 1–6.
- Consent scopes are constrained to a known set.
- Certificate codes are unique; a course certificate is issued once per person.
- Emails are stored lowercase and are unique case-insensitively.

---

## 7. Authentication and authorisation

**Sessions:** server-side. The cookie carries a random opaque token; only its
SHA-256 hash is stored, so a database leak cannot mint sessions. Suspended
accounts resolve to `null` immediately. 30-day expiry.

**Login timing:** an unknown address is verified against a dummy hash so
response time does not reveal whether an account exists. Measured: 146 ms for
an unknown address vs 160 ms for a known one.

**Nine roles:** `registered_user`, `volunteer`, `team_leader`, `instructor`,
`field_supervisor`, `project_coordinator`, `content_manager`, `program_admin`,
`super_admin`. Roles carry a scope and a validity window; revoking sets
`valid_until` rather than deleting, so "who was a supervisor last spring"
stays answerable.

**Ten membership statuses:** `registered_user`, `course_participant`,
`volunteer_applicant`, `volunteer_candidate`, `accepted_volunteer`,
`active_volunteer`, `inactive_volunteer`, `volunteer_alumni`, `suspended`,
`rejected`.

**`src/lib/authz.ts` is the single gate.** Capabilities are named after the act
rather than the role — `applications.review`, `hours.verify`, `stages.award`,
`certificates.issue`, `certificates.revoke`, `members.manage`, `audit.read`,
`hours.log`, `activities.manage` — so a role can be re-scoped without hunting
down every comparison. Every staff page calls `can()`; no page compares roles
itself. Controls are hidden unless the viewer holds the capability, so nobody
is shown a button that would refuse them.

**Bootstrap:** the schema forbids self-granted roles, so the first admin had to
be inserted directly with `granted_by NULL`, recorded in the audit log as a
system action with the reason written out.

---

## 8. The staff dashboard

`/[lang]/staff` — what needs a decision comes first, everything else is
context. Two queue cards at the top (open applications, hours awaiting
verification) that turn orange only when something is actually waiting; when
both are empty the page says so. Below: members, active volunteers, joined this
month, total verified hours, courses passed, valid certificates.

Every figure comes from `src/lib/admin.ts` and is computed in SQL — a page that
fetched fifty rows and summed them would be quietly wrong the day there were
fifty-one, and the dashboard, a queue and a member page must never disagree.

**Applications queue:** oldest first. Shows motivation, availability,
interests, experience, city, age, and guardian consent — the last sitting
beside the rest rather than buried, because a minor's application cannot be
judged without it. A reviewer can claim an application (moves it to
`under_review` so two people do not work it at once) and then accept, waitlist
or reject. **Every decision requires a reason**, enforced in the markup and
again in the action, because someone will ask months later and "we don't know"
is not an answer to give a 16-year-old. Accepting grants the `volunteer` role
and awards stage 1.

**Hours queue:** verify or reject with a reason. A reviewer's own entries are
hidden — the database and the action both refuse self-verification, so showing
the button would be a lie.

**Members:** roster with name/email search, showing standing, roles, verified
hours, stage, join date. Selects no phone numbers or birth dates: a roster, not
a file on someone.

**Member page:** grant and revoke roles, award stages 1–6, issue an hours
certificate, view the hours ledger. Grant controls are hidden on your own page.

**Audit log:** who did what, when and why, with an action filter. A null actor
renders as "System", not as an unknown person.

---

## 9. Certificates

Two kinds: `course` (issued automatically on passing) and `hours` (issued by
staff).

Codes look like `TKF-4H7K-QM29`, generated with `crypto.randomInt` from an
alphabet that excludes `0/O`, `1/I/L`, `5/S` and `8/B`, because people read
them off paper and over the phone. Unit-tested: 20,000 codes, all well-formed,
all distinct, none containing a confusable character.

`/[lang]/verify` takes a code in the query string so a link can be sent to an
employer, needs no account, and shows only the holder's name, the title and the
dates — enough to confirm a claim, not enough to read a profile. Revoking keeps
the row and the code resolving so the page can say "revoked" rather than "not
found", which would read as a typo and invite a second try.

---

## 10. Verification status

- Migrations applied against the real Neon database: 15 tables, 25 CHECK
  constraints, 1 view.
- Schema probe: 26 behaviours confirmed, 0 holes, run in a rolled-back
  transaction.
- Auth probe: the real `registerUser` / `authenticate` / `hashPassword`
  functions exercised against the real database — all pass.
- End-to-end on the live site: registered an account, session worked, logged
  `2:30`, parsed to "2 hours 30 minutes", entered as pending, appeared in the
  history. Test data then deleted; all tables returned to zero.
- `tsc --noEmit`, `tsc -p scripts --noEmit`, and `next build` all pass.

---

## 11. What is missing or weak — the honest list

**Content**
- News and Partners pages do not exist; no content was supplied.
- Levels 2–6 of the academy are not built. Only Level 1 exists.

**Product gaps**
- No email at all: no verification on signup, no password reset, no
  notification when an application is decided or hours are verified. A rejected
  applicant currently learns only by logging in.
- `activities` table exists but there is no UI to create or manage activities,
  so hours can only be logged without one.
- No pagination on the member list beyond a 50-row limit.
- No CSV or PDF export of hours or certificates.
- Certificates have no printable or shareable visual form — only a code.
- No profile editing: a member cannot change their own name or details.
- No way to suspend or reactivate a member from the dashboard.
- Course progress is recorded only at the end; there is no resume point.

**Technical**
- The bootstrap audit reason is stored in English and renders untranslated in
  the Arabic audit table. Reasons are stored as free text in one language.
- Rate limiting is absent — nothing throttles repeated login attempts.
- No automated test suite in CI; the probes are scripts run by hand.
- `scripts/` is excluded from the app tsconfig and checked by its own; a stale
  second config is a maintenance risk.
- Hours are logged against a date but with no start/end time, so overlapping
  entries cannot be detected.

**Operational**
- The Hostinger plan expires 2026-08-21. The website no longer needs it, but
  `info@takafullb.com` is still hosted there. Unresolved.
- The safeguarding focal point's number is the association's main line rather
  than a direct one; a disclosure routed through a shared line can be
  overheard.

---

## 12. Design principles worth preserving

Any proposed change should respect these, or argue explicitly for breaking one:

1. **The database enforces what matters.** Code-level checks exist for clean
   error messages; the constraint underneath is what makes the rule true.
2. **Anything that could appear in an external report is append-only.**
3. **Totals are computed in SQL, in one place.**
4. **The score that decides a certificate is computed on the server.**
5. **Capabilities are named after the act, not the role.**
6. **Never show a control the viewer's capabilities would refuse.**
7. **Both languages or neither** — the dictionary types enforce it.
8. **Sensitive data is not selected unless the screen genuinely needs it.**
9. **Every consequential decision carries a reason, kept forever.**
