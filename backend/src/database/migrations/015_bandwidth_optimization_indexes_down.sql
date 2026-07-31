-- DOWN Migration: 015_bandwidth_optimization_indexes.sql

DROP INDEX IF EXISTS idx_jobs_employer_id;
DROP INDEX IF EXISTS idx_job_applications_user_id;
DROP INDEX IF EXISTS idx_saved_jobs_user_id;
DROP INDEX IF EXISTS idx_support_tickets_user_id;
DROP INDEX IF EXISTS idx_in_app_notifications_user_unread;
DROP INDEX IF EXISTS idx_sessions_token;
DROP INDEX IF EXISTS idx_jobs_lat_lng;
