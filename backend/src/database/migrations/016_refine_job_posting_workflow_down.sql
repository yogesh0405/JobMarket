-- DOWN Migration: 016_refine_job_posting_workflow.sql

ALTER TABLE jobs 
  DROP COLUMN IF EXISTS accept_resume,
  DROP COLUMN IF EXISTS target_iti,
  DROP COLUMN IF EXISTS iti_trade,
  DROP COLUMN IF EXISTS experience_required,
  DROP COLUMN IF EXISTS disclose_salary;
