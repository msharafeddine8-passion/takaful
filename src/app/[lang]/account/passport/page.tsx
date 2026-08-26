import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor, SITE_URL } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { LogoFull } from '@/components/Logo';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { ORG } from '@/lib/org';
import { passportFor } from '@/lib/passport';
import { passportStrings } from '@/lib/dictionaries/passport';
import { volunteerRoleStrings, type VolunteerRoleStrings } from '@/lib/dictionaries/volunteer-roles';
import { formatRoleDate, formatRolePeriod } from '@/lib/volunteer-role-view';
import type { VolunteerRole } from '@/lib/volunteer-roles';
import { formatMemberNumber } from '@/lib/roster';
import { achievementByCode } from '@/lib/achievements';
import { awardBadgeFor } from '@/lib/dictionaries/awards';
import { beirutToday, countPhrase } from '@/lib/when';
/* The certificate's own date formatter, deliberately the UTC one: this sheet
 * has to name the same day the printed certificate and the public /verify page
 * name, and both of those go through lib/format. /account/certificates makes
 * the same choice for the same reason. */
import { formatDate, formatDuration } from '@/lib/format';
import { PassportPrintButton } from '@/components/account/PassportPrintButton';

/**
 * «سجلّي التطوّعي» — the volunteer passport. Sections 10 and 11 of the brief.
 *
 * One page carrying a volunteer's whole record inside Takaful, which they
 * print or save as a PDF and attach to a CV, a university application or a
 * scholarship.
 *
 * ── IT IS THE HOLDER'S OWN DOCUMENT, AND THERE IS NO PUBLIC ROUTE ──────────
 *
 * This lives under account/ and shows the signed-in person their own record.
 * There is no /passport/[id], no share token, no signed link, and none may be
 * added. The platform deliberately has no public per-person profile, and it has
 * already had one incident where a public page published half of a credential
 * and let a stranger claim a volunteer's identity — see migration 026 and the
 * head of lib/card-view.ts. A page that assembles a name, a membership number,
 * a join date, a list of committees and a set of certificate codes into one
 * object is the single worst thing on this platform to expose to an
 * unauthenticated URL, and it is exactly what this page assembles.
 *
 * The export is therefore the browser's own print dialogue rather than a link
 * to a hosted file: nothing is written to disk, nothing is served from a URL,
 * and the only copy that exists is the one the holder made.
 *
 * ── THE VIEWER IS THE SESSION AND IS NEVER WIDENED ────────────────────────
 *
 * The roles come from `rolesFor(user.id, viewerOf(user))` inside
 * lib/passport.ts, exactly as the dashboard and /account/roles call it. A role
 * an administrator marked staff-only does not become readable by being about
 * you, and this page has no viewer of its own to pass.
 *
 * ── WHAT THE SHEET MUST SAY, AND SAYS FIRST ───────────────────────────────
 *
 * That it is a record the holder generated of their own account. The
 * association issues real certificates — minted on a pass, carrying a code,
 * checkable at /verify by a stranger — and a sheet of A4 with the same logo on
 * it must not be mistakable for one across an admissions desk. The disclaimer
 * sits above the record rather than in a footer, and it is the first block
 * after the masthead.
 *
 * ── NOTHING HERE COUNTS ANYTHING ──────────────────────────────────────────
 *
 * Every figure comes from the function that already owns it — see the header of
 * lib/passport.ts. If this sheet and the dashboard ever disagreed about how
 * many activities somebody attended, the volunteer would be right to ask which
 * one the association stands behind.
 */

