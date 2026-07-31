-- UP Migration: 019_add_is_resume_public.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_resume_public BOOLEAN DEFAULT TRUE;
