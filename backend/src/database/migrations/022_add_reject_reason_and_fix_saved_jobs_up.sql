-- UP Migration: 022_add_reject_reason_and_fix_saved_jobs.sql

-- 1. Add reject_reason column to job_applications table if it doesn't exist
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS reject_reason TEXT;

-- 2. Clean up non-UUID invalid mock/fallback job_id entries from saved_jobs
DELETE FROM saved_jobs 
WHERE job_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 3. Convert saved_jobs.job_id column to UUID type to match jobs.id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'saved_jobs' 
          AND column_name = 'job_id' 
          AND data_type = 'character varying'
    ) THEN
        ALTER TABLE saved_jobs ALTER COLUMN job_id TYPE UUID USING job_id::uuid;
    END IF;
END $$;