/**
 * The paper.
 *
 * ── WHY THE THEME TOKENS ARE REDEFINED ────────────────────────────────────
 *
 * Surface and ink flip with the theme, and a volunteer reading in dark mode who
 * presses print would otherwise get pale grey text on a white sheet — every
 * token resolves to its dark value and only the background is forced white.
 * The card page can live with that because a membership card is a dark navy
 * object by design; a document somebody attaches to a scholarship application
 * cannot. So the light values are restated for print, on all three selectors
 * globals.css uses: `:root[data-theme="dark"]` outranks a bare `:root`, so
 * naming only the latter would leave the toggle's own choice standing. These
 * are the same values globals.css defines, with two departures — --surface goes
 * to white, because a full-page tint is toner spent on nothing, and --line goes
 * darker, because #dce4ea is invisible on paper.
 *
 * print-color-adjust because the disclaimer is a tinted block and the
 * start-side rule marking a current role is a coloured edge; browsers strip
 * both from printouts by default, and the one block on the sheet that must be
 * impossible to miss would come out as plain prose.
 *
 * ── AND WHY THE BREAKS ARE WHERE THEY ARE ─────────────────────────────────
 *
 * `break-inside: avoid` on `.passport-block` — one role entry, one certificate,
 * one fact. A role split across two sheets of A4 puts a volunteer's title on
 * page one and what they achieved in it on page two, which is how a reader
 * skips it. `break-after: avoid` on `.passport-heading` stops a section title
 * being orphaned at the foot of a page above the list it introduces.
 *
 * Both properties are given twice, in the modern spelling and the `page-break-*`
 * one: Safari still wants the older names, and Safari is what a volunteer on an
 * iPhone is printing from.
 */
const PRINT_RULES = `
@media print {
  @page { size: A4; margin: 14mm; }

  :root, :root[data-theme="dark"], :root[data-theme="light"] {
    --ground: #ffffff;
    --surface: #ffffff;
    --surface-2: #f1f5f8;
    --ink: #12212e;
    --ink-2: #3d5568;
    --ink-3: #4d6376;
    --line: #b3c1cd;
    --ok-text: #15633c;
    --danger-text: #a32117;
    --warn-text: #7a4900;
  }

  header, footer, .no-print { display: none !important; }
  body { background: #fff !important; }

  /* The page furniture, which is chrome rather than document. */
  .passport-page { padding-block: 0 !important; }
  .passport-frame { padding-inline: 0 !important; max-width: none !important; }

  .passport-sheet {
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .passport-block { break-inside: avoid; page-break-inside: avoid; }
  .passport-heading { break-after: avoid; page-break-after: avoid; }
}
`;

export async function generateMetadata(props: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  return {
    title: passportStrings(lang).title,
    alternates: alternatesFor(lang, '/account/passport'),
    // Somebody's whole record. Nothing here belongs in a search index, and the
    // page is behind a session anyway.
    robots: { index: false, follow: false },
  };
}

/*
 * Props typed here rather than as PageProps<'/[lang]/account/passport'>.
 *
 * The generated route union in .next/types is build output and this route is
 * new, so the helper cannot name it until the next build and `npx tsc
 * --noEmit` on a fresh checkout would fail on a page that is perfectly
 * correct. This is the shape the generator emits for a page under [lang],
 * written out — the same accommodation /account/roles makes.
 */
