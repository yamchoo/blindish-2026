-- Migration: Add Integration Tables
-- Description: Create tables for storing Spotify and YouTube integration data

-- Create spotify_user_data table
CREATE TABLE IF NOT EXISTS spotify_user_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  top_artists JSONB DEFAULT '[]'::jsonb,
  top_tracks JSONB DEFAULT '[]'::jsonb,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create youtube_user_data table
CREATE TABLE IF NOT EXISTS youtube_user_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  subscriptions JSONB DEFAULT '[]'::jsonb,
  liked_videos JSONB DEFAULT '[]'::jsonb,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_spotify_user_id ON spotify_user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_user_id ON youtube_user_data(user_id);

-- Enable RLS
ALTER TABLE spotify_user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_user_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for spotify_user_data
CREATE POLICY "Users can view their own Spotify data"
  ON spotify_user_data
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Spotify data"
  ON spotify_user_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Spotify data"
  ON spotify_user_data
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for youtube_user_data
CREATE POLICY "Users can view their own YouTube data"
  ON youtube_user_data
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own YouTube data"
  ON youtube_user_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own YouTube data"
  ON youtube_user_data
  FOR UPDATE
  USING (auth.uid() = user_id);
