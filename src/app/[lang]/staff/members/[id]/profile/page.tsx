import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { memberProfile, type MemberProfileStrings } from '@/lib/dictionaries/member-profile';
import { priorActivities } from '@/lib/dictionaries/prior-activities';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured } from '@/lib/db';
import { countPhrase, formatDate, formatDateTime } from '@/lib/when';
import { formatDuration } from '@/lib/format';
import { achievementByCode } from '@/lib/achievements';
import { COURSES } from '@/lib/courses';
import { memberDossier } from '@/lib/member-profile-data';
import type { MemberFile } from '@/lib/member-profile';

/**
 * One person, on one screen.
 *
 * Answering "why has this volunteer stopped?" used to mean opening the member
 * page for their roles, the hours queue for what is waiting, the roster queue
 * for whether their claim was ever decided, the recognition panel for their
 * badges, their achievements page for their points and the audit log for who
 * did what — six pages, four of which are lists that have to be searched. The
 * rows are the same rows; what was missing was somewhere they sit together.
 *
 * It reads and never writes, and that is a decision rather than an omission.
 * A screen that shows everything is a screen people leave open, and a button
 * on it is a button pressed while somebody is looking for something else. The
 * actions stay where they already are and this page links to them.
 *
 * Two things it will not show, whatever is asked of it later:
 *
 *   No birth date and no age. Whether somebody is a child is a fact a
 *   coordinator needs and the date behind it is not, and the platform has
 *   minors on it. lib/member-profile turns three dates into one of three words
 *   and the page is never handed the dates.
 *
 *   No safeguarding, guardian, medical or emergency-contact value. That a
 *   record exists and that its consents are stamped is what a member of staff
 *   needs in order to act; the contents belong to the record, which is kept by
 *   the volunteer and in the office.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/staff/members/[id]/profile'>,
): Promise<Metadata> {
  const { lang, id } = await props.params;
  if (!isLocale(lang)) return {};
  return {
    title: memberProfile(lang).title,
    /* Still declared even though nothing indexes this: a member of staff who
     * switches language mid-page should land on the same person, not the
     * members list. */
    alternates: alternatesFor(lang, `/staff/members/${id}/profile`),
    robots: { index: false, follow: false },
  };
}

export default async function MemberProfilePage(
  props: PageProps<'/[lang]/staff/members/[id]/profile'>,
) {
  await connection();
  const { lang, id } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = memberProfile(lang);

  if (!isDbConfigured()) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {dict.account.errors.dbUnavailable}
        </p>
      </Container></Section>
    );
  }

  /* Nothing is read before this. The capability, not the role, and the same
   * one the member page it hangs off already demands. */
  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);
  if (!can(user, 'members.manage')) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {dict.account.staff.forbidden}
        </p>
      </Container></Section>
    );
  }

  const dossier = await memberDossier(id);
  if (!dossier) notFound();
  const { identity, file } = dossier;

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{dict.account.staff.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.6rem,1.3rem+1.4vw,2.2rem)] font-extrabold tracking-tight">
          {identity.fullName}
        </h1>
        {identity.displayName && (
          <p className="mt-1 text-[0.95rem] text-ink-2">«{identity.displayName}»</p>
        )}
        <p className="mt-1.5 text-ink-3" dir="ltr">{identity.email}</p>
        <p className="mt-3 max-w-[62ch] text-[0.95rem] leading-relaxed text-ink-2">{t.lede}</p>

        <Chips t={t} file={file} />

        <Standing t={t} lang={lang} file={file} />
        <Joined t={t} lang={lang} file={file} />
        <Roster t={t} lang={lang} file={file} />
        <Hours t={t} lang={lang} file={file} />
        <Activities t={t} lang={lang} file={file} />
        <Courses t={t} lang={lang} file={file} />
        <Certificates t={t} lang={lang} file={file} />
        <Badges t={t} lang={lang} file={file} />
        <Stages t={t} lang={lang} file={file} />
        <Safeguarding t={t} file={file} />
        <Visibility t={t} lang={lang} file={file} />
        <Trail t={t} lang={lang} file={file} />
        <Links t={t} lang={lang} id={id} />

        <Link
          href={`/${lang}/staff/members/${id}`}
          className="mt-10 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          ← {t.back}
        </Link>
      </Container>
    </Section>
  );
}

