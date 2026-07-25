-- DOWN Migration: 009_create_support_tickets.sql

DROP TABLE IF EXISTS in_app_notifications;
DROP TABLE IF EXISTS support_messages;
DROP TABLE IF EXISTS support_tickets;
DROP TYPE IF EXISTS support_ticket_status;
DROP TYPE IF EXISTS support_ticket_priority;
