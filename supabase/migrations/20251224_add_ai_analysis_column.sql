-- Add ai_analysis column to personality_profiles for enhanced relationship insights
-- This column stores the full enhanced personality analysis from GPT-4o including:
-- - bigFiveScores
-- - relationshipInsights (compatibility_strengths, what_to_know, research_backed_note)
-- - conversationStarters
-- - communication_style_inference

ALTER TABLE personality_profiles
ADD COLUMN IF NOT EXISTS ai_analysis JSONB;

-- Add comment explaining the structure
COMMENT ON COLUMN personality_profiles.ai_analysis IS 'Enhanced AI personality analysis from GPT-4o including relationship insights, conversation starters, and communication style inferences. Structure: { "bigFiveScores": {...}, "relationshipInsights": {...}, "conversationStarters": [...], "communication_style_inference": {...} }';

-- Create GIN index for efficient querying of JSONB data
CREATE INDEX IF NOT EXISTS idx_personality_profiles_ai_analysis
ON personality_profiles USING GIN (ai_analysis);
