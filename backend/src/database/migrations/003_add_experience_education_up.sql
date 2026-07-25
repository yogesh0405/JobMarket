-- UP Migration: 003_add_experience_education.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb;
