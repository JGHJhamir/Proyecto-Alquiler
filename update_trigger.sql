-- Update the handle_new_user function to include phone, dni, country, etc.
-- Run this in Supabase SQL Editor to ensure new data is copied from Auth to Profiles.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    phone, 
    dni, 
    document_type, 
    country, 
    role
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.email, 
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'dni',
    NEW.raw_user_meta_data->>'document_type',
    NEW.raw_user_meta_data->>'country',
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    dni = EXCLUDED.dni,
    country = EXCLUDED.country;
  
  RETURN NEW;
END;
$$;
