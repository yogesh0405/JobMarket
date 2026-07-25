-- DOWN Migration: 003_add_experience_education.sql
ALTER TABLE users DROP COLUMN IF EXISTS experience;
ALTER TABLE users DROP COLUMN IF EXISTS education;
