ALTER TABLE job_applications 
DROP COLUMN IF EXISTS interview_date,
DROP COLUMN IF EXISTS interview_time,
DROP COLUMN IF EXISTS venue_address,
DROP COLUMN IF EXISTS maps_link;
