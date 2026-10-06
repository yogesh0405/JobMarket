-- UP Migration: 026_add_available_in_days.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS available_in_days INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_available_in_days ON users(available_in_days) WHERE LOWER(role) = 'candidate';
