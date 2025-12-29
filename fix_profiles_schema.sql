-- Add email column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

COMMENT ON COLUMN profiles.email IS 'User email address';

-- Re-run the trigger creation just in case (this is safe to run multiple times)
-- It ensures the trigger uses the new column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, dni, document_type, birth_date, country, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'dni', ''),
    COALESCE(NEW.raw_user_meta_data->>'document_type', 'dni'),
    NULLIF(NEW.raw_user_meta_data->>'birth_date', '')::date,
    COALESCE(NEW.raw_user_meta_data->>'country', 'Perú'),
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
