-- SyncTask Seed Users
-- Run this in Supabase SQL Editor AFTER 001_initial_schema.sql
-- These are default test accounts for development/demo purposes
--
-- ⚠️  IMPORTANT: Change passwords in production!
--
-- Default User Accounts:
-- =========================================
-- Admin Account:
--   Email: admin@synctask.com
--   Password: Admin@123
--
-- Team Member Accounts:
--   Email: nuwanga@synctask.com     | Password: Nuwanga@123
--   Email: charuka@synctask.com     | Password: Charuka@123
--   Email: pramodi@synctask.com     | Password: Pramodi@123
--   Email: dileka@synctask.com      | Password: Dileka@123
--   Email: lasith@synctask.com      | Password: Lasith@123
--   Email: ashen@synctask.com       | Password: Ashen@123
--   Email: warsha@synctask.com      | Password: Warsha@123
--   Email: dedunu@synctask.com      | Password: Dedunu@123
--   Email: shalitha@synctask.com    | Password: Shalitha@123
-- =========================================

-- Note: In Supabase, you cannot directly insert into auth.users via SQL.
-- Users must be created through one of these methods:
--
-- Option 1: Use Supabase Dashboard
--   1. Go to Authentication > Users
--   2. Click "Add user" and create each user with the credentials above
--
-- Option 2: Use the Supabase Admin API (service_role key required)
--   Run the JavaScript seed script: npm run seed:users
--
-- Option 3: Use the SQL function below (requires service_role connection)

-- Create a helper function to seed users (only works with service_role permissions)
CREATE OR REPLACE FUNCTION seed_demo_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_id UUID;
    user_ids UUID[] := ARRAY[]::UUID[];
BEGIN
    -- This function is a placeholder
    -- Actual user creation must be done via Supabase Auth API or Dashboard
    RAISE NOTICE 'Users must be created via Supabase Dashboard or Auth API';
    RAISE NOTICE 'See the seed:users script or create users manually';
END;
$$;

-- After creating users via Dashboard/API, run these to set up admin role:
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@synctask.com';

-- Link team members to user accounts (run after creating users):
-- This will be handled by a separate script that links team_members to profiles
