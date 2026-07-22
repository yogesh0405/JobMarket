-- UP Migration: 002_add_resume_column
ALTER TABLE users ADD COLUMN IF NOT EXISTS resume JSONB;
