-- Force update the role for the admin accounts
-- We use a subquery to find the ID from auth.users table because profiles table doesn't have email column

UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('admin@playa.com', 'administrador@playa.com', 'dueno@playa.com')
);

-- Verify the result
SELECT * FROM profiles WHERE role = 'admin';
