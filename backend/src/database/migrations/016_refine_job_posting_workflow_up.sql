-- UP Migration: 016_refine_job_posting_workflow.sql

ALTER TABLE jobs 
  ADD COLUMN IF NOT EXISTS accept_resume BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS target_iti BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS iti_trade VARCHAR(255),
  ADD COLUMN IF NOT EXISTS experience_required BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS disclose_salary BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_jobs_accept_resume ON jobs(accept_resume);
CREATE INDEX IF NOT EXISTS idx_jobs_target_iti ON jobs(target_iti);
