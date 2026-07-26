-- DOWN Migration: 013_performance_indexes.sql

DROP INDEX IF EXISTS idx_jobs_status_posted;
DROP INDEX IF EXISTS idx_jobs_trade;
DROP INDEX IF EXISTS idx_jobs_location;
DROP INDEX IF EXISTS idx_job_applications_composite;
DROP INDEX IF EXISTS idx_users_role_status;
DROP INDEX IF EXISTS idx_ads_active_serving;
DROP INDEX IF EXISTS idx_ad_views_ad_id;
DROP INDEX IF EXISTS idx_ad_clicks_ad_id;
DROP INDEX IF EXISTS idx_sessions_user_revoked;
