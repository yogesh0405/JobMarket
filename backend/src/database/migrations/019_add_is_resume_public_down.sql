-- DOWN Migration: 019_add_is_resume_public.sql

ALTER TABLE users DROP COLUMN IF EXISTS is_resume_public;
