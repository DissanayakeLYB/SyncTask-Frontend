-- Migration: Fix leaves table foreign key reference
-- The leaves table should reference profiles (user accounts) instead of team_members
-- since the application now treats profiles as the source of team members

-- Step 1: Drop the existing foreign key constraint on leaves table
ALTER TABLE leaves DROP CONSTRAINT IF EXISTS leaves_team_member_id_fkey;

-- Step 2: Add a new foreign key constraint referencing profiles table
-- Note: We keep the column name as team_member_id for backward compatibility with existing code
ALTER TABLE leaves 
  ADD CONSTRAINT leaves_team_member_id_fkey 
  FOREIGN KEY (team_member_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Step 3: Update the index for better query performance
DROP INDEX IF EXISTS idx_leaves_member;
CREATE INDEX idx_leaves_member ON leaves(team_member_id);

-- Step 4: Clean up any orphaned leaves that don't have matching profiles
DELETE FROM leaves 
WHERE team_member_id NOT IN (SELECT id FROM profiles);

-- The RLS policies remain the same since they already reference auth.uid()
-- and the created_by column properly
