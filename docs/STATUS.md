# Where the platform stands

Written 11 August 2026. This is the honest state, including what does not
work yet and what it is waiting on.

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

**Accounts.** Register, sign in, reset a forgotten password, confirm an email
address. Sessions are cut the moment an account is suspended. Sign-in
attempts are throttled by address and by machine, so a password cannot be
guessed at indefinitely.

**Two kinds of member.** Someone can take courses and earn certificates
without ever joining the association. A volunteer journey is assigned when
somebody is *accepted* as a volunteer, not when they register — a learner
having no journey is the normal state, not a gap.

**The academy.** Five courses, written for any volunteer in any organisation.
Reading progress is saved per module, so a ninety-minute course read on a
phone does not start from the top every evening. Questions and their options
are shuffled per attempt, and the correct answer never leaves the server.
Every attempt is kept, so a pass does not erase the road to it.

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
CSV exports for the board and the ministry.

---

## What it is waiting on

These are yours to decide. Nothing here can be done from the code.

### 1. The branch is not deployed

**Everything above is committed locally and none of it is live.** Pushing
needs a GitHub sign-in that cannot happen from an automated session.

```bash
git push origin platform-restore
```

Then merge `platform-restore` into `main` on GitHub, and Vercel deploys it.

### 2. Email cannot be sent

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

### 3. The Hostinger plan expires 21 August 2026

`info@takafullb.com` is hosted there, and so is the domain. The site itself
no longer needs Hostinger. This is a decision about money and about where
the association's mail lives.

### 4. Multi-tenancy has not been decided

The platform is built for one organisation. If Takaful ever wants to run it
for a second, the cheap insurance is an `organisations` table now — days of
work today against weeks later. Answer: yes, maybe, or no.

### 5. Two pages have no content

News and Partners. They need the association's words, not invented ones.

### 6. Stage requirements are empty

The six stages exist; none of them require anything yet. That was
deliberate — inventing thresholds would hard-code exactly what the engine was
built to make configurable. Somebody who knows the programme needs to open
the Journey Builder and say what each stage takes.

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

`npm run probe` runs the whole test suite: fifteen probes, 326 behaviours,
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

**Nothing invented.** Where a number is not known, the code says so rather
than guessing. A stage nobody has finished reports no median rather than
zero.
