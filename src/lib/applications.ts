import 'server-only';
import { query } from './db';

/**
 * Reading the volunteer application queue.
 *
 * Note what this does NOT select: phone numbers, dates of birth, emergency
 * contacts. Those live in profiles_sensitive and a reviewer deciding on an
 * application has no need of them. The age is computed in SQL so a reviewer
 * can apply the under-18 rules without the birth date itself leaving the
 * database.
 */

export type QueuedApplication = {
  id: string;
  user_id: string;
  status: string;
  full_name: string;
  submitted_at: Date | null;
  motivation: string | null;
  availability: string | null;
  interests: string | null;
  experience: string | null;
  city: string | null;
  age: number | null;
  guardian_name: string | null;
  guardian_relation: string | null;
};

const OPEN = ['submitted', 'under_review', 'interview_required', 'interview_scheduled'];

export async function queuedApplications(limit = 50): Promise<QueuedApplication[]> {
  return query<QueuedApplication>(
    `SELECT va.id, va.user_id, va.status, p.full_name, va.submitted_at,
            va.motivation, va.availability, va.interests, va.experience,
            ps.city,
            CASE WHEN ps.date_of_birth IS NULL THEN NULL
                 ELSE EXTRACT(YEAR FROM age(ps.date_of_birth))::INT
            END AS age,
            gc.guardian_name, gc.guardian_relation
       FROM volunteer_applications va
       JOIN profiles p ON p.user_id = va.user_id
       LEFT JOIN profiles_sensitive ps ON ps.user_id = va.user_id
       LEFT JOIN LATERAL (
         SELECT guardian_name, guardian_relation
           FROM guardian_consents
          WHERE minor_user_id = va.user_id AND withdrawn_at IS NULL
          ORDER BY granted_at DESC
          LIMIT 1
       ) gc ON true
      WHERE va.status = ANY($1)
      ORDER BY va.submitted_at ASC NULLS LAST
      LIMIT $2`,
    [OPEN, limit],
  );
}
