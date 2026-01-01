-- Add voice greeting and photo analysis fields
-- Phase 1: Database & Infrastructure for "Life with Bob" story cards
-- Note: height_cm column is now added in 20251224_fix_height_column.sql migration

-- Add voice greeting fields to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS voice_greeting_url TEXT,
ADD COLUMN IF NOT EXISTS voice_duration_seconds INTEGER
CHECK (voice_duration_seconds IS NULL OR (voice_duration_seconds >= 1 AND voice_duration_seconds <= 120));

COMMENT ON COLUMN profiles.voice_greeting_url IS 'Storage URL for user voice greeting audio file';
COMMENT ON COLUMN profiles.voice_duration_seconds IS 'Duration of voice greeting in seconds (1-120s)';

-- Add AI analysis fields to photos
ALTER TABLE photos
ADD COLUMN IF NOT EXISTS ai_analysis JSONB,
ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ;

COMMENT ON COLUMN photos.ai_analysis IS 'OpenAI Vision API analysis results (height, style, vibe, compatibility)';
COMMENT ON COLUMN photos.analyzed_at IS 'Timestamp when photo was analyzed by AI';

-- Create index for querying analyzed photos
CREATE INDEX IF NOT EXISTS idx_photos_analyzed_at ON photos(analyzed_at);
