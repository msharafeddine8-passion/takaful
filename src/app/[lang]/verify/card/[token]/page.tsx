import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { Container, Section, Kicker } from '@/components/ui';
import { isDbConfigured } from '@/lib/db';
import { findCardByToken } from '@/lib/certificates';
import { toPublicCard, type PublicCard } from '@/lib/card-view';

/**
 * Somebody has scanned a membership card and wants to know whether it is real.
 *
 * That is the entire question, and this page answers exactly it. Everything
 * rendered here comes out of toPublicCard, which builds its object from an
 * allowlist — so the birth date, the guardian, the emergency contact and the
 * medical notes are not hidden by the template, they were never put in the
 * object the template receives. "The page does not print it" and "it never
 * left the server" are different guarantees and only the second one holds.
 *
 * A card that is not genuine gets a plain "we cannot confirm this" with no
 * explanation. Saying *why* — suspended, expired, never existed — would tell a
 * stranger something about a volunteer that the association has not chosen to
 * say, and would turn this page into an oracle for anybody with a list of
 * tokens to test.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/verify/card/[token]'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.card.verifyTitle,
    // Never indexed. A search engine holding a page of "this card belongs to
    // <name>" is the leak arriving by a different route.
    robots: { index: false, follow: false },
  };
}

export default async function VerifyCardPage(props: PageProps<'/[lang]/verify/card/[token]'>) {
  await connection();
  const { lang, token } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.card;

  const row = isDbConfigured() ? await findCardByToken(token) : null;
  const card: PublicCard = toPublicCard(row);
  const genuine = card.status === 'active' || card.status === 'inactive';

  return (
    <Section>
      <Container className="max-w-lg">
        <Kicker>{dict.meta.siteName}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.5rem,1.2rem+1.4vw,2.1rem)] font-extrabold tracking-tight">
          {t.verifyTitle}
        </h1>

        <div
          className={`mt-7 rounded-2xl border-2 p-6 ${
            genuine ? 'border-ok bg-ok/10' : 'border-line bg-surface-2'
          }`}
        >
          {/* Icon and words together — a green box alone is not a message to
              somebody who cannot see the colour. */}
          <p className="text-[1.08rem] font-extrabold">
            <span aria-hidden className="me-2">{genuine ? '✓' : '—'}</span>
            {genuine ? t.verifyValid : t.verifyUnknown}
          </p>

          {genuine ? (
            <dl className="mt-5 space-y-2.5 text-[0.96rem]">
              {card.fullName && <Row label={t.holder} value={card.fullName} />}
              {card.memberNumber && <Row label={t.memberNumber} value={card.memberNumber} ltr />}
              {card.stageLabel && <Row label={t.stage} value={card.stageLabel} />}
              {card.memberSince && <Row label={t.memberSince} value={card.memberSince} ltr />}
              <Row
                label={t.statusLabel}
                value={card.status === 'active' ? t.statusActive : t.statusInactive}
              />
              {card.updated && <Row label={t.updatedLabel} value={card.updated} ltr />}
            </dl>
          ) : (
            <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-2">{t.verifyUnknownBody}</p>
          )}
        </div>

        <p className="mt-6 text-[0.9rem] leading-relaxed text-ink-3">{t.verifyFooter}</p>
      </Container>
    </Section>
  );
}

function Row({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex flex-wrap gap-x-2">
      <dt className="font-bold text-ink-3">{label}:</dt>
      <dd className="font-bold" dir={ltr ? 'ltr' : undefined}>{value}</dd>
    </div>
  );
}
