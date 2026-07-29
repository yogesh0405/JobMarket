-- DOWN Migration: 014_add_job_coordinates.sql

DROP INDEX IF EXISTS idx_jobs_geocoding_status;
DROP INDEX IF EXISTS idx_jobs_lat_lng;

ALTER TABLE jobs 
  DROP COLUMN IF EXISTS location_accuracy,
  DROP COLUMN IF EXISTS last_geocoded_at,
  DROP COLUMN IF EXISTS geocoding_status,
  DROP COLUMN IF EXISTS longitude,
  DROP COLUMN IF EXISTS latitude;
