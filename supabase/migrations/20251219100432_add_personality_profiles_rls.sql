-- Add RLS policies for personality_profiles table

-- Enable RLS on personality_profiles table
ALTER TABLE personality_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own personality profile
CREATE POLICY "Users can insert their own personality profile"
ON personality_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own personality profile
CREATE POLICY "Users can update their own personality profile"
ON personality_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to select their own personality profile
CREATE POLICY "Users can view their own personality profile"
ON personality_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