// ------------------------------------------------------------- furniture

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-[1.05rem] font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="mt-3 max-w-[64ch] text-[0.86rem] leading-relaxed text-ink-3">{children}</p>;
}

/** A figure and what it counts. Latin digits, as everywhere else here. */
function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 px-4 py-3">
      <p className="text-[0.78rem] font-extrabold tracking-[0.06em] text-ink-3">{label}</p>
      <p className="mt-1 text-[1.05rem] font-extrabold" dir="ltr">{value}</p>
    </div>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}

/**
 * A line that needs somebody to do something about it.
 *
 * Deliberately the only loud thing on the page. Everything else here is a
 * fact; these three — a minor with no safeguarding record, a public listing
 * with no recorded consent, a claim nobody ever decided — are faults, and a
 * page where every panel shouts is a page where none of them is heard.
 */
function Alarm({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 rounded-xl border-2 border-danger bg-danger/10 px-4 py-3 text-[0.9rem] font-bold text-danger-text">
      {children}
    </p>
  );
}

function Caution({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 rounded-xl border-2 border-warn bg-warn/10 px-4 py-3 text-[0.9rem] font-bold text-warn-text">
      {children}
    </p>
  );
}

/** Present or absent, said in words rather than with a tick nobody can read. */
function Presence({ on, yes, no }: { on: boolean; yes: string; no: string }) {
  return (
    <li className={`flex items-baseline gap-2 ${on ? 'text-ink-2' : 'text-ink-3'}`}>
      <span aria-hidden="true" className={on ? 'font-bold text-ok-text' : 'font-bold text-ink-3'}>
        {on ? '✓' : '○'}
      </span>
      <span>{on ? yes : no}</span>
    </li>
  );
}

type Props = { t: MemberProfileStrings; file: MemberFile };
type LangProps = Props & { lang: Locale };

// ---------------------------------------------------------------- panels

function Chips({ t, file }: Props) {
  const status = file.account.status;
  const tone =
    status === 'active'
      ? 'bg-ok/15 text-ok-text'
      : status === 'suspended'
        ? 'bg-danger/12 text-danger-text'
        : 'bg-surface-2 text-ink-3';

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <span className={`rounded-full px-3.5 py-1.5 text-[0.85rem] font-extrabold ${tone}`}>
        {t.accountStatus[status] ?? status}
      </span>
      <span className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[0.85rem] font-bold">
        {file.isVolunteer ? t.volunteerYes : t.volunteerNo}
      </span>
      {/* The fact, never the date. See lib/member-profile. */}
      <span className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[0.85rem] font-bold">
        {file.minor === 'minor' ? t.ageMinor : file.minor === 'adult' ? t.ageAdult : t.ageUnknown}
      </span>
      {file.roster && (
        <span className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[0.85rem] font-bold" dir="ltr">
          {file.roster.label}
        </span>
      )}
    </div>
  );
}

