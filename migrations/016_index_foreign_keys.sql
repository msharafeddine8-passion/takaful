-- 016: index the foreign keys that had nothing behind them.
--
-- Found by a read-only audit: twenty foreign keys had no index on the
-- referencing column. Postgres creates one for the referenced side and not for
-- this one, so every DELETE from users had to scan each of these tables in
-- full, holding a lock while it did. Invisible with one account; painful at a
-- few thousand.
--
-- Only the columns that point at somebody else. A column that points at the
-- row's own subject — hour_entries.user_id, notifications.user_id — is already
-- covered by an index the queries use.
--
-- Written as plain CREATE INDEX rather than CONCURRENTLY: the runner wraps
-- each migration in a transaction, and CONCURRENTLY cannot run inside one.
-- These tables are small enough that the brief lock costs nothing; if that
-- stops being true, this migration is the wrong shape and the indexes should
-- be created by hand, outside a transaction, one at a time.

CREATE INDEX IF NOT EXISTS idx_user_roles_granted_by ON user_roles (granted_by);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_by ON membership_status_history (changed_by);
CREATE INDEX IF NOT EXISTS idx_applications_decided_by ON volunteer_applications (decided_by);
CREATE INDEX IF NOT EXISTS idx_applications_previous ON volunteer_applications (previous_application_id);
CREATE INDEX IF NOT EXISTS idx_activities_led_by ON activities (led_by);
CREATE INDEX IF NOT EXISTS idx_activities_created_by ON activities (created_by);
CREATE INDEX IF NOT EXISTS idx_hour_entries_verified_by ON hour_entries (verified_by);
CREATE INDEX IF NOT EXISTS idx_stage_progress_awarded_by ON stage_progress (awarded_by);
CREATE INDEX IF NOT EXISTS idx_journey_versions_created_by ON journey_versions (created_by);
CREATE INDEX IF NOT EXISTS idx_req_progress_requirement ON stage_requirement_progress (requirement_id);
CREATE INDEX IF NOT EXISTS idx_req_progress_confirmed_by ON stage_requirement_progress (confirmed_by);
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_by ON user_journey_assignments (assigned_by);
CREATE INDEX IF NOT EXISTS idx_assignments_version ON user_journey_assignments (version_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON activity_attendance (user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_confirmed_by ON activity_attendance (confirmed_by);
CREATE INDEX IF NOT EXISTS idx_attendance_hour_entry ON activity_attendance (hour_entry_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_notification ON email_deliveries (notification_id);

/*
 * Deliberately not here: dropping the nine tables in the neon_auth schema.
 *
 * The audit first reported them as strays of unknown provenance, because a
 * count by table name showed them next to this application's own. They are
 * not strays. They belong to Neon Auth, a managed feature of the database
 * provider, and they live in their own schema — `public` contains only this
 * application's 33 tables. Nothing was wrong, and nothing needed removing.
 */
