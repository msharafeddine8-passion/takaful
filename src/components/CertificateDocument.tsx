import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/dictionaries/types';
import { ORG } from '@/lib/org';

/*
 * THE DOCUMENT'S OWN PALETTE, deliberately not the site tokens.
 *
 * The site tokens flip with the theme; a certificate must not. The same
 * document has to look identical on a dark-mode phone, a light-mode laptop and
 * a sheet of paper, because it is one artefact that people compare across all
 * three. So the document paints in fixed values from the brand family:
 * ivory ground, deep navy ink, calm gold rule-work — the logo's own
 * #205B8B/#EB9F31 pulled toward document register.
 */
export const DOC = {
  ivory: '#fdfbf5',
  /** The main reading ink: brand-blue-deep. */
  navy: '#0f3350',
  /** Secondary ink — labels, the registration line. */
  slate: '#42586b',
  /** The frame and rules: brand-orange-dark, gold without the shine. */
  gold: '#c07f1c',
  /** Gold quiet enough to repeat — hairlines, the inner ornament ring. */
  goldSoft: '#dcb56e',
} as const;

type CertificateStrings = Dictionary['account']['certificate'];

export type CertificateDocumentData = {
  code: string;
  kind: 'course' | 'orientation' | 'level' | 'program' | 'hours';
  /** From the snapshot, never live. */
  fullName: string;
  /** Course/level/path title in the page language, from the snapshot. */
  title: string;
  /** Already formatted for the page language (formatDate). */
  issued: string;
  /** Already formatted (formatDuration); empty string when none. */
  learningTime: string;
  /** Volunteering hours for kind='hours'; empty string when none. */
  volunteerTime: string;
  /**
   * For kind='level': what closed the level when this was issued, from the
   * snapshot. Absent means the marked paper, which is what closed a level
   * before the decision run did — see CertificateSnapshot.closedBy.
   */
  closedBy?: 'run' | 'paper';
};

/**
 * The certificate sheet itself — everything inside the A4-landscape frame,
 * nothing outside it. Pure presentation: the caller looks up the row, freezes
 * the strings and renders the QR; this component may not touch the database,
 * so what it shows is exactly what it was given.
 *
 * Every size is in cqw (the article is a container), so the whole sheet
 * scales as one artefact: a phone shows a small but correctly proportioned
 * certificate the reader can pinch-zoom, print shows the same design at
 * 297mm, and nothing reflows differently between the two.
 */