function Standing({ t, lang, file }: LangProps) {
  return (
    <Panel title={t.standingTitle}>
      <dl className="mt-4 space-y-3 text-[0.95rem]">
        <div>
          <dt className="text-[0.8rem] font-extrabold tracking-[0.06em] text-ink-3">
            {t.membershipTitle}
          </dt>
          <dd className="mt-1 font-bold">
            {file.account.membershipStatus
              ? t.membership[file.account.membershipStatus] ?? file.account.membershipStatus
              : t.membershipNone}
          </dd>
        </div>
        <div>
          <dt className="text-[0.8rem] font-extrabold tracking-[0.06em] text-ink-3">
            {t.rolesTitle}
          </dt>
          <dd className="mt-1.5 flex flex-wrap gap-2">
            {file.roles.length === 0 ? (
              <span className="text-ink-3">{t.rolesNone}</span>
            ) : (
              file.roles.map((r) => (
                <span
                  key={r}
                  className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[0.82rem] font-bold"
                  dir="ltr"
                >
                  {r}
                </span>
              ))
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[0.8rem] font-extrabold tracking-[0.06em] text-ink-3">{t.ageTitle}</dt>
          <dd className="mt-1 font-bold">
            {file.minor === 'minor' ? t.ageMinor : file.minor === 'adult' ? t.ageAdult : t.ageUnknown}
          </dd>
        </div>
        {/* The first thing anybody checks when an account has gone quiet, and
            until now it lived nowhere a member of staff could see it. */}
        <div>
          <dt className="text-[0.8rem] font-extrabold tracking-[0.06em] text-ink-3">
            {t.lastSeenTitle}
          </dt>
          <dd className="mt-1 font-bold">
            {file.account.lastSeenAt
              ? t.lastSeen.replace('{date}', formatDateTime(file.account.lastSeenAt, lang))
              : t.lastSeenNever}
          </dd>
        </div>
      </dl>
      <Note>{t.ageNote}</Note>
    </Panel>
  );
}

function Joined({ t, lang, file }: LangProps) {
  const { joinedOn, accountFrom, predatesAccount } = file.span;
  return (
    <Panel title={t.sinceTitle}>
      <p className="mt-3 text-[0.98rem] font-bold">
        {joinedOn
          ? t.since.replace('{date}', formatDate(joinedOn, lang))
          : t.sinceNone}
      </p>
      {accountFrom && (
        <p className="mt-1.5 text-[0.9rem] text-ink-2">
          {t.accountSince.replace('{date}', formatDate(accountFrom, lang))}
        </p>
      )}
      {predatesAccount && <Note>{t.predates}</Note>}
    </Panel>
  );
}

function Roster({ t, lang, file }: LangProps) {
  const r = file.roster;
  if (!r) {
    return (
      <Panel title={t.rosterTitle}>
        <p className="mt-3 text-ink-2">{t.rosterNone}</p>
      </Panel>
    );
  }
  return (
    <Panel title={t.rosterTitle}>
      <Grid>
        <Figure label={t.rosterNumber} value={r.label} />
        {r.committee && <Figure label={t.rosterCommittee} value={r.committee} />}
        {r.claimedOn && <Figure label={t.rosterClaimed} value={formatDate(r.claimedOn, lang)} />}
        {r.approvedOn && <Figure label={t.rosterApproved} value={formatDate(r.approvedOn, lang)} />}
      </Grid>

      <p className="mt-5 text-[0.8rem] font-extrabold tracking-[0.06em] text-ink-3">{t.rosterHow}</p>
      <p className="mt-1.5 text-[0.95rem] font-bold">
        {r.strength ? t.strengths[r.strength] ?? r.strength : t.rosterHowNone}
      </p>
      {/* A claim nobody ever decided is the one state here that is somebody's
          fault, so it is said once and loudly rather than twice and calmly. */}
      {r.recognition === 'awaiting' ? (
        <Caution>{t.rosterWaiting}</Caution>
      ) : (
        r.recognition && (
          <p className="mt-1.5 text-[0.9rem] text-ink-2">{t.recognition[r.recognition]}</p>
        )
      )}
    </Panel>
  );
}

function Hours({ t, lang, file }: LangProps) {
  const h = file.hours;
  return (
    <Panel title={t.hoursTitle}>
      <Grid>
        <Figure label={t.hoursVerified} value={formatDuration(h.verified, lang)} />
        <Figure label={t.hoursOnPlatform} value={formatDuration(h.onPlatform, lang)} />
        <Figure label={t.hoursCarried} value={formatDuration(h.carried, lang)} />
        <Figure label={t.hoursPending} value={formatDuration(h.pending, lang)} />
      </Grid>
      <Note>{t.hoursNote}</Note>
    </Panel>
  );
}

/**
 * Signing up, turning up — and what the carried hours are credited for.
 *
 * Four figures rather than three, and the fourth is last and separately
 * labelled. «حضر» counts registers a supervisor filled in; «المشاركة
 * المحتسبة» is that plus one activity for every two hours of service given
 * before the platform existed, which is the figure the volunteer sees on their
 * own dashboard and passport. Both are shown, so a coordinator reading this
 * file and a volunteer reading theirs are looking at the same two numbers
 * rather than at one number each and disagreeing about it.
 *
 * The reliability sentence underneath still divides `attended` by `registered`
 * and the credit does not enter it — see ActivityStanding in lib/member-profile.
 */
function Activities({ t, lang, file }: LangProps) {
  const a = file.activities;
  const prior = priorActivities(lang);
  return (
    <Panel title={t.activitiesTitle}>
      <Grid>
        <Figure label={t.activitiesRegistered} value={countPhrase(a.registered, t.counts.activities)} />
        <Figure label={t.activitiesAttended} value={countPhrase(a.attended, t.counts.attended)} />
        <Figure label={t.activitiesMissed} value={countPhrase(a.missed, t.counts.attended)} />
        <Figure label={prior.fileFigureLabel} value={countPhrase(a.credited, t.counts.attended)} />
      </Grid>
      <p className="mt-4 text-[0.95rem] font-bold">
        {a.rate === null
          ? t.activitiesRateNone
          : t.activitiesRate.replace('{n}', String(a.rate))}
      </p>
      {a.creditedFromHours > 0 && <Note>{countPhrase(a.creditedFromHours, prior.file)}</Note>}
      <Note>{t.activitiesNote}</Note>
    </Panel>
  );
}

/** The catalogue title for a slug, falling back to the slug itself. */
function courseTitle(slug: string, lang: Locale): string {
  return COURSES.find((c) => c.slug === slug)?.title[lang] ?? slug;
}

function Courses({ t, lang, file }: LangProps) {
  const { passed, inProgress } = file.courses;
  if (passed.length === 0 && inProgress.length === 0) {
    return (
      <Panel title={t.coursesTitle}>
        <p className="mt-3 text-ink-2">{t.coursesNone}</p>
      </Panel>
    );
  }
  return (
    <Panel title={t.coursesTitle}>
      {passed.length > 0 && (
        <>
          <p className="mt-4 text-[0.8rem] font-extrabold tracking-[0.06em] text-ink-3">
            {t.coursesPassed} · {countPhrase(passed.length, t.counts.courses)}
          </p>
          <ul className="mt-2 space-y-1.5 text-[0.93rem]">
            {passed.map((c) => (
              <li key={c.slug} className="flex flex-wrap items-baseline gap-2">
                <span aria-hidden="true" className="font-bold text-ok-text">✓</span>
                <span className="font-bold">{courseTitle(c.slug, lang)}</span>
                {c.passedOn && (
                  <span className="text-[0.84rem] text-ink-3">{formatDate(c.passedOn, lang)}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {inProgress.length > 0 && (
        <>
          <p className="mt-6 text-[0.8rem] font-extrabold tracking-[0.06em] text-ink-3">
            {t.coursesOpen} · {countPhrase(inProgress.length, t.counts.courses)}
          </p>
          <ul className="mt-2 space-y-1.5 text-[0.93rem]">
            {inProgress.map((c) => (
              <li key={c.slug} className="flex flex-wrap items-baseline gap-2">
                <span aria-hidden="true" className="font-bold text-ink-3">○</span>
                <span className="text-ink-2">{courseTitle(c.slug, lang)}</span>
                <span className="text-[0.84rem] text-ink-3">
                  {countPhrase(c.attempts, t.counts.attempts)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}

function Certificates({ t, lang, file }: LangProps) {
  const { held, revoked } = file.certificates;
  if (held.length === 0 && revoked.length === 0) {
    return (
      <Panel title={t.certificatesTitle}>
        <p className="mt-3 text-ink-2">{t.certificatesNone}</p>
      </Panel>
    );
  }
  return (
    <Panel title={t.certificatesTitle}>
      {held.length > 0 && (
        <>
          <p className="mt-4 text-[0.8rem] font-extrabold tracking-[0.06em] text-ink-3">
            {t.certificatesHeld} · {countPhrase(held.length, t.counts.certificates)}
          </p>
          <ul className="mt-2 space-y-2">
            {held.map((c) => (
              <li key={c.code} className="rounded-xl border border-line bg-surface-2 px-4 py-2.5">
                <span className="font-mono font-bold tracking-wider" dir="ltr">{c.code}</span>
                <span className="ms-3 text-ink-2">{lang === 'ar' ? c.titleAr : c.titleEn}</span>
                {c.issuedOn && (
                  <span className="ms-3 text-[0.84rem] text-ink-3">{formatDate(c.issuedOn, lang)}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {/* Shown, not hidden. A certificate that disappeared without a word is
          what makes a volunteer doubt the ones still on the page. */}
      {revoked.length > 0 && (
        <>
          <p className="mt-6 text-[0.8rem] font-extrabold tracking-[0.06em] text-ink-3">
            {t.certificatesRevoked} · {countPhrase(revoked.length, t.counts.certificates)}
          </p>
          <ul className="mt-2 space-y-2">
            {revoked.map((c) => (
              <li key={c.code} className="rounded-xl border border-line bg-surface-2 px-4 py-2.5">
                <span className="font-mono font-bold tracking-wider line-through" dir="ltr">
                  {c.code}
                </span>
                <span className="ms-3 text-ink-3">{lang === 'ar' ? c.titleAr : c.titleEn}</span>
                {c.revokeReason && (
                  <p className="mt-1 text-[0.86rem] text-danger-text">
                    {t.revokeReason}: {c.revokeReason}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}

function Badges({ t, lang, file }: LangProps) {
  const { held, withdrawn } = file.badges;
  const name = (code: string) => achievementByCode(code)?.title[lang] ?? null;

  if (held.length === 0 && withdrawn.length === 0) {
    return (
      <Panel title={t.badgesTitle}>
        <p className="mt-3 text-ink-2">{t.badgesNone}</p>
        <p className="mt-3 text-[0.95rem] font-bold">
          {t.pointsTitle}: {countPhrase(file.points, t.counts.points)}
        </p>
        <Note>{t.pointsNote}</Note>
      </Panel>
    );
  }

  return (
    <Panel title={t.badgesTitle}>
      {held.length > 0 && (
        <>
          <p className="mt-4 text-[0.8rem] font-extrabold tracking-[0.06em] text-ink-3">
            {t.badgesHeld} · {countPhrase(held.length, t.counts.badges)}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {held.map((b) => (
              <li
                key={b.code}
                className="rounded-full border border-line bg-surface-2 px-3.5 py-1.5 text-[0.85rem] font-bold"
              >
                {achievementByCode(b.code)?.icon && (
                  <span aria-hidden="true">{achievementByCode(b.code)?.icon} </span>
                )}
                {/* A code with no definition is a badge the volunteer holds and
                    the platform can no longer describe. Named as that rather
                    than rendered as a bare slug nobody can read. */}
                {name(b.code) ?? (
                  <span className="text-warn-text">{t.badgeUnknown} <span dir="ltr">({b.code})</span></span>
                )}
                {b.byHand && (
                  <span className="ms-2 text-[0.78rem] font-normal text-ink-3">{t.badgeByHand}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {withdrawn.length > 0 && (
        <>
          <p className="mt-6 text-[0.8rem] font-extrabold tracking-[0.06em] text-ink-3">
            {t.badgesWithdrawn} · {countPhrase(withdrawn.length, t.counts.badges)}
          </p>
          <ul className="mt-2 space-y-2">
            {withdrawn.map((b) => (
              <li key={b.code} className="rounded-xl border border-line bg-surface-2 px-4 py-2.5">
                <span className="font-bold text-ink-3 line-through">
                  {name(b.code) ?? b.code}
                </span>
                {b.withdrawnOn && (
                  <span className="ms-3 text-[0.84rem] text-ink-3">
                    {formatDate(b.withdrawnOn, lang)}
                  </span>
                )}
                {b.withdrawReason && (
                  <p className="mt-1 text-[0.86rem] text-ink-2">
                    {t.withdrawReason}: {b.withdrawReason}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="mt-6 text-[0.95rem] font-bold">
        {t.pointsTitle}: {countPhrase(file.points, t.counts.points)}
      </p>
      <Note>{t.pointsNote}</Note>
    </Panel>
  );
}

function Stages({ t, lang, file }: LangProps) {
  return (
    <Panel title={t.stagesTitle}>
      <div className="mt-4 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <span
            key={s}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-[0.95rem] font-extrabold ${
              file.stage >= s
                ? 'bg-brand-orange text-brand-orange-ink'
                : 'border border-line text-ink-3'
            }`}
          >
            {s}
          </span>
        ))}
      </div>
      {file.stages.length === 0 ? (
        <p className="mt-4 text-ink-2">{t.stagesNone}</p>
      ) : (
        <ul className="mt-4 space-y-1 text-[0.9rem] text-ink-2">
          {file.stages.map((s) => (
            <li key={s.stage}>
              {t.stageReached
                .replace('{n}', String(s.stage))
                .replace('{date}', s.reachedOn ? formatDate(s.reachedOn, lang) : '—')}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function Safeguarding({ t, file }: Props) {
  const s = file.safeguarding;
  return (
    <Panel title={t.safeguardingTitle}>
      <ul className="mt-4 space-y-2 text-[0.93rem]">
        <Presence on={s.onFile} yes={t.safeguardingOnFile} no={t.safeguardingNone} />
        {s.onFile && (
          <>
            <Presence on={s.agreementsRecorded} yes={t.agreements} no={t.agreementsNone} />
            <Presence
              on={s.guardianConsentRecorded}
              yes={t.guardianConsent}
              no={t.guardianConsentNone}
            />
            <Presence on={s.medicalNoteOnFile} yes={t.medicalNote} no={t.medicalNoteNone} />
          </>
        )}
      </ul>

      {/* The one combination worth interrupting somebody about. The database
          refuses a minor's record without a guardian's consent, so a child in
          this state has no record at all — and therefore no emergency contact
          reachable from a field activity. */}
      {file.minor === 'minor' && !s.onFile && <Alarm>{t.minorWithoutRecord}</Alarm>}

      <Note>{t.safeguardingPrivacy}</Note>
    </Panel>
  );
}

function Visibility({ t, lang, file }: LangProps) {
  const v = file.visibility;
  return (
    <Panel title={t.visibilityTitle}>
      <p className="mt-3 text-[0.98rem] font-bold">{t.visibility[v.choice]}</p>
      <p className="mt-1.5 text-[0.9rem] text-ink-2">
        {v.everChose
          ? t.visibilityChose.replace('{date}', formatDate(v.chosenAt, lang))
          : t.visibilityNeverChose}
      </p>
      {v.unexplained && <Alarm>{t.visibilityUnexplained}</Alarm>}
      {file.minor === 'minor' && <Note>{t.visibilityMinor}</Note>}
    </Panel>
  );
}

function Trail({ t, lang, file }: LangProps) {
  return (
    <Panel title={t.auditTitle}>
      <p className="mt-2 max-w-[64ch] text-[0.92rem] leading-relaxed text-ink-2">{t.auditLede}</p>
      {file.audit.length === 0 ? (
        <p className="mt-4 text-ink-2">{t.auditEmpty}</p>
      ) : (
        <>
          <p className="mt-4 text-[0.8rem] font-extrabold tracking-[0.06em] text-ink-3">
            {countPhrase(file.audit.length, t.counts.entries)}
          </p>
          <ul className="mt-2 space-y-2.5">
            {file.audit.map((e, i) => (
              /* Keyed by index: read-only, never reordered, never filtered in
               * place, and audit_logs.id is not selected because the page has
               * no use for it. Two lines can share an actor, an action and a
               * second — a recompute over two people — so a composed key would
               * not be unique either. */
              <li key={i} className="rounded-xl border border-line bg-surface-2 px-4 py-3">
                <p className="text-[0.78rem] font-extrabold tracking-[0.08em] text-ink-3">
                  {t.actions[e.action] ?? e.action}
                  {' · '}
                  {formatDateTime(e.at, lang)}
                </p>
                <p className="mt-1 text-[0.92rem] font-bold">
                  {/* A null actor means a rule did it, and only that. Calling it
                      "unknown" would say the platform lost track of who acted. */}
                  {e.byRule ? t.auditSystem : (e.actor ?? t.auditNoActor)}
                </p>
                {e.reason && (
                  <p className="mt-1 text-[0.88rem] leading-relaxed text-ink-2">{e.reason}</p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}

function Links({ t, lang, id }: { t: MemberProfileStrings; lang: Locale; id: string }) {
  const links: Array<[string, string]> = [
    [`/${lang}/staff/members/${id}`, t.linkMember],
    [`/${lang}/staff/hours`, t.linkHours],
    [`/${lang}/staff/roster`, t.linkRoster],
    [`/${lang}/staff/recognition`, t.linkRecognition],
    [`/${lang}/staff/audit`, t.linkAudit],
  ];
  return (
    <Panel title={t.linksTitle}>
      <p className="mt-2 max-w-[64ch] text-[0.92rem] leading-relaxed text-ink-2">{t.linksLede}</p>
      <ul className="mt-4 space-y-2 text-[0.95rem]">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="font-bold text-brand-blue hover:underline dark:text-brand-orange">
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <Note>{t.linkSafeguarding}</Note>
    </Panel>
  );
}
