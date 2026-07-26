-- UP Migration: 013_performance_indexes.sql

-- 1. Index for job searches and status lookups
CREATE INDEX IF NOT EXISTS idx_jobs_status_posted ON jobs (status, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_trade ON jobs (trade);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs (location);

-- 2. Indexes for N+1 query elimination on job applications & users
CREATE INDEX IF NOT EXISTS idx_job_applications_composite ON job_applications (job_id, applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users (role, status);

-- 3. Indexes for advertisement serving & metrics aggregations
CREATE INDEX IF NOT EXISTS idx_ads_active_serving ON advertisements (status, is_active, priority, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ad_views_ad_id ON advertisement_views (advertisement_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_id ON advertisement_clicks (advertisement_id);

-- 4. Session cleanup & Auth Token validation performance index
CREATE INDEX IF NOT EXISTS idx_sessions_user_revoked ON sessions (user_id, revoked, expires_at);
