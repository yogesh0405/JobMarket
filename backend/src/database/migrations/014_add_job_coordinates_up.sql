-- UP Migration: 014_add_job_coordinates.sql

ALTER TABLE jobs 
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS geocoding_status VARCHAR(50) DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS last_geocoded_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS location_accuracy VARCHAR(50) DEFAULT 'APPROXIMATE';

CREATE INDEX IF NOT EXISTS idx_jobs_lat_lng ON jobs(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_jobs_geocoding_status ON jobs(geocoding_status);
