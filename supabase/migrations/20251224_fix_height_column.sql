-- Fix height column - add it with proper syntax
-- This replaces the broken migration from 20251224_add_height_voice_photo_analysis.sql

-- Drop existing column if it exists (in case partial migration ran)
ALTER TABLE profiles DROP COLUMN IF EXISTS height_cm;

-- Add height field to profiles
ALTER TABLE profiles
ADD COLUMN height_cm INTEGER;

-- Add CHECK constraint separately (proper syntax)
ALTER TABLE profiles
ADD CONSTRAINT check_height_cm_range
CHECK (height_cm IS NULL OR (height_cm >= 120 AND height_cm <= 250));

COMMENT ON COLUMN profiles.height_cm IS 'User height in centimeters (120-250cm range)';

-- Create index for height-based matching
CREATE INDEX IF NOT EXISTS idx_profiles_height_cm ON profiles(height_cm) WHERE height_cm IS NOT NULL;
