-- UP Migration: 005_add_profile_picture_url.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(500);