export function CertificateDocument({
  lang,
  t,
  tOther,
  siteName,
  cert,
  qr,
  verifyHost,
}: {
  lang: Locale;
  t: CertificateStrings;
  /** The other locale's strings — an official paper titles itself in both. */
  tOther: CertificateStrings;
  siteName: string;
  cert: CertificateDocumentData;
  /** Inline SVG markup, generated server-side. */
  qr: string;
  /** The short verify address printed on the sheet; the full URL is in the QR. */
  verifyHost: string;
}) {
  const other: Locale = lang === 'ar' ? 'en' : 'ar';

  const KIND_LABEL: Record<CertificateDocumentData['kind'], string> = {
    orientation: t.kindOrientation,
    course: t.kindCourse,
    level: t.kindLevel,
    program: t.kindProgram,
    hours: t.kindHours,
  };

  /*
   * Document title and recognition sentence are per-kind, from the dictionary
   * — nothing hard-coded except issuer identity (ORG). The orientation is a
   * course for this purpose. The wording is gender-neutral by construction
   * (masdar, no إتمامه/إتمامها) because gender is not stored anywhere.
   */
  const pick = (s: CertificateStrings) =>
    ({
      course: { title: s.docTitleCourse, body: s.bodyCourse },
      orientation: { title: s.docTitleCourse, body: s.bodyCourse },
      /*
       * The one sentence on this sheet that depends on WHEN it was issued.
       * A certificate earned by sitting the paper must go on saying so, or the
       * association has quietly rewritten what somebody did.
       */
      level: {
        title: s.docTitleLevel,
        body: cert.closedBy === 'run' ? s.bodyLevel : s.bodyLevelPaper,
      },
      program: { title: s.docTitleProgram, body: s.bodyProgram },
      hours: { title: s.docTitleHours, body: s.bodyHours },
    }) as const;
  const doc = pick(t)[cert.kind];
  const docOther = pick(tOther)[cert.kind];

  // The full-path certificate is visibly the more distinguished document:
  // a heavier gold frame, a second gold hairline, and the distinction badge.
  const isProgram = cert.kind === 'program';

  const presidentName = lang === 'ar' ? ORG.president.name : ORG.president.nameEn;
  const presidentTitle = lang === 'ar' ? ORG.president.titleAr : ORG.president.titleEn;

  return (
    <article
      lang={lang}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="certificate @container relative mx-auto aspect-[297/210] w-full overflow-hidden rounded-sm shadow-[0_2px_16px_rgba(15,51,80,0.14)]"
      // textSizeAdjust: mobile browsers inflate small text, and on a sheet
      // where every size is proportional that inflation is what pushes the
      // bottom band off the page. The phone shows the true sheet and zooms.
      style={{ background: DOC.ivory, color: DOC.navy, textSizeAdjust: 'none', WebkitTextSizeAdjust: 'none' }}
    >
      {/* The double frame: gold outer, navy hairline inner. The path
          certificate carries a heavier gold band plus a second gold hairline
          — quietly, not loudly, the more distinguished frame. */}
      <div
        aria-hidden
        className="absolute inset-[1.7cqw]"
        style={{ border: `${isProgram ? '0.42cqw' : '0.18cqw'} solid ${DOC.gold}` }}
      />
      {isProgram && (
        <div
          aria-hidden
          className="absolute inset-[2.45cqw]"
          style={{ border: `0.07cqw solid ${DOC.goldSoft}` }}
        />
      )}
      <div
        aria-hidden
        className="absolute inset-[2.9cqw]"
        style={{ border: `0.07cqw solid ${DOC.navy}55` }}
      />
      {/* Four geometric corner marks on the inner frame — the only ornament,
          drawn with borders, echoing the logo's plain forms. */}
      {(
        [
          'top-[2.35cqw] start-[2.35cqw] border-t border-s',
          'top-[2.35cqw] end-[2.35cqw] border-t border-e',
          'bottom-[2.35cqw] start-[2.35cqw] border-b border-s',
          'bottom-[2.35cqw] end-[2.35cqw] border-b border-e',
        ] as const
      ).map((pos) => (
        <div
          key={pos}
          aria-hidden
          className={`absolute h-[3.4cqw] w-[3.4cqw] ${pos}`}
          style={{ borderColor: DOC.gold, borderWidth: '0.3cqw' }}
        />
      ))}

      {/* Watermark: the association's own mark, from the file — never
          redrawn. Light enough to sit under text in print and on screen. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 w-[34cqw] -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"
      />

      <div className="relative flex h-full flex-col px-[7cqw] py-[3.2cqw] text-center">
        {/* -------------------------------------------------- header --- */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.svg" alt="" className="mx-auto h-[5.4cqw] w-auto" />
          <p className="mt-[0.6cqw] text-[1.9cqw] font-bold leading-[1.3]" style={{ color: DOC.navy }}>
            {siteName}
          </p>
          <p className="mt-[0.1cqw] text-[1.1cqw] leading-[1.5]" style={{ color: DOC.slate }}>
            {t.registration} {ORG.registrationNumber}
          </p>
        </div>

        {/* --------------------------------------------------- title --- */}
        <div className="mt-[1.2cqw]">
          <h1
            className="text-[2.8cqw] font-extrabold leading-[1.25]"
            style={{ color: isProgram ? DOC.gold : DOC.navy }}
          >
            {doc.title}
          </h1>
          <p
            className={`mt-[0.2cqw] text-[1.25cqw] font-semibold leading-[1.4] ${other === 'en' ? 'uppercase' : ''}`}
            style={{ color: DOC.slate }}
            lang={other}
            dir={other === 'ar' ? 'rtl' : 'ltr'}
          >
            {docOther.title}
          </p>
          {isProgram && (
            <p
              className="mx-auto mt-[0.7cqw] inline-block rounded-full px-[1.8cqw] py-[0.25cqw] text-[1.2cqw] font-bold leading-[1.5]"
              style={{ border: `0.09cqw solid ${DOC.gold}`, color: DOC.gold, background: '#c07f1c14' }}
            >
              {t.programBadge}
            </p>
          )}
        </div>

        {/* ---------------------------------------------- recipient --- */}
        <div className="mt-auto pt-[1cqw]">
          <p className="text-[1.5cqw] leading-[1.5]" style={{ color: DOC.slate }}>
            {t.awardedTo}
          </p>
          {/* The most prominent element on the sheet, as an official
              certificate demands. Balanced wrapping keeps a long four-part
              Arabic name dignified rather than orphaning its last word. */}
          <p
            className="mx-auto mt-[0.3cqw] max-w-[76cqw] text-balance break-words text-[4.1cqw] font-extrabold leading-[1.25]"
            style={{ color: DOC.navy }}
          >
            {cert.fullName}
          </p>

          {/* The thin ornamental rule: gold, with a small diamond. */}
          <div aria-hidden className="mt-[1cqw] flex items-center justify-center gap-[0.8cqw]">
            <span className="h-px w-[13cqw]" style={{ background: DOC.goldSoft }} />
            <span className="h-[0.75cqw] w-[0.75cqw] rotate-45" style={{ background: DOC.gold }} />
            <span className="h-px w-[13cqw]" style={{ background: DOC.goldSoft }} />
          </div>

          <p className="mt-[0.8cqw] text-[1.15cqw] font-bold leading-[1.5]" style={{ color: DOC.slate }}>
            {KIND_LABEL[cert.kind]}
          </p>
          <p
            className="mx-auto mt-[0.2cqw] max-w-[70cqw] text-balance text-[2.2cqw] font-bold leading-[1.35]"
            style={{ color: DOC.navy }}
          >
            {cert.title}
          </p>
          <p
            className="mx-auto mt-[0.7cqw] max-w-[64cqw] text-[1.4cqw] leading-[1.6]"
            style={{ color: DOC.slate }}
          >
            {doc.body}
          </p>
        </div>

        {/* -------------------------------------------- bottom band --- */}
        <div className="mt-auto flex items-end justify-between gap-[3cqw] pt-[1.6cqw] text-start">
          {/* Signature — the president, from configuration (ORG), never
              hard-coded here. No signature image exists in the project, so
              the space above the line stays honestly empty, sized for a wet
              signature and the association stamp. */}
          <div className="w-[24cqw] text-center">
            {ORG.president.signatureImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={ORG.president.signatureImage} alt="" className="mx-auto h-[5cqw] w-auto" />
            ) : (
              <div aria-hidden className="h-[5cqw]" />
            )}
            <div className="h-px w-full" style={{ background: DOC.gold }} />
            <p className="mt-[0.5cqw] text-[1.5cqw] font-bold leading-[1.4]" style={{ color: DOC.navy }}>
              {presidentName}
            </p>
            <p className="text-[1.1cqw] leading-[1.5]" style={{ color: DOC.slate }}>
              {presidentTitle}
            </p>
          </div>

          {/* Facts — issue date, hours when the system has them. */}
          <div className="flex-1 self-end text-center">
            <div className="flex items-start justify-center gap-[4cqw]">
              <div>
                <p className="text-[1.05cqw] font-bold leading-[1.5]" style={{ color: DOC.slate }}>
                  {t.issuedOn}
                </p>
                <p className="text-[1.35cqw] font-bold leading-[1.5]" style={{ color: DOC.navy }}>
                  {cert.issued}
                </p>
              </div>
              {cert.learningTime && (
                <div>
                  <p className="text-[1.05cqw] font-bold leading-[1.5]" style={{ color: DOC.slate }}>
                    {t.learningTime}
                  </p>
                  <p className="text-[1.35cqw] font-bold leading-[1.5]" style={{ color: DOC.navy }}>
                    {cert.learningTime}
                  </p>
                </div>
              )}
              {cert.volunteerTime && (
                <div>
                  <p className="text-[1.05cqw] font-bold leading-[1.5]" style={{ color: DOC.slate }}>
                    {t.kindHours}
                  </p>
                  <p className="text-[1.35cqw] font-bold leading-[1.5]" style={{ color: DOC.navy }}>
                    {cert.volunteerTime}
                  </p>
                </div>
              )}
            </div>
            {/* The honest claim, on the document itself: completion, issued
                by the association. Never "accredited". */}
            <p className="mt-[1cqw] text-[1.05cqw] leading-[1.5]" style={{ color: DOC.slate }}>
              {t.completionOnly}
            </p>
            <p className="mt-[0.1cqw] text-[0.95cqw] font-semibold leading-[1.5]" style={{ color: DOC.gold }}>
              {t.verifiedMark}
            </p>
          </div>

          {/* Verification — QR, code, the short host. The full URL lives in
              the QR only. */}
          <div className="w-[24cqw] text-center">
            <div
              className="mx-auto h-[8.6cqw] w-[8.6cqw] [&>svg]:h-full [&>svg]:w-full"
              aria-hidden
              dangerouslySetInnerHTML={{ __html: qr }}
            />
            <p
              className="mt-[0.5cqw] font-mono text-[1.1cqw] font-bold leading-[1.5]"
              style={{ color: DOC.navy }}
              dir="ltr"
            >
              {cert.code}
            </p>
            <p className="mt-[0.1cqw] text-[0.9cqw] leading-[1.5]" style={{ color: DOC.slate }}>
              {t.scanQr}
            </p>
            <p className="text-[0.9cqw] font-semibold leading-[1.5]" style={{ color: DOC.slate }} dir="ltr">
              {verifyHost}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
