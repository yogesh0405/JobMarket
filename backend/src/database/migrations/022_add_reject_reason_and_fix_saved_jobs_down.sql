-- DOWN Migration: 022_add_reject_reason_and_fix_saved_jobs.sql

ALTER TABLE job_applications DROP COLUMN IF NOT EXISTS reject_reason;
ALTER TABLE saved_jobs ALTER COLUMN job_id TYPE VARCHAR(255) USING job_id::text;
