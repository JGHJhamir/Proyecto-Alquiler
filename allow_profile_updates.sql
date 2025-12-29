-- Ensure users can update their own profile

-- First, drop the policy if it exists to avoid errors (or we can use DO block, but keep it simple)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create the policy
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
