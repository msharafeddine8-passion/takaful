# Where the platform stands

Written 11 August 2026, updated 12 August. This is the honest state,
including what does not work yet and what it is waiting on.

---

## What it is

A volunteer platform for جمعية تكافل, not a website with a login. One
account carries a person's whole path: the courses they take, the activities
they attend, the hours they log, the stage they have reached, and the
certificates that come out of all of it. Everything is bilingual Arabic and
English, and a missing translation is a compile error rather than a blank
space a volunteer discovers.

**Live at** takafullb.com, served by Vercel, with the domain and mail still
at Hostinger. **Database** is PostgreSQL 17 on Neon.

---

## What works

**Accounts.** Register, sign in, change a password while signed in, reset a
forgotten one, confirm an email address. Changing a password signs out every
other device and keeps the current one. Sessions are cut the moment an
account is suspended. Sign-in attempts are throttled by address and by
machine, and account creation by machine, so neither a password nor the
members table can be worked at indefinitely.

**Two kinds of member.** Someone can take courses and earn certificates
without ever joining the association. A volunteer journey is assigned when
somebody is *accepted* as a volunteer, not when they register — a learner
having no journey is the normal state, not a gap.

**The academy.** Five courses, written for any volunteer in any organisation.
Each carries six modules and six or seven scenario questions. Reading
progress is saved per module, so a course read on a phone does not start
from the top every evening. Questions and their options are shuffled per
attempt, and the correct answer never leaves the server. Every attempt is
kept, so a pass does not erase the road to it.

The stated durations — 25 to 30 minutes — are measured from the Arabic text
rather than aspired to. They used to say 60 to 90, which was three times
what the courses held. Whether these should *become* 90-minute courses is a
decision about the programme; the software will report whatever is actually
there, and `npm run probe` fails if a card and its course disagree.

**Achievements.** Nine badges across hours, courses, activities and stages,
computed from the ledgers rather than awarded by hand. If the figures behind
one fall — an hour corrected downward — the badge is marked withdrawn with a
reason and kept visible, because a badge that silently disappears makes
every other number on the page suspect.

**The journey engine.** Stages and their requirements are configuration, not
code. Staff set them in the Journey Builder; the engine reads them and works
out where each volunteer stands. Nothing is hard-coded, which is the point:
the association can change what a stage requires without anyone touching the
software.

**Hours.** Logged by the volunteer, verified by somebody else — the database
refuses a self-verification. Verified hours are allocated to requirements
oldest-work-first, and a correction is a reversing entry rather than an edit.

**Activities.** Published with capacity and a minimum stage, registered for,
attended, and turned into hours automatically when attendance is confirmed.

**Certificates.** Issued for a passed course or for a body of verified hours.
Each carries a code anyone can check at `/verify` with no account, and what
it says is frozen at the moment of issue.

**Membership card.** A profile photo and a printable card with a QR code that
resolves to the holder's name and standing — enough to confirm the card is
genuine at a door, and nothing more.

**For staff.** Application queue, hours queue, member records, roles, stage
awards, suspension and reactivation, the Journey Builder, an audit log, and
reports: the funnel from account to active volunteer, where people stall,
per-course completion, hours by month, attendance, and who has gone quiet.
CSV exports for the board and the ministry. A member's record shows, stage
by stage, exactly which requirements are met and which are not — the only
part a coordinator can act on.

**Accessibility.** Checked in a browser rather than assumed: heading levels,
contrast against real backgrounds, labels, alternative text, landmarks,
language and direction, and the keyboard focus outline. Three failures were
found and fixed. It has not been tested with an actual screen reader, and
that remains the honest gap.

**Security.** A per-request nonce and `strict-dynamic` mean an injected
script is refused because it has no nonce, not because a host list happened
to miss it. `form-action 'self'` stops an injected form quietly sending a
volunteer's details somewhere else — these forms carry names, dates of
birth, a guardian's phone number and a password. Sign-in is throttled by
address and by machine, account creation by machine. Dependencies carry zero
known vulnerabilities.

**Monitoring.** Vercel Analytics and Speed Insights. Both first-party, no
cookies, no identifiers — which matters on a site whose visitors include
minors. Before this, when the site broke nobody knew until a person opened
it.

---

## What it is waiting on

These are yours to decide. Nothing here can be done from the code.

### 1. Email cannot be sent

Password reset links and confirmation emails are written, queued and
recorded — and nothing sends them, because no provider is configured. The
forgot-password page says so outright rather than letting somebody wait for a
link that was never coming.

Two environment variables in Vercel turn it on:

- `RESEND_API_KEY` — from resend.com, which has a free tier
- `EMAIL_FROM` — e.g. `تكافل <no-reply@takafullb.com>`

Resend needs a DNS record on takafullb.com to prove the domain is yours.

Optionally `AUTH_PEPPER` — any long random string. It means a copy of the
database cannot be tested against a list of guessed email addresses.

