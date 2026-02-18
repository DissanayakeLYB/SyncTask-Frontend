-- Migration: Add leave_type column to leaves table
-- This allows tracking full day, half day morning, and half day afternoon leaves

-- Step 1: Create an enum type for leave types
CREATE TYPE leave_type AS ENUM ('full_day', 'half_day_morning', 'half_day_afternoon');

-- Step 2: Add leave_type column to leaves table with default 'full_day' for existing records
ALTER TABLE leaves 
  ADD COLUMN leave_type leave_type DEFAULT 'full_day' NOT NULL;

-- Step 3: Update the unique constraint to allow multiple half-day leaves on the same date
-- Drop the existing unique constraint (PostgreSQL auto-names it as leaves_team_member_id_leave_date_key)
ALTER TABLE leaves DROP CONSTRAINT IF EXISTS leaves_team_member_id_leave_date_key;

-- Add a new unique constraint that allows one of each leave type per date per member
-- This means a member can have:
-- - One full_day leave per date
-- - One half_day_morning leave per date  
-- - One half_day_afternoon leave per date
-- The application logic should prevent conflicting combinations (e.g., full_day + any half_day)
CREATE UNIQUE INDEX leaves_team_member_date_type_unique 
  ON leaves(team_member_id, leave_date, leave_type);

-- Note: The application logic should prevent:
-- - Having both full_day and any half_day leave on the same date
-- - Having both half_day_morning and half_day_afternoon on the same date (if desired)
-- These business rules can be enforced via triggers or application logic
