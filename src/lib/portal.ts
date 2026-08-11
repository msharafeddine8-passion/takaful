import 'server-only';
import { query, queryOne } from './db';
import { journeyFor, type JourneyView } from './journey';
import { verifiedMinutes, pendingMinutes } from './hours';
import { unreadCount } from './notify';
import { COURSES } from './courses';

/**
 * Everything the portal home needs, gathered once.
 *
 * The home page's job is to answer "what should I do next?" in one glance.
 * Everything else on it is context for that answer, so the summary is
 * deliberately small: four figures, one upcoming activity, one course in
 * progress. Fifteen cards is a page someone closes.
 */

export type PortalSummary = {
  verifiedMinutes: number;
  pendingMinutes: number;
  coursesPassed: number;
  coursesTotal: number;
  coursesInProgress: { slug: string; score: number | null } | null;
  activitiesAttended: number;
  certificates: number;
  unreadNotifications: number;
  nextActivity: {
    id: string;
    title_ar: string;
    title_en: string;
    starts_at: Date | null;
    location: string | null;
  } | null;
  latestCertificateCode: string | null;
  journey: JourneyView | null;
};

export async function portalSummary(userId: string): Promise<PortalSummary> {
  const [
    verified, pending, courses, activities, certs, unread, nextActivity, latestCert, journey,
  ] = await Promise.all([
    verifiedMinutes(userId),
    pendingMinutes(userId),
    query<{ course_slug: string; passed: boolean; score: number | null }>(
      'SELECT course_slug, passed, score FROM course_progress WHERE user_id = $1',
      [userId],
    ),
    queryOne<{ n: string }>(
      `SELECT count(*) AS n FROM activity_attendance WHERE user_id = $1 AND attended`,
      [userId],
    ),
    queryOne<{ n: string }>(
      'SELECT count(*) AS n FROM certificates WHERE user_id = $1 AND revoked_at IS NULL',
      [userId],
    ),
    unreadCount(userId),
    queryOne<{
      id: string; title_ar: string; title_en: string;
      starts_at: Date | null; location: string | null;
    }>(
      `SELECT a.id, a.title_ar, a.title_en, a.starts_at, a.location
         FROM activity_registrations r
         JOIN activities a ON a.id = r.activity_id
        WHERE r.user_id = $1
          AND r.status <> 'cancelled'
          AND (a.starts_at IS NULL OR a.starts_at > now())
        ORDER BY a.starts_at ASC NULLS LAST
        LIMIT 1`,
      [userId],
    ),
    queryOne<{ code: string }>(
      `SELECT code FROM certificates
        WHERE user_id = $1 AND revoked_at IS NULL
        ORDER BY issued_at DESC LIMIT 1`,
      [userId],
    ),
    journeyFor(userId),
  ]);

  const passed = courses.filter((c) => c.passed);
  // Started but not passed - the one to offer as "continue learning".
  const started = courses.find((c) => !c.passed);

  return {
    verifiedMinutes: verified,
    pendingMinutes: pending,
    coursesPassed: passed.length,
    coursesTotal: COURSES.filter((c) => c.status === 'available').length,
    coursesInProgress: started ? { slug: started.course_slug, score: started.score } : null,
    activitiesAttended: Number.parseInt(activities?.n ?? '0', 10),
    certificates: Number.parseInt(certs?.n ?? '0', 10),
    unreadNotifications: unread,
    nextActivity: nextActivity ?? null,
    latestCertificateCode: latestCert?.code ?? null,
    journey,
  };
}