### 2. The Hostinger plan expires 21 August 2026

`info@takafullb.com` is hosted there, and so is the domain. The site itself
no longer needs Hostinger. This is a decision about money and about where
the association's mail lives.

### 3. Multi-tenancy has not been decided

The platform is built for one organisation. If Takaful ever wants to run it
for a second, the cheap insurance is an `organisations` table now — days of
work today against weeks later. Answer: yes, maybe, or no.

### 4. Two pages have no content

News and Partners. They need the association's words, not invented ones.

### 5. Stage requirements are empty

The six stages exist; none of them require anything yet. That was
deliberate — inventing thresholds would hard-code exactly what the engine was
built to make configurable. Somebody who knows the programme needs to open
the Journey Builder and say what each stage takes.

---

## What was audited, and what came of it

A full read-only audit ran on 12 August across architecture, permissions,
user journeys, security, database integrity, UX, accessibility, SEO,
performance, content and code quality. Everything it found that could be
fixed from the code has been.

The findings worth remembering, because they are the shapes that recur:

**An unused export in a `'use server'` file is not dead code.** Every export
there is a network endpoint. One with no callers still promoted any signed-in
user's membership status without their opening a course.

**Two buttons had outlived their destination.** The volunteer call to action
pointed at the contact page from before there was anywhere else to send
anyone, and stayed there after the whole registration, application and
review pipeline was built.

**A finding is only worth as much as the query behind it.** Nine tables were
reported as unknown strays in production and recommended for deletion. They
belong to Neon Auth and live in their own schema; the count had been taken
by table name without checking which schema each was in. The migration that
would have dropped them was deleted before it ran.

**A build passing is not a page working.** The generated share image compiled
cleanly and returned 500 on every request — the renderer could not parse the
site's own Arabic font. Only a request to a running server showed it.

**And verifying the wrong page is not verifying.** A per-request nonce CSP was
built, checked across ten pages, checked again against a local production
build, shipped — and it took the live site down. Every script on every page
was refused: the pages rendered and nothing worked. A nonce cannot exist in a
page rendered at build time, and most of this site is; every page I had
checked happened to be one of the few dynamic ones. Reverted within minutes,
and `next.config.ts` now carries the reason so the next attempt starts from
it. `script-src` is still unrestricted — a real outstanding weakness, written
down as one rather than quietly closed.

**A green local build can hide a red deploy for a day.** The commit that put
monitoring back imported `@vercel/analytics` and `@vercel/speed-insights`
without adding either to `package.json`. Both were already in `node_modules`
from an install that never wrote them down, so every local build passed.
Vercel runs `npm ci`, which installs strictly from the lockfile, and failed —
that commit and everything merged on top of it. The live site kept serving an
older commit and said nothing; the failure was visible only in the commit
status on GitHub. What made it a day instead of a minute was that the check
workflow ran only on `main` and pull requests, and the commit went to the
working branch. It now runs on every branch, and `npm run imports`
(`scripts/undeclared-imports.mjs`) names an undeclared package directly
rather than leaving it to surface as a module-resolution error mid-build.

The rule that follows: **after merging, confirm the live site actually
changed** — not that the push succeeded. A deploy that never ran looks
exactly like a deploy that has not finished yet.

---

## Running it

```bash
npm run dev
```

```bash
npm run migrate
```

```bash
npm run probe
```

```bash
npm run check
```

`npm run probe` runs the whole test suite: eighteen probes, 468 behaviours,
against the real database. Each writes real rows, tries to break the rules
the schema is supposed to enforce, and removes what it made. The runner
checks that the association's configuration is exactly as the run found it —
because once, it was not.

```bash
npm run sweep
```

Removes anything a failed probe left behind. Only ever touches addresses at
`@example.test` and journey versions named `probe %`.

---

## How to think about the code

**The database enforces what matters.** Hours cannot be verified by the person
who logged them. Nobody marks their own attendance. A decided application
names its decider. A status change made by a person records why. These are
CHECK constraints, not conventions, because a rule that lives only in
TypeScript holds for the paths that happen to go through that function and
for nothing else.

**Ledgers, not edits.** Hours, membership status, journey assignments, stage
progress and course attempts are append-only. A correction is a new row. This
is what makes "under which requirements was this certificate earned?" an
answerable question a year later.

**Capabilities, not roles.** Permission is named after the act — `hours.verify`,
`members.manage`, `reports.read` — so the question "who may do this?" has one
answer in one file.

**Nothing is claimed that was not checked.** A full audit on 12 August found
seven real defects and one that turned out not to be one. The withdrawn one
is worth remembering: nine tables were reported as unknown strays in the
production database and recommended for deletion. They belong to Neon Auth
and sit in their own schema — the count had been taken by table name without
looking at which schema each was in. Nothing was wrong. A finding is only
worth as much as the query behind it.

**Nothing invented.** Where a number is not known, the code says so rather
than guessing. A stage nobody has finished reports no median rather than
zero.
