-- Migration: Add Matching System Support
-- Date: 2025-12-21
-- Description: Creates passes table, adds performance indexes, and helper function for match discovery

-- =====================================================
-- 1. CREATE PASSES TABLE
-- =====================================================
-- Tracks users who have been passed on (swiped left)
-- Used to filter out already-rejected profiles from discover feed

CREATE TABLE IF NOT EXISTS passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  passed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_pass UNIQUE(passer_id, passed_id)
);

-- Add comment
COMMENT ON TABLE passes IS 'Tracks users who have been passed on (swiped left) to filter from discover feed';

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for passes table
CREATE INDEX IF NOT EXISTS idx_passes_passer ON passes(passer_id);
CREATE INDEX IF NOT EXISTS idx_passes_passed ON passes(passed_id);
CREATE INDEX IF NOT EXISTS idx_passes_created_at ON passes(created_at DESC);

-- Indexes for likes table (if not already exist)
CREATE INDEX IF NOT EXISTS idx_likes_liker ON likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_likes_liked ON likes(liked_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at DESC);

-- Indexes for matches table (if not already exist)
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(matched_at DESC);

-- Indexes for blocks table (if not already exist)
CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_id);

-- Index for profiles location-based queries
-- Note: For production with many users, consider using PostGIS for geographic queries
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location_lat, location_lng)
  WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;

-- Index for profiles last_active_at (for sorting potential matches)
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at DESC)
  WHERE last_active_at IS NOT NULL;

-- Composite index for common profile filters
CREATE INDEX IF NOT EXISTS idx_profiles_gender_age ON profiles(gender, age)
  WHERE gender IS NOT NULL AND age IS NOT NULL;

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on passes table
ALTER TABLE passes ENABLE ROW LEVEL SECURITY;

-- Users can read their own passes
CREATE POLICY "Users can view their own passes"
  ON passes FOR SELECT
  USING (auth.uid() = passer_id);

-- Users can insert their own passes
CREATE POLICY "Users can create their own passes"
  ON passes FOR INSERT
  WITH CHECK (auth.uid() = passer_id);

-- Users can delete their own passes (for undo functionality if needed later)
CREATE POLICY "Users can delete their own passes"
  ON passes FOR DELETE
  USING (auth.uid() = passer_id);

-- =====================================================
-- 4. HELPER FUNCTION: GET EXCLUDED USER IDS
-- =====================================================
-- Returns all user IDs that should be excluded from discover feed
-- Includes: liked users, passed users, matched users, blocked users

CREATE OR REPLACE FUNCTION get_excluded_user_ids(target_user_id UUID)
RETURNS TABLE(excluded_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Users I've liked
  SELECT liked_id FROM likes WHERE liker_id = target_user_id
  UNION
  -- Users I've passed on
  SELECT passed_id FROM passes WHERE passer_id = target_user_id
  UNION
  -- Users I'm matched with (user2)
  SELECT user2_id FROM matches WHERE user1_id = target_user_id
  UNION
  -- Users I'm matched with (user1)
  SELECT user1_id FROM matches WHERE user2_id = target_user_id
  UNION
  -- Users I've blocked
  SELECT blocked_id FROM blocks WHERE blocker_id = target_user_id
  UNION
  -- Users who blocked me
  SELECT blocker_id FROM blocks WHERE blocked_id = target_user_id;
END;
$$;

-- Add comment
COMMENT ON FUNCTION get_excluded_user_ids IS 'Returns all user IDs to exclude from discover feed (liked, passed, matched, blocked)';

-- =====================================================
-- 5. HELPER FUNCTION: CHECK MUTUAL LIKE
-- =====================================================
-- Efficiently checks if two users have liked each other
-- Used to detect matches

CREATE OR REPLACE FUNCTION check_mutual_like(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user1_liked_user2 BOOLEAN;
  user2_liked_user1 BOOLEAN;
BEGIN
  -- Check if user1 liked user2
  SELECT EXISTS(
    SELECT 1 FROM likes WHERE liker_id = user1_id AND liked_id = user2_id
  ) INTO user1_liked_user2;

  -- Check if user2 liked user1
  SELECT EXISTS(
    SELECT 1 FROM likes WHERE liker_id = user2_id AND liked_id = user1_id
  ) INTO user2_liked_user1;

  RETURN user1_liked_user2 AND user2_liked_user1;
END;
$$;

-- Add comment
COMMENT ON FUNCTION check_mutual_like IS 'Checks if two users have mutually liked each other';

-- =====================================================
-- 6. UPDATE PROFILES TABLE
-- =====================================================
-- Add last_active_at if it doesn't exist (for sorting potential matches)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_active_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_active_at TIMESTAMPTZ DEFAULT now();
    COMMENT ON COLUMN profiles.last_active_at IS 'Timestamp of last user activity for sorting potential matches';
  END IF;
END $$;

-- Add location fields if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'location_lat'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_lat DOUBLE PRECISION;
    ALTER TABLE profiles ADD COLUMN location_lng DOUBLE PRECISION;
    COMMENT ON COLUMN profiles.location_lat IS 'Latitude coordinate for location-based matching';
    COMMENT ON COLUMN profiles.location_lng IS 'Longitude coordinate for location-based matching';
  END IF;
END $$;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT ON passes TO authenticated;
GRANT INSERT ON passes TO authenticated;
GRANT DELETE ON passes TO authenticated;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION get_excluded_user_ids TO authenticated;
GRANT EXECUTE ON FUNCTION check_mutual_like TO authenticated;
