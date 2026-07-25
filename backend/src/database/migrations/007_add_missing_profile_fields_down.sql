-- DOWN Migration: 007_add_missing_profile_fields.sql
ALTER TABLE users DROP COLUMN IF EXISTS headline;
ALTER TABLE users DROP COLUMN IF EXISTS location;
ALTER TABLE users DROP COLUMN IF EXISTS skills;
ALTER TABLE users DROP COLUMN IF EXISTS preferred_shift;
ALTER TABLE users DROP COLUMN IF EXISTS requires_bus;
ALTER TABLE users DROP COLUMN IF EXISTS requires_accommodation;