export default async function PassportPage(props: { params: Promise<{ lang: string }> }) {
  // Never prerender: what this shows depends entirely on who is asking.
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = passportStrings(lang);
  /* The roles section borrows its heading and its per-entry labels from the
     timeline it is a copy of, so «قائم» / «سابق» / «الجهة» are the same words
     on the sheet as on /account/roles. A volunteer who has read their record on
     one screen must recognise it on the other. */
  const roleT = volunteerRoleStrings(lang);

  if (!isDbConfigured()) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {dict.account.errors.dbUnavailable}
          </p>
        </Container>
      </Section>
    );
  }

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);

  const record = await passportFor(user);

  /*
   * The day the sheet was made, in Beirut, built by slicing text.
   *
   * beirutToday() hands back 'YYYY-MM-DD' and formatRoleDate slices it — no
   * Date is constructed anywhere on this line. The session runs GMT and the
   * association is in Beirut: a document generated at half past midnight would
   * otherwise be dated yesterday, and a dated document that is wrong about its
   * own date is the first thing a sceptical reader notices.
   */
  const generatedOn = formatRoleDate(beirutToday(), 'day', lang) ?? '';

  const currentRoles = record.roles.filter((role) => role.isCurrent);
  const pastRoles = record.roles.filter((role) => !role.isCurrent);

  const academyLevel = record.academy.levels.find((l) => l.number === record.academy.currentLevel);
  const hasAcademy = record.academy.passedCourses > 0;

  return (
    <>
      <style>{PRINT_RULES}</style>

      <Section className="passport-page">
        <Container className="passport-frame max-w-3xl">
          {/* Everything above the sheet is chrome: it explains the document and
              offers the export, and none of it is part of the document. */}
          <div className="no-print">
            <Kicker>{t.kicker}</Kicker>
            <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
              {t.title}
            </h1>
            <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <PassportPrintButton label={t.download} />
              <Link
                href={`/${lang}/account` as Parameters<typeof Link>[0]['href']}
                className="inline-flex min-h-12 items-center rounded-full border border-line px-6 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
              >
                {t.back}
              </Link>
            </div>
            <p className="mt-3 max-w-[62ch] text-[0.88rem] leading-relaxed text-ink-3">
              {t.downloadHint}
            </p>
          </div>

          {/* ------------------------------------------------------ the sheet */}
          <article className="passport-sheet mt-8 rounded-2xl border border-line bg-surface p-5 sm:p-8">
            <div className="passport-block flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line pb-5">
              <LogoFull siteName={dict.meta.siteName} className="h-12 w-auto shrink-0 sm:h-14" />
              <div className="min-w-0">
                <p className="text-[1.05rem] font-extrabold">{dict.meta.siteName}</p>
                <p className="text-[0.82rem] text-ink-3">
                  {t.orgRegistrationLabel} <span dir="ltr">{ORG.registrationNumber}</span>
                </p>
              </div>
              <p className="ms-auto text-[0.82rem] text-ink-3">
                {t.generatedOn.replace('{date}', generatedOn)}
              </p>
            </div>

            {/*
              * The line the whole feature turns on, above the record rather
              * than beneath it. A reader who gets three lines into this
              * document has already been told what it is not.
              */}
            <section
              aria-labelledby="passport-disclaimer"
              className="passport-block mt-6 rounded-xl border border-warn-text/45 bg-warn/10 p-4 sm:p-5"
            >
              <h2
                id="passport-disclaimer"
                className="text-[0.95rem] font-extrabold text-warn-text"
              >
                {t.notACertificateTitle}
              </h2>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-ink">{t.notACertificate}</p>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-2">{t.verifyHint}</p>
              {/* Its own line and its own direction. A URL reordered by the
                  bidi algorithm mid-sentence is a URL nobody can type. */}
              <p className="mt-1.5 font-mono text-[0.82rem] text-ink-2" dir="ltr">
                {`${SITE_URL}/${lang}/verify`}
              </p>
            </section>

            {/* ------------------------------------------------ who this is */}
            <dl className="mt-7 grid gap-5 sm:grid-cols-2">
              <Fact label={t.nameLabel} value={record.fullName} empty="" />
              <Fact
                label={t.numberLabel}
                value={
                  record.memberNumber === null ? null : (
                    <span dir="ltr">{formatMemberNumber(record.memberNumber)}</span>
                  )
                }
                empty={t.noNumber}
              />
              <Fact
                label={t.memberSinceLabel}
                value={record.joinedAt ? formatDate(record.joinedAt, lang) : null}
                empty={t.memberSinceUnknown}
              />
            </dl>

            {/* ---------------------------------------------- the figures */}
            <h2 className="passport-heading mt-9 text-[0.82rem] font-extrabold tracking-[0.12em] text-ink-3">
              {t.summaryTitle}
            </h2>
            <dl className="mt-3 grid gap-5 sm:grid-cols-2">
              {/*
                * Never a zero, here or anywhere below — the client's section 58.
                * A volunteer whose hours have not been verified yet is told what
                * puts an hour on this sheet, not handed a document with «٠» on
                * it beside their own name.
                */}
              <Fact
                label={t.hoursLabel}
                value={
                  record.summary.verifiedMinutes > 0
                    ? formatDuration(record.summary.verifiedMinutes, lang)
                    : null
                }
                empty={t.hoursEmpty}
              />
              <Fact
                label={t.activitiesLabel}
                value={
                  record.summary.activitiesAttended > 0
                    ? countPhrase(record.summary.activitiesAttended, t.activityCount)
                    : null
                }
                empty={t.activitiesEmpty}
              />
              <div className="passport-block min-w-0 sm:col-span-2">
                <dt className="text-[0.78rem] font-extrabold tracking-[0.12em] text-ink-3">
                  {t.academyLabel}
                </dt>
                {hasAcademy ? (
                  <dd className="mt-1">
                    {academyLevel && (
                      <span className="block text-[1.05rem] font-extrabold break-words">
                        {t.academyLevel
                          .replace('{n}', String(academyLevel.number))
                          .replace('{title}', academyLevel.title[lang])}
                      </span>
                    )}
                    <span className="mt-0.5 block text-[0.9rem] text-ink-2">
                      {t.academyCourses
                        .replace('{done}', String(record.academy.passedCourses))
                        .replace('{total}', String(record.academy.totalCourses))}
                    </span>
                  </dd>
                ) : (
                  <dd className="mt-1 text-[0.9rem] leading-relaxed text-ink-2">{t.academyEmpty}</dd>
                )}
              </div>
            </dl>

            {/*
              * -------------------------------------------------- the roles
              *
              * Placed directly under the figures and given more room than
              * anything else on the sheet, because it is the part a university
              * actually reads: the figures say how much somebody gave, and this
              * says what they were trusted with.
              */}
            <h2 className="passport-heading mt-10 text-[1.05rem] font-extrabold">
              {roleT.mine.pageTitle}
            </h2>
            <p className="mt-1.5 max-w-[62ch] text-[0.88rem] leading-relaxed text-ink-2">
              {t.rolesLede}
            </p>

            {record.roles.length === 0 ? (
              /* The timeline's own empty state, reused rather than rewritten:
                 it already names what would put a line here, which is the whole
                 rule, and two sentences saying it differently would be two
                 answers to one question. */
              <p className="mt-4 max-w-[62ch] rounded-xl border border-line bg-surface-2 px-4 py-4 text-[0.95rem] leading-relaxed text-ink-2">
                {roleT.mine.pageEmpty}
              </p>
            ) : (
              <>
                {currentRoles.length > 0 && (
                  <section className="mt-6">
                    <h3 className="passport-heading text-[0.8rem] font-extrabold tracking-[0.12em] text-ink-3">
                      {roleT.mine.currentHeading}
                    </h3>
                    <ol className="mt-3 space-y-3.5">
                      {currentRoles.map((role) => (
                        <PassportRole key={role.id} role={role} lang={lang} t={roleT} />
                      ))}
                    </ol>
                  </section>
                )}

                {pastRoles.length > 0 && (
                  <section className="mt-7">
                    <h3 className="passport-heading text-[0.8rem] font-extrabold tracking-[0.12em] text-ink-3">
                      {roleT.mine.pastHeading}
                    </h3>
                    <ol className="mt-3 space-y-3.5">
                      {pastRoles.map((role) => (
                        <PassportRole key={role.id} role={role} lang={lang} t={roleT} />
                      ))}
                    </ol>
                  </section>
                )}
              </>
            )}

            {/* ------------------------------------------- the certificates */}
            <h2 className="passport-heading mt-10 text-[1.05rem] font-extrabold">
              {t.certificatesTitle}
            </h2>
            {record.certificates.length === 0 ? (
              <p className="mt-3 max-w-[62ch] rounded-xl border border-line bg-surface-2 px-4 py-4 text-[0.95rem] leading-relaxed text-ink-2">
                {t.certificatesEmpty}
              </p>
            ) : (
              <>
                <p className="mt-1.5 max-w-[62ch] text-[0.88rem] leading-relaxed text-ink-2">
                  {t.certificatesLede}
                </p>
                <ul className="mt-3.5 space-y-3">
                  {record.certificates.map((c) => (
                    <li
                      key={c.id}
                      className="passport-block rounded-xl border border-line bg-surface-2 px-4 py-3.5"
                    >
                      <p className="text-[0.98rem] font-extrabold break-words">
                        {lang === 'ar' ? c.snapshot.titleAr : c.snapshot.titleEn}
                      </p>
                      <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[0.85rem] text-ink-2">
                        {/* A code is a Latin identifier inside Arabic prose, so
                            it carries dir="ltr". The date beside it is localised
                            text and must not — see the head of lib/format.ts. */}
                        <span className="font-mono tracking-wider" dir="ltr">
                          {c.code}
                        </span>
                        <span>{t.issuedOn.replace('{date}', formatDate(c.issued_at, lang))}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {/* Said whether or not there are live certificates. A withdrawn one
                is left off this sheet deliberately — see lib/passport.ts — and
                an omission nobody is told about is the kind that gets found by
                the person it was hidden from. */}
            {record.withdrawnCertificates > 0 && (
              <p className="mt-3 max-w-[62ch] text-[0.85rem] leading-relaxed text-ink-3">
                {t.certificatesWithdrawnNote}
              </p>
            )}

            {/* -------------------------------------------------- the skills */}
            <h2 className="passport-heading mt-10 text-[1.05rem] font-extrabold">{t.skillsTitle}</h2>
            {record.skills.length === 0 ? (
              <p className="mt-3 max-w-[62ch] rounded-xl border border-line bg-surface-2 px-4 py-4 text-[0.95rem] leading-relaxed text-ink-2">
                {t.skillsEmpty}
              </p>
            ) : (
              <>
                {/* In the same breath as the list, not in a footnote. These are
                    typed by the holder into a free-text box; a reader who takes
                    them for something the association assessed has been misled
                    by the layout rather than by the words. */}
                <p className="mt-1.5 text-[0.85rem] text-ink-3">{t.skillsNote}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {record.skills.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[0.85rem] font-bold text-ink-2 break-words"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* -------------------------------------------------- the badges */}
            <h2 className="passport-heading mt-10 text-[1.05rem] font-extrabold">{t.badgesTitle}</h2>
            {record.badges.length === 0 ? (
              <p className="mt-3 max-w-[62ch] rounded-xl border border-line bg-surface-2 px-4 py-4 text-[0.95rem] leading-relaxed text-ink-2">
                {t.badgesEmpty}
              </p>
            ) : (
              <>
                <p className="mt-1.5 text-[0.85rem] text-ink-3">{t.badgesLede}</p>
                <ul className="mt-3.5 grid gap-3 sm:grid-cols-2">
                  {record.badges.map((a) => {
                    const def = achievementByCode(a.code);
                    // A code the catalogue does not own renders nothing rather
                    // than an empty card. The awards are not among them: they
                    // were split off in lib/passport.ts and have their own
                    // section below.
                    if (!def) return null;
                    return (
                      <li
                        key={a.code}
                        className="passport-block flex gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3"
                      >
                        <span aria-hidden className="text-[1.4rem] leading-none">
                          {def.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[0.95rem] font-extrabold break-words">
                            {def.title[lang]}
                          </p>
                          <p className="mt-0.5 text-[0.82rem] text-ink-3">
                            {t.earnedOn.replace('{date}', formatDate(a.earned_at, lang))}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {/* --------------------------------------------- the recognition */}
            <h2 className="passport-heading mt-10 text-[1.05rem] font-extrabold">
              {t.recognitionTitle}
            </h2>
            {record.recognition.length === 0 ? (
              <p className="mt-3 max-w-[62ch] rounded-xl border border-line bg-surface-2 px-4 py-4 text-[0.95rem] leading-relaxed text-ink-2">
                {t.recognitionEmpty}
              </p>
            ) : (
              <>
                <p className="mt-1.5 max-w-[62ch] text-[0.88rem] leading-relaxed text-ink-2">
                  {t.recognitionLede}
                </p>
                <ul className="mt-3.5 space-y-3">
                  {record.recognition.map((a) => {
                    /* The award badges carry their own month in their code, and
                       awardBadgeFor turns it into the same three fields the
                       badge wall reads off a catalogue definition. They are
                       deliberately absent from ACHIEVEMENTS so that a recompute
                       can never withdraw a decision a person made. */
                    const def = awardBadgeFor(a.code);
                    if (!def) return null;
                    return (
                      <li
                        key={a.code}
                        className="passport-block flex gap-3 rounded-xl border border-line border-s-4 border-s-brand-orange bg-surface-2 px-4 py-3"
                      >
                        <span aria-hidden className="text-[1.4rem] leading-none">
                          {def.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[0.98rem] font-extrabold break-words">
                            {def.title[lang]}
                          </p>
                          <p className="mt-0.5 text-[0.88rem] leading-relaxed text-ink-2 break-words">
                            {def.description[lang]}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {/* ---------------------------------------------------- the foot */}
            <div className="passport-block mt-10 border-t border-line pt-4">
              <p className="text-[0.82rem] leading-relaxed text-ink-3">
                {t.contactLabel}: <span dir="ltr">{ORG.email}</span>{' '}
                <span aria-hidden>·</span> <span dir="ltr">{ORG.phone}</span>
              </p>
              {/* The disclaimer's own title, once more at the foot. Somebody
                  reading only the last page of a two-page printout still meets
                  it, and the sentence costs one line. */}
              <p className="mt-1.5 text-[0.82rem] font-bold leading-relaxed text-ink-2">
                {t.notACertificateTitle}
              </p>
            </div>
          </article>

          {/* Clears the fixed bottom bar on a phone, which the dashboard renders
              and which overlaps the foot of every account page under it. */}
          <div aria-hidden className="no-print h-20 lg:hidden" />
        </Container>
      </Section>
    </>
  );
}

/**
 * One labelled fact, or the sentence that says what would fill it.
 *
 * `empty` is a sentence and never a dash or a zero. The two branches are the
 * whole of the client's section 58 expressed once, so that no caller above can
 * decide for itself to render «٠» — a rule enforced in one component holds, and
 * a rule restated at eight call sites is a rule that fails at the ninth.
 *
 * An empty `empty` with a value present is the ordinary case for the name,
 * which cannot be missing: an account has one by construction.
 */
function Fact({
  label,
  value,
  empty,
}: {
  label: string;
  value: ReactNode | null;
  empty: string;
}) {
  return (
    <div className="passport-block min-w-0">
      <dt className="text-[0.78rem] font-extrabold tracking-[0.12em] text-ink-3">{label}</dt>
      {value ? (
        <dd className="mt-1 text-[1.15rem] font-extrabold break-words">{value}</dd>
      ) : (
        <dd className="mt-1 text-[0.9rem] leading-relaxed text-ink-2">{empty}</dd>
      )}
    </div>
  );
}

/**
 * The title in the sheet's language, falling back to the Arabic.
 *
 * The same three lines as titleOf() in components/account/MyRoles.tsx and in
 * components/staff/VolunteerRoles.tsx, and deliberately a third copy rather
 * than an import — the same argument MyRoles.tsx makes about the second one.
 * The fallback is a single branch whose behaviour is fixed by the column's own
 * default: title_en is '' and never null (see toRole in lib/volunteer-roles.ts).
 */
function titleOf(role: VolunteerRole, lang: Locale): string {
  if (lang === 'ar') return role.titleAr;
  return role.titleEn.trim() || role.titleAr;
}

/** One achievement in the sheet's language, falling back to the other. */
function lineOf(item: { ar: string; en: string }, lang: Locale): string {
  return lang === 'ar' ? item.ar || item.en : item.en || item.ar;
}

/**
 * What a role was attached to, as one readable string.
 *
 * A role pointing at a row shows its KIND and not its id, exactly as both
 * timelines do: committees, teams and projects do not all exist as tables yet
 * (migration 046), so there is nothing to join for a name, and a bare UUID on a
 * document somebody attaches to a scholarship application is noise that looks
 * like data.
 */
function entityOf(role: VolunteerRole): string | null {
  const entity = role.entity;
  if (!entity) return null;
  return 'name' in entity ? entity.name : entity.kind || null;
}

/**
 * One entry on the passport's timeline.
 *
 * Recognisably the entry from components/account/MyRoles.tsx — the same
 * start-side rule on a role still held, the same current/past badge, the same
 * period, kind, attachment, description and achievements, and the same words
 * for all of them, because the labels come from the same dictionary.
 *
 * ONE THING IS MISSING ON PURPOSE: the «من يراه» line. On the volunteer's own
 * record that line is useful — it is how somebody finds out that a role of
 * theirs is on the open web — but this sheet is handed to a stranger, and
 * telling an admissions officer that a role is visible to «المتطوّعون داخل
 * المنصّة» tells them something about this platform rather than about the
 * person they are reading.
 *
 * Nothing here derives a date. formatRolePeriod slices 'YYYY-MM-DD' as text and
 * never builds a Date — the association is in Beirut, the session runs GMT, and
 * a role starting 2025-01-01 reads as كانون الأول ٢٠٢٤ the moment anything
 * constructs one. «حتى الآن» comes out of that same function, so a current role
 * cannot print an end date here even from a hand-edited row.
 */
function PassportRole({
  role,
  lang,
  t,
}: {
  role: VolunteerRole;
  lang: Locale;
  t: VolunteerRoleStrings;
}) {
  const attachedTo = entityOf(role);
  return (
    <li
      /* `border-s-*`, never `border-l-*`: it lands on the right in Arabic and
         the left in English, and this document prints in both. */
      className={`passport-block rounded-xl border border-line bg-surface-2 p-4 ${
        role.isCurrent ? 'border-s-4 border-s-brand-orange' : ''
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="text-[1rem] font-extrabold break-words">{titleOf(role, lang)}</h4>
        <span className="text-[0.78rem] font-extrabold text-ink-3">
          {role.isCurrent ? t.currentBadge : t.pastBadge}
        </span>
      </div>

      {/* «من كانون الثاني ٢٠٢٥ حتى الآن» / 'January 2025 – present'. */}
      <p className="mt-1 text-[0.9rem] font-bold text-ink-2">{formatRolePeriod(role, lang)}</p>

      {(role.roleType || attachedTo) && (
        <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.85rem] text-ink-3">
          {role.roleType && (
            <span className="break-words">
              {t.typeLabel}: {role.roleType}
            </span>
          )}
          {attachedTo && (
            <span className="break-words">
              {t.entityLabel}: {attachedTo}
            </span>
          )}
        </p>
      )}

      {role.description && (
        <p className="mt-2.5 whitespace-pre-line text-[0.9rem] leading-relaxed text-ink-2">
          {role.description}
        </p>
      )}

      {role.achievements.length > 0 && (
        <>
          <p className="mt-3 text-[0.78rem] font-extrabold text-ink-3">{t.achievementsHeading}</p>
          <ul className="mt-1.5 space-y-1 text-[0.9rem] text-ink-2">
            {role.achievements.map((a, i) => (
              /* Keyed by index: the list is read-only, never reordered and never
                 filtered in place, and an achievement has no id of its own — the
                 column is a JSONB array, deliberately (migration 046). */
              <li key={i} className="flex gap-2">
                <span aria-hidden className="font-bold text-ink-3">
                  ·
                </span>
                <span className="break-words">{lineOf(a, lang)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </li>
  );
}
