-- DOWN Migration: 026_add_available_in_days.sql

DROP INDEX IF EXISTS idx_users_available_in_days;

ALTER TABLE users DROP COLUMN IF EXISTS available_in_days;
