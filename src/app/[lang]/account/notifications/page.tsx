import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary, type Dictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { notificationsFor, markAllRead, type Notification } from '@/lib/notify';
import { emptyStates } from '@/lib/dictionaries/empty-states';

export async function generateMetadata(props: PageProps<'/[lang]/account/notifications'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.notifications.title,
    alternates: alternatesFor(lang, '/account/notifications'),
    robots: { index: false, follow: false },
  };
}

async function markReadAction(formData: FormData): Promise<void> {
  'use server';
  const user = await currentUser();
  if (user) await markAllRead(user.id);
  const lang = String(formData.get('lang') ?? 'ar');
  redirect(`/${lang}/account/notifications`);
}

export default async function NotificationsPage(props: PageProps<'/[lang]/account/notifications'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.notifications;

  if (!isDbConfigured()) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {dict.account.errors.dbUnavailable}
        </p>
      </Container></Section>
    );
  }

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);

  const items = await notificationsFor(user.id);
  const unread = items.filter((n) => !n.read_at).length;

  return (
    <Section>
      <Container className="max-w-2xl">
        <Kicker>{dict.account.dashboard.kicker}</Kicker>
        <div className="mt-2.5 flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
            {t.title}
          </h1>
          {unread > 0 && (
            <form action={markReadAction}>
              <input type="hidden" name="lang" value={lang} />
              <button type="submit" className="text-[0.9rem] font-bold text-brand-blue hover:underline dark:text-brand-orange">
                {t.markAllRead}
              </button>
            </form>
          )}
        </div>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        {items.length === 0 ? (
          /* «لا إشعارات بعد» is a measurement. This names the four things that
             actually arrive here, which is also the answer to the question
             somebody with an empty bell is really asking: whether this page
             does anything. No link — there is nowhere to go to be notified. */
          <p className="mt-8 max-w-[70ch] rounded-xl border border-line bg-surface-2 px-5 py-4 leading-relaxed text-ink-2">
            {emptyStates(lang).notifications.never}
          </p>
        ) : (
          <ul className="mt-8 space-y-3">
            {items.map((n) => (
              <NotificationRow key={n.id} n={n} lang={lang} dict={dict} />
            ))}
          </ul>
        )}

        <Link
          href={`/${lang}/account`}
          className="mt-9 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          {dict.account.hours.backToAccount}
        </Link>
      </Container>
    </Section>
  );
}

function NotificationRow({ n, lang, dict }: { n: Notification; lang: Locale; dict: Dictionary }) {
  const t = dict.account.notifications;
  const title = lang === 'ar' ? n.title_ar : n.title_en;
  const body = lang === 'ar' ? n.body_ar : n.body_en;
  const unread = !n.read_at;

  const inner = (
    <>
      <div className="flex items-start gap-3">
        {unread && (
          <span
            aria-label={t.unread}
            className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-orange"
          />
        )}
        <div className={unread ? '' : 'ps-5'}>
          <p className={`text-[1rem] ${unread ? 'font-extrabold' : 'font-bold text-ink-2'}`}>
            {title}
          </p>
          {body && (
            <p className="mt-1.5 whitespace-pre-line text-[0.94rem] leading-relaxed text-ink-2">
              {body}
            </p>
          )}
          <p className="mt-2 text-[0.82rem] text-ink-3">{ago(n.created_at, dict)}</p>
        </div>
      </div>
    </>
  );

  return (
    <li className={`rounded-2xl border p-5 ${unread ? 'border-brand-orange/50 bg-brand-orange/5' : 'border-line bg-surface'}`}>
      {n.link ? (
        <Link href={`/${lang}${n.link}` as Parameters<typeof Link>[0]['href']} className="block">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </li>
  );
}

/** Relative time, because "3 hours ago" is read faster than a timestamp. */
function ago(when: Date, dict: Dictionary): string {
  const t = dict.account.notifications;
  const minutes = Math.floor((Date.now() - new Date(when).getTime()) / 60_000);
  if (minutes < 2) return t.justNow;
  if (minutes < 60) return t.minutesAgo.replace('{n}', String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t.hoursAgo.replace('{n}', String(hours));
  return t.daysAgo.replace('{n}', String(Math.floor(hours / 24)));
}
