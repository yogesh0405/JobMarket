-- UP Migration: 025_scalability_indexes_and_sequences.sql

-- 1. Ensure all extended user profile columns exist permanently
ALTER TABLE users ADD COLUMN IF NOT EXISTS headline VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS midc_zone VARCHAR(150);
ALTER TABLE users ALTER COLUMN profile_picture_url TYPE TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_resume_public BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_two_factor_enabled BOOLEAN DEFAULT FALSE;

-- 2. Ensure all extended notification columns exist permanently
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_id VARCHAR(255);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data JSONB;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- 3. Ensure all extended job columns exist permanently
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS education_requirement VARCHAR(255) DEFAULT '10th Pass';

-- 4. High-Performance B-Tree Scalability Indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_user_status_applied ON job_applications (user_id, status, applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_status ON job_applications (job_id, status);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_created ON saved_jobs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON notifications (user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_companies_employer ON companies (employer_id);
CREATE INDEX IF NOT EXISTS idx_companies_name_lower ON companies (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_jobs_company_lower ON jobs (LOWER(company));

-- 5. Support Ticket Sequence for High-Throughput Ticket Creation
CREATE SEQUENCE IF NOT EXISTS support_ticket_seq START WITH 1001 INCREMENT BY 1;
