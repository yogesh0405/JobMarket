-- UP Migration: 015_bandwidth_optimization_indexes.sql

-- 1. Employer Job Queries
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs (employer_id);

-- 2. User Application Lookups & Saved Jobs
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications (user_id, applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs (user_id, created_at DESC);

-- 3. Support Tickets & Notifications
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets (user_id, last_reply_at DESC);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user_unread ON in_app_notifications (user_id, is_read, created_at DESC);

-- 4. Session Validation Token Lookup Index
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (refresh_token_hash) WHERE revoked = FALSE;

-- 5. Spatial Coordinate Index for Approved Jobs Map Queries
CREATE INDEX IF NOT EXISTS idx_jobs_lat_lng ON jobs (latitude, longitude) WHERE status = 'APPROVED';
