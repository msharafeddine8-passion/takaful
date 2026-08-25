import { NextResponse } from 'next/server';
import { runBirthdays } from '@/lib/milestones-data';
import { isDbConfigured } from '@/lib/db';

/**
 * The one thing on this platform that has to happen on a day whether or not
 * anybody opens it.
 *
 * Birthday greetings were sent by runBirthdays() during a render of the
 * account dashboard, which is a reasonable trick and mostly works: with a few
 * dozen active volunteers somebody usually signs in. Mostly is the problem. If
 * nobody opens the platform on the 3rd of March, the person whose birthday it
 * is gets nothing that year — and it is a feature whose entire promise is that
 * the association noticed. A quiet weekend is enough to break it, and nothing
 * anywhere would report that it had.
 *
 * So the render-time call stays, because it costs nothing and covers the day
 * this job fails, and this exists so the promise does not depend on traffic.
 *
 * WHY THE SCHEDULE IS 06:00 UTC. Vercel's cron runs in UTC and Beirut is two
 * or three hours ahead depending on the season, so this fires at 08:00 or
 * 09:00 local — morning either way, and never the day before. Anything closer
 * to midnight UTC would land the greeting on the wrong calendar day for half
 * the year, which for a birthday message is the whole point missed.
 *
 * WHAT IT IS NOT. It is not a general job runner and should not become one.
 * Everything else here is derived on read, deliberately, and a cron that
 * recomputes things is a cron that can disagree with the page.
 */

/* No caching layer anywhere near this: a cached cron response is a cron that
 * runs once and reports success forever. */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  /*
   * Vercel signs its cron requests with CRON_SECRET. Without this check the
   * route is a public URL that anybody can hit — which is harmless here today,
   * since the work is idempotent and writes only what is already owed, but a
   * job endpoint that is open on the day somebody adds a second job to it is a
   * problem shipped in advance.
   *
   * If the secret is not configured the route refuses rather than running
   * unguarded, and says which is which: a 503 for "not set up" and a 401 for
   * "not you" are different faults and a deployment needs to tell them apart.
   */
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET is not set' }, { status: 503 });
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'no database' }, { status: 503 });
  }

  /*
   * runBirthdays is idempotent — birthday_greetings_sent has a unique key on
   * (user_id, greeting_year) and the insert is ON CONFLICT DO NOTHING — so a
   * retry after a timeout, or an overlap with a dashboard render, sends
   * nobody a second message.
   */
  /*
   * The empty viewerId is the point. runBirthdays takes the id of whoever is
   * looking so it can leave that person out of the list of names it hands back
   * — nobody wants to be told it is their own birthday. A cron has no viewer,
   * and passing a real id would quietly exclude somebody from a list this
   * route then throws away anyway.
   *
   * Only the greetings matter here. The names are counted and discarded; the
   * banner is drawn by the dashboard, from its own call, for the person
   * actually reading it.
   */
  const { names } = await runBirthdays('');

  /*
   * The count, never the names. This response goes into a platform log that is
   * kept for weeks and read by whoever is debugging something unrelated, and
   * "we greeted 2 people" is all it has to say. A list of who has a birthday
   * today is a list of dates of birth, one day at a time.
   */
  return NextResponse.json({ greeted: names.length });
}
