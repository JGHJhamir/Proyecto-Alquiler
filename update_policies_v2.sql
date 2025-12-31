-- Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Allow Admins to UPDATE any profile
-- This policy checks if the user performing the update has the 'admin' role
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- Allow Users to UPDATE their own profile (standard)
-- This ensures users can still edit their own data
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING ( auth.uid() = id );
