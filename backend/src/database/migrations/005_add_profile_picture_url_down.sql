-- DOWN Migration: 005_add_profile_picture_url.sql
ALTER TABLE users DROP COLUMN IF EXISTS profile_picture_url;
