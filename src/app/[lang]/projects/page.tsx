import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, SectionHead } from '@/components/ui';

export async function generateMetadata(props: PageProps<'/[lang]/projects'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.nav.projects, description: dict.projects.lede, alternates: alternatesFor(lang, '/projects') };
}

export default async function ProjectsPage(props: PageProps<'/[lang]/projects'>) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <Section>
      <Container>
        <SectionHead
          kicker={dict.projects.kicker}
          title={dict.projects.title}
          lede={dict.projects.lede}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {dict.projects.items.map((p) => {
            const soon = p.status === 'soon';
            return (
              <article
                key={p.name}
                className={`relative flex flex-col gap-3 rounded-2xl border p-7 transition-colors ${
                  soon
                    ? 'border-dashed border-line bg-surface/60'
                    : 'border-line bg-surface hover:border-brand-orange'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[0.82rem] font-extrabold tracking-[0.13em] text-brand-blue dark:text-sky-300">
                    {p.tag}
                  </span>
                  {soon && (
                    <span className="shrink-0 rounded-full bg-brand-orange px-3 py-1 text-[0.82rem] font-extrabold text-[#241503]">
                      {dict.projects.comingSoon}
                    </span>
                  )}
                </div>

                <h2
                  className={`text-[clamp(1.4rem,1.1rem+1vw,1.9rem)] font-extrabold tracking-tight ${
                    soon ? 'text-ink-2' : ''
                  }`}
                >
                  {p.name}
                </h2>

                <p className={`text-[0.95rem] leading-relaxed ${soon ? 'text-ink-3' : 'text-ink-2'}`}>
                  {p.text}
                </p>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
