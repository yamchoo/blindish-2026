-- Add communication_style column to profiles for storing communication preferences
-- This will store responses to onboarding questions about:
-- - conflict_resolution: how they handle disagreements
-- - affection_expression: their love language preference
-- - communication_preference: their preferred communication depth

ALTER TABLE profiles
ADD COLUMN communication_style JSONB;

-- Add comment explaining the structure
COMMENT ON COLUMN profiles.communication_style IS 'User communication style preferences stored as JSONB. Structure: { "conflict_resolution": "talk_immediately" | "need_space" | "avoid_conflict" | "seek_compromise", "affection_expression": "words" | "quality_time" | "gifts" | "acts_of_service" | "physical_touch", "communication_preference": "deep_vulnerable" | "light_fun" | "practical" | "balanced" }';

-- Create index for querying communication style (useful for matching later)
CREATE INDEX idx_profiles_communication_style ON profiles USING GIN (communication_style);

-- No default value - users will fill this during onboarding
-- NULL means they haven't completed communication style questions yet
