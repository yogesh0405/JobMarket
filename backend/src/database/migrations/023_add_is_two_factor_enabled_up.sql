-- Migration: Add is_two_factor_enabled to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_two_factor_enabled BOOLEAN DEFAULT FALSE;
