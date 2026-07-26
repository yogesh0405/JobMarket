-- DOWN Migration: 012_create_advertisements_tables.sql

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS advertisement_approvals CASCADE;
DROP TABLE IF EXISTS advertisement_views CASCADE;
DROP TABLE IF EXISTS advertisement_clicks CASCADE;
DROP TABLE IF EXISTS advertisements CASCADE;
