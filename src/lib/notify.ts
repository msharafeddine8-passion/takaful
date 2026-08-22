import 'server-only';
import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { query, queryOne, execute } from './db';

/**
 * Telling people what happened to them.
 *
 * Architecture decision 8: the in-app notification is the source of truth and
 * is written in the same transaction as the event. Email is a copy, queued
 * separately, and a failure to send never undoes the thing that happened.
 *
 * Both languages are stored at the moment of writing rather than a key
 * resolved on read. What someone was told in March should still say the same
 * thing in June, even if the wording was edited in between.
 */

export type NotificationKind =
  | 'application.accepted' | 'application.waitlisted' | 'application.rejected'
  | 'hours.verified' | 'hours.rejected' | 'hours.corrected'
  | 'stage.unlocked' | 'stage.completed'
  | 'certificate.issued'
  | 'activity.reminder' | 'activity.registered' | 'activity.attended'
  // An activity published without a date has been given one, and the people
  // who asked to be told are being told. Sent once — see migration 028.
  | 'activity.scheduled'
  | 'course.available' | 'account.welcome';

export type Notification = {
  id: string;
  kind: NotificationKind;
  title_ar: string;
  title_en: string;
  body_ar: string | null;
  body_en: string | null;
  link: string | null;
  read_at: Date | null;
  created_at: Date;
};

type NotifyInput = {
  userId: string;
  kind: NotificationKind;
  titleAr: string;
  titleEn: string;
  bodyAr?: string;
  bodyEn?: string;
  /** Relative path, so it survives the site moving domain. */
  link?: string;
};

/**
 * These are never muted. Being told your application was decided, or that your
 * hours were rejected, is not a newsletter — someone who opted out of
 * announcements has not opted out of being told what happened to them.
 */
const ALWAYS_SEND: NotificationKind[] = [
  'application.accepted', 'application.waitlisted', 'application.rejected',
  'hours.rejected', 'hours.corrected', 'stage.unlocked', 'certificate.issued',
];

/**
 * Writes a notification inside a caller's transaction.
 *
 * Pass the client when the notification must live or die with the event —
 * which is almost always. A decision recorded without the person being told
 * is how someone waits three weeks for an answer that was given on day one.
 */
export async function notifyIn(client: PoolClient, input: NotifyInput): Promise<void> {
  if (!ALWAYS_SEND.includes(input.kind)) {
    const { rows } = await client.query<{ muted: string[] }>(
      'SELECT muted_kinds AS muted FROM notification_preferences WHERE user_id = $1',
      [input.userId],
    );
    if (rows[0]?.muted?.includes(input.kind)) return;
  }

  await client.query(
    `INSERT INTO notifications (id, user_id, kind, title_ar, title_en, body_ar, body_en, link)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      randomUUID(), input.userId, input.kind,
      input.titleAr, input.titleEn,
      input.bodyAr ?? null, input.bodyEn ?? null,
      input.link ?? null,
    ],
  );
}

/** Same thing outside a transaction, for events that stand alone. */
export async function notify(input: NotifyInput): Promise<void> {
  if (!ALWAYS_SEND.includes(input.kind)) {
    const pref = await queryOne<{ muted: string[] }>(
      'SELECT muted_kinds AS muted FROM notification_preferences WHERE user_id = $1',
      [input.userId],
    );
    if (pref?.muted?.includes(input.kind)) return;
  }

  await execute(
    `INSERT INTO notifications (id, user_id, kind, title_ar, title_en, body_ar, body_en, link)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      randomUUID(), input.userId, input.kind,
      input.titleAr, input.titleEn,
      input.bodyAr ?? null, input.bodyEn ?? null,
      input.link ?? null,
    ],
  );
}

export async function unreadCount(userId: string): Promise<number> {
  const row = await queryOne<{ n: string }>(
    'SELECT count(*) AS n FROM notifications WHERE user_id = $1 AND read_at IS NULL',
    [userId],
  );
  return Number.parseInt(row?.n ?? '0', 10);
}

export async function notificationsFor(userId: string, limit = 50): Promise<Notification[]> {
  return query<Notification>(
    `SELECT id, kind, title_ar, title_en, body_ar, body_en, link, read_at, created_at
       FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2`,
    [userId, limit],
  );
}

/**
 * Marks everything read. Deliberately not per-item on open: a list someone
 * scrolled past is a list they have seen, and making them dismiss each one is
 * work the software should be doing.
 */
export async function markAllRead(userId: string): Promise<void> {
  await execute(
    'UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL',
    [userId],
  );
}
