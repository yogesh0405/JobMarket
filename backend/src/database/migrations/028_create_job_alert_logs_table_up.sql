-- UP Migration: 028_create_job_alert_logs_table.sql
CREATE TABLE IF NOT EXISTS job_alert_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    match_score INT NOT NULL DEFAULT 50,
    match_reasons JSONB DEFAULT '[]'::jsonb,
    channel VARCHAR(50) DEFAULT 'PUSH',
    status VARCHAR(50) DEFAULT 'SENT',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_job_alert UNIQUE (user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_job_alert_logs_user_sent ON job_alert_logs (user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_alert_logs_job ON job_alert_logs (job_id);
