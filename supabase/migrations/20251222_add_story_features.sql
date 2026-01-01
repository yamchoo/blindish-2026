-- Migration: Add Story Card Features
-- Description: Add database support for story cards, card reactions, and shared content queries

-- Add GIN indexes for fast JSONB queries on integration data
CREATE INDEX IF NOT EXISTS idx_spotify_top_artists_gin
  ON spotify_user_data USING GIN (top_artists);

CREATE INDEX IF NOT EXISTS idx_youtube_subscriptions_gin
  ON youtube_user_data USING GIN (subscriptions);

-- Create card_reactions table for tracking per-card likes
CREATE TABLE IF NOT EXISTS card_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL CHECK (card_type IN ('spotify', 'youtube', 'personality', 'lifestyle', 'photo')),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate reactions for same card type
  UNIQUE(user_id, target_user_id, card_type)
);

CREATE INDEX IF NOT EXISTS idx_card_reactions_user
  ON card_reactions(user_id, target_user_id);

-- Enable RLS on card_reactions
ALTER TABLE card_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for card_reactions
CREATE POLICY "Users can view their own card reactions"
  ON card_reactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own card reactions"
  ON card_reactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own card reactions"
  ON card_reactions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own card reactions"
  ON card_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- RPC function to find shared content between two users
CREATE OR REPLACE FUNCTION find_shared_content(
  user1_id UUID,
  user2_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  shared_artists JSONB;
  shared_channels JSONB;
BEGIN
  -- Find shared Spotify artists by comparing top_artists arrays
  WITH user1_artists AS (
    SELECT jsonb_array_elements(COALESCE(top_artists, '[]'::jsonb)) AS artist
    FROM spotify_user_data
    WHERE user_id = user1_id
  ),
  user2_artists AS (
    SELECT jsonb_array_elements(COALESCE(top_artists, '[]'::jsonb)) AS artist
    FROM spotify_user_data
    WHERE user_id = user2_id
  )
  SELECT jsonb_agg(DISTINCT u1.artist)
  INTO shared_artists
  FROM user1_artists u1
  INNER JOIN user2_artists u2
    ON u1.artist->>'id' = u2.artist->>'id'
  LIMIT 10; -- Top 10 shared artists for performance

  -- Find shared YouTube channels
  WITH user1_channels AS (
    SELECT jsonb_array_elements(COALESCE(subscriptions, '[]'::jsonb)) AS channel
    FROM youtube_user_data
    WHERE user_id = user1_id
  ),
  user2_channels AS (
    SELECT jsonb_array_elements(COALESCE(subscriptions, '[]'::jsonb)) AS channel
    FROM youtube_user_data
    WHERE user_id = user2_id
  )
  SELECT jsonb_agg(DISTINCT u1.channel)
  INTO shared_channels
  FROM user1_channels u1
  INNER JOIN user2_channels u2
    ON u1.channel->>'channel_id' = u2.channel->>'channel_id'
  LIMIT 10; -- Top 10 shared channels for performance

  -- Build JSON result
  result := json_build_object(
    'shared_artists', COALESCE(shared_artists, '[]'::jsonb),
    'shared_channels', COALESCE(shared_channels, '[]'::jsonb)
  );

  RETURN result;
END;
$$;
