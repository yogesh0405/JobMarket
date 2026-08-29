ALTER TABLE job_applications 
DROP COLUMN IF EXISTS interview_rating,
DROP COLUMN IF EXISTS interview_feedback,
DROP COLUMN IF EXISTS postponed_reason,
DROP COLUMN IF EXISTS interview_status;
