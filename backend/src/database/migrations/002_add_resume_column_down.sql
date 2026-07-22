-- DOWN Migration: 002_add_resume_column
ALTER TABLE users DROP COLUMN IF EXISTS resume;
