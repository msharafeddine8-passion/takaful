import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Button, Container, Section, SectionHead } from '@/components/ui';
import { ORG } from '@/lib/org';

export async function generateMetadata(props: PageProps<'/[lang]/contact'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.nav.contact, description: dict.contact.lede, alternates: alternatesFor(lang, '/contact') };
}

export default async function ContactPage(props: PageProps<'/[lang]/contact'>) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <Section>
      <Container>
        <SectionHead
          kicker={dict.contact.kicker}
          title={dict.contact.title}
          lede={dict.contact.lede}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-line bg-surface p-6">
            <h2 className="mb-2 text-[0.78rem] font-bold tracking-[0.13em] text-ink-3">
              {dict.contact.phone}
            </h2>
            <a
              href={ORG.phoneHref}
              dir="ltr"
              className="block text-[1.05rem] font-extrabold hover:text-brand-orange-text dark:hover:text-brand-orange"
            >
              {ORG.phone}
            </a>
            <a
              href={ORG.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-block text-[0.85rem] font-semibold text-brand-blue dark:text-sky-300"
            >
              WhatsApp
            </a>
          </div>

          <div className="rounded-xl border border-line bg-surface p-6">
            <h2 className="mb-2 text-[0.78rem] font-bold tracking-[0.13em] text-ink-3">
              {dict.contact.address}
            </h2>
            <p className="text-[0.98rem] font-semibold leading-relaxed">
              {dict.contact.addressValue}
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-6">
            <h2 className="mb-2 text-[0.78rem] font-bold tracking-[0.13em] text-ink-3">
              {dict.contact.email}
            </h2>
            <a
              href={ORG.emailHref}
              dir="ltr"
              className="block text-[0.98rem] font-extrabold break-all hover:text-brand-orange-text dark:hover:text-brand-orange"
            >
              {ORG.email}
            </a>
          </div>

          <div className="rounded-xl border border-line bg-surface p-6">
            <h2 className="mb-2 text-[0.78rem] font-bold tracking-[0.13em] text-ink-3">
              {dict.contact.social}
            </h2>
            <a
              href={ORG.instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="block text-[0.98rem] font-extrabold hover:text-brand-orange-text dark:hover:text-brand-orange"
            >
              Instagram
            </a>
            <a
              href={ORG.facebookHref}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="mt-1 block text-[0.98rem] font-extrabold hover:text-brand-orange-text dark:hover:text-brand-orange"
            >
              Facebook
            </a>
          </div>

          <div className="rounded-xl border border-line bg-surface p-6">
            <h2 className="mb-2 text-[0.78rem] font-bold tracking-[0.13em] text-ink-3">
              {dict.contact.registration}
            </h2>
            <p className="text-[0.98rem] font-extrabold">{dict.contact.registrationValue}</p>
            <p className="tabular mt-1 text-[0.95rem] font-extrabold text-brand-blue dark:text-sky-300">
              {lang === 'ar' ? 'رقم ' : 'No. '}
              {ORG.registrationNumber}
            </p>
          </div>
        </div>

        <div className="mt-9 flex flex-wrap gap-3">
          <Button href={`/${lang}/join`}>{dict.contact.ctaVolunteer}</Button>
          <Button href={ORG.phoneHref} variant="blue">
            {dict.contact.ctaPartner}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
