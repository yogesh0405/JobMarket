-- UP Migration: 021_add_notification_structured_metadata_up.sql

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_id VARCHAR(255);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Index for entity fast lookup
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(entity_type, entity_id);
