-- Migration: Fix task_assignees table foreign key reference
-- The task_assignees table should reference profiles (user accounts) instead of team_members
-- since the application now treats profiles as the source of team members
-- This is similar to what was done for the leaves table in 003_fix_leaves_fk.sql

-- Step 1: Drop the existing foreign key constraint on task_assignees table
ALTER TABLE task_assignees DROP CONSTRAINT IF EXISTS task_assignees_team_member_id_fkey;

-- Step 2: Add a new foreign key constraint referencing profiles table
-- Note: We keep the column name as team_member_id for backward compatibility with existing code
ALTER TABLE task_assignees 
  ADD CONSTRAINT task_assignees_team_member_id_fkey 
  FOREIGN KEY (team_member_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Step 3: Update the index for better query performance
DROP INDEX IF EXISTS idx_task_assignees_member;
CREATE INDEX idx_task_assignees_member ON task_assignees(team_member_id);

-- Step 4: Clean up any orphaned task_assignees that don't have matching profiles
DELETE FROM task_assignees 
WHERE team_member_id NOT IN (SELECT id FROM profiles);

-- The RLS policies remain the same since they already allow authenticated users
-- to manage task assignees
