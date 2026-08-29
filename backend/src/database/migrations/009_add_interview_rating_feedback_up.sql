ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS interview_rating NUMERIC(3, 1),
ADD COLUMN IF NOT EXISTS interview_feedback TEXT,
ADD COLUMN IF NOT EXISTS postponed_reason TEXT,
ADD COLUMN IF NOT EXISTS interview_status VARCHAR(50) DEFAULT 'scheduled';
