-- DOWN Migration: 025_scalability_indexes_and_sequences.sql

DROP INDEX IF EXISTS idx_job_applications_user_status_applied;
DROP INDEX IF EXISTS idx_job_applications_job_status;
DROP INDEX IF EXISTS idx_saved_jobs_user_created;
DROP INDEX IF EXISTS idx_notifications_user_read_created;
DROP INDEX IF EXISTS idx_companies_employer;
DROP INDEX IF EXISTS idx_companies_name_lower;
DROP INDEX IF EXISTS idx_jobs_company_lower;
DROP SEQUENCE IF EXISTS support_ticket_seq;
