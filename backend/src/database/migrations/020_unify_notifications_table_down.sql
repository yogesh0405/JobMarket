-- DOWN Migration: 020_unify_notifications_table.sql

-- No-op or drop indices if rolling back
DROP INDEX IF EXISTS idx_notifications_user_read;
