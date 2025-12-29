-- Add new fields to profiles table for document type and country

-- Add document_type column (dni or passport)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'dni';

-- Add country column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Perú';

-- Add comment to columns
COMMENT ON COLUMN profiles.document_type IS 'Type of identification document: dni or passport';
COMMENT ON COLUMN profiles.country IS 'Country of origin of the user';
