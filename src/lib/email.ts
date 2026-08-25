import 'server-only';
import { randomUUID } from 'node:crypto';
import { execute } from './db';

/**
 * Sending email.
 *
 * Every send is recorded in email_deliveries first, whether or not a provider
 * is configured, so "was this person actually told?" has an answer that does
 * not depend on a provider's dashboard.
 *
 * There is deliberately no queue worker and no retry loop. This project has no
 * scheduler, and a queue nothing drains is worse than no queue: it looks like
 * the message went out. A send either happens during the request or is
 * recorded as not having happened.
 *
 * The provider is Resend, over plain HTTP, because it needs no dependency and
 * no long-lived connection — both of which matter on a platform that freezes
 * a function the moment it returns a response. Configure RESEND_API_KEY and
 * EMAIL_FROM to turn sending on. Without them nothing is sent and every
 * attempt is recorded as skipped, which is the honest state rather than a
 * silent success.
 *
 * A skip and a failure are also written to the log, not only to the table.
 * The row is the record; the log line is what somebody sees when they go
 * looking because a reset link never arrived, and the first place anybody
 * looks is the platform log rather than a table they would have to query.
 * Neither line carries the address — the delivery id is enough to find the
 * row, and a log is a worse place to keep a volunteer's email than a table
 * with access control on it.
 */

const API = 'https://api.resend.com/emails';
/** A slow provider must not hold a sign-up form open. */
const TIMEOUT_MS = 8_000;

/**
 * Both, or neither. A key with no from-address fails at the provider with a
 * validation error, and a from-address with no key fails at the first
 * request — so half-configured is not a state worth having.
 *
 * Trimmed because an environment variable set to an empty string is set as
 * far as `process.env` is concerned, and a blank key would turn a clear
 * "not configured" into a 401 from Resend.
 */
export function isEmailConfigured(): boolean {
  return (
    (process.env.RESEND_API_KEY ?? '').trim().length > 0 &&
    (process.env.EMAIL_FROM ?? '').trim().length > 0
  );
}

export type SendInput = {
  userId: string;
  to: string;
  subject: string;
  /** Plain text. Every client renders it, and none of it can leak a tracker. */
  text: string;
  notificationId?: string;
};

export type SendResult = { sent: boolean; reason?: 'not_configured' | 'failed' };

export async function sendEmail(input: SendInput): Promise<SendResult> {
  const id = randomUUID();

  await execute(
    `INSERT INTO email_deliveries (id, notification_id, user_id, to_email, subject, status)
     VALUES ($1, $2, $3, $4, $5, 'queued')`,
    [id, input.notificationId ?? null, input.userId, input.to, input.subject],
  );

  if (!isEmailConfigured()) {
    const reason = 'No email provider is configured (RESEND_API_KEY, EMAIL_FROM).';
    await execute(
      `UPDATE email_deliveries SET status = 'skipped', last_error = $2 WHERE id = $1`,
      [id, reason],
    );
    console.error(`[email] not sent, delivery ${id}: ${reason}`);
    return { sent: false, reason: 'not_configured' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(API, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
    });

    if (!response.ok) {
      // The body can carry the address back; the status and a short reason are
      // enough to diagnose and do not turn the log into a mailing list.
      const detail = (await response.text()).slice(0, 300);
      await execute(
        `UPDATE email_deliveries
            SET status = 'failed', attempts = attempts + 1, last_error = $2
          WHERE id = $1`,
        [id, `${response.status}: ${detail}`],
      );
      console.error(`[email] provider refused, delivery ${id}: ${response.status} ${detail}`);
      return { sent: false, reason: 'failed' };
    }

    await execute(
      `UPDATE email_deliveries
          SET status = 'sent', sent_at = now(), attempts = attempts + 1
        WHERE id = $1`,
      [id],
    );
    return { sent: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await execute(
      `UPDATE email_deliveries
          SET status = 'failed', attempts = attempts + 1, last_error = $2
        WHERE id = $1`,
      [id, message.slice(0, 300)],
    );
    console.error(`[email] send threw, delivery ${id}: ${message.slice(0, 300)}`);
    return { sent: false, reason: 'failed' };
  } finally {
    clearTimeout(timer);
  }
}
