/**
 * Shared Content Service
 *
 * Fetches and processes shared content between two users for story card display.
 * Uses the find_shared_content RPC function to efficiently query JSONB data.
 */

import { supabase } from '@/lib/supabase';

// ============================================================================
// Type Definitions
// ============================================================================

export interface SharedSpotifyArtist {
  id: string;
  name: string;
  image_url?: string;
  genres: string[];
}

export interface SharedSpotifyTrack {
  id: string;
  name: string;
  artists: string[];
}

export interface SharedYouTubeChannel {
  channel_id: string;
  channel_title: string;
  description?: string;
  thumbnail?: string;
}

export interface PersonalityTrait {
  name: string;
  userScore: number;
  matchScore: number;
  overlap: number;
}

export interface LifestyleCompatibility {
  category: string;
  userValue: string;
  matchValue: string;
  compatible: boolean;
}

export interface SharedContent {
  spotify: {
    sharedArtists: SharedSpotifyArtist[];
    sharedTracks: SharedSpotifyTrack[];
    totalSharedArtists: number;
  };
  youtube: {
    sharedChannels: SharedYouTubeChannel[];
    totalSharedChannels: number;
  };
  personality: {
    topSharedTraits: PersonalityTrait[];
    overallCompatibility: number;
  };
  lifestyle: {
    compatibleValues: LifestyleCompatibility[];
    neutralValues: LifestyleCompatibility[];
  };
}

// ============================================================================
// Main Service Function
// ============================================================================

/**
 * Fetch all shared content between current user and a potential match
 *
 * @param currentUserId - The current user's ID
 * @param matchUserId - The potential match's ID
 * @returns Structured shared content data for story cards
 */
export async function fetchSharedContent(
  currentUserId: string,
  matchUserId: string
): Promise<SharedContent> {
  try {
    console.log(`[SharedContent] Fetching shared content between ${currentUserId} and ${matchUserId}`);

    // Fetch all data in parallel for performance
    const [
      sharedIntegrationData,
      personalityData,
      lifestyleData,
    ] = await Promise.all([
      fetchSharedIntegrationContent(currentUserId, matchUserId),
      fetchPersonalityCompatibility(currentUserId, matchUserId),
      fetchLifestyleCompatibility(currentUserId, matchUserId),
    ]);

    const result: SharedContent = {
      spotify: sharedIntegrationData.spotify,
      youtube: sharedIntegrationData.youtube,
      personality: personalityData,
      lifestyle: lifestyleData,
    };

    console.log('[SharedContent] Fetch complete:', {
      sharedArtists: result.spotify.sharedArtists.length,
      sharedChannels: result.youtube.sharedChannels.length,
      sharedTraits: result.personality.topSharedTraits.length,
    });

    return result;
  } catch (error) {
    console.error('[SharedContent] Failed to fetch shared content:', error);

    // Return empty structure on error so cards can gracefully handle missing data
    return {
      spotify: { sharedArtists: [], sharedTracks: [], totalSharedArtists: 0 },
      youtube: { sharedChannels: [], totalSharedChannels: 0 },
      personality: { topSharedTraits: [], overallCompatibility: 0 },
      lifestyle: { compatibleValues: [], neutralValues: [] },
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Fetch shared Spotify and YouTube content using RPC function
 */
async function fetchSharedIntegrationContent(
  currentUserId: string,
  matchUserId: string
): Promise<Pick<SharedContent, 'spotify' | 'youtube'>> {
  try {
    // Call the find_shared_content RPC function
    const { data, error } = await supabase.rpc('find_shared_content', {
      user1_id: currentUserId,
      user2_id: matchUserId,
    });

    if (error) {
      console.error('[SharedContent] RPC error:', error);
      throw error;
    }

    // Transform RPC result into typed interface
    const sharedArtists: SharedSpotifyArtist[] = (data?.shared_artists || []).map((artist: any) => ({
      id: artist.id || '',
      name: artist.name || 'Unknown Artist',
      image_url: artist.image_url,
      genres: artist.genres || [],
    }));

    const sharedChannels: SharedYouTubeChannel[] = (data?.shared_channels || []).map((channel: any) => ({
      channel_id: channel.channel_id || '',
      channel_title: channel.channel_title || 'Unknown Channel',
      description: channel.description,
      thumbnail: channel.thumbnail,
    }));

    return {
      spotify: {
        sharedArtists,
        sharedTracks: [], // Future enhancement: compare top_tracks
        totalSharedArtists: sharedArtists.length,
      },
      youtube: {
        sharedChannels,
        totalSharedChannels: sharedChannels.length,
      },
    };
  } catch (error) {
    console.error('[SharedContent] Integration content fetch failed:', error);
    return {
      spotify: { sharedArtists: [], sharedTracks: [], totalSharedArtists: 0 },
      youtube: { sharedChannels: [], totalSharedChannels: 0 },
    };
  }
}

/**
 * Fetch and compare Big Five personality traits
 */
async function fetchPersonalityCompatibility(
  currentUserId: string,
  matchUserId: string
): Promise<SharedContent['personality']> {
  try {
    // Fetch both users' personality profiles
    const { data: profiles, error } = await supabase
      .from('personality_profiles')
      .select('user_id, openness, conscientiousness, extraversion, agreeableness, neuroticism')
      .in('user_id', [currentUserId, matchUserId]);

    if (error) {
      console.error('[SharedContent] Personality fetch error:', error);
      throw error;
    }

    if (!profiles || profiles.length !== 2) {
      console.warn('[SharedContent] Missing personality profiles');
      return { topSharedTraits: [], overallCompatibility: 0 };
    }

    const currentProfile = profiles.find(p => p.user_id === currentUserId);
    const matchProfile = profiles.find(p => p.user_id === matchUserId);

    if (!currentProfile || !matchProfile) {
      return { topSharedTraits: [], overallCompatibility: 0 };
    }

    // Calculate trait overlaps
    const traits: PersonalityTrait[] = [
      {
        name: 'Openness',
        userScore: currentProfile.openness,
        matchScore: matchProfile.openness,
        overlap: calculateOverlap(currentProfile.openness, matchProfile.openness),
      },
      {
        name: 'Conscientiousness',
        userScore: currentProfile.conscientiousness,
        matchScore: matchProfile.conscientiousness,
        overlap: calculateOverlap(currentProfile.conscientiousness, matchProfile.conscientiousness),
      },
      {
        name: 'Extraversion',
        userScore: currentProfile.extraversion,
        matchScore: matchProfile.extraversion,
        overlap: calculateOverlap(currentProfile.extraversion, matchProfile.extraversion),
      },
      {
        name: 'Agreeableness',
        userScore: currentProfile.agreeableness,
        matchScore: matchProfile.agreeableness,
        overlap: calculateOverlap(currentProfile.agreeableness, matchProfile.agreeableness),
      },
      {
        name: 'Neuroticism',
        userScore: currentProfile.neuroticism,
        matchScore: matchProfile.neuroticism,
        overlap: calculateOverlap(currentProfile.neuroticism, matchProfile.neuroticism),
      },
    ];

    // Sort by overlap (highest first) and take top 3
    const topSharedTraits = traits
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 3);

    // Calculate overall compatibility (average of all trait overlaps)
    const overallCompatibility = Math.round(
      traits.reduce((sum, trait) => sum + trait.overlap, 0) / traits.length
    );

    return { topSharedTraits, overallCompatibility };
  } catch (error) {
    console.error('[SharedContent] Personality compatibility fetch failed:', error);
    return { topSharedTraits: [], overallCompatibility: 0 };
  }
}

/**
 * Fetch and compare lifestyle values
 */
async function fetchLifestyleCompatibility(
  currentUserId: string,
  matchUserId: string
): Promise<SharedContent['lifestyle']> {
  try {
    // Fetch both users' profiles for lifestyle data
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, kids, drinking, smoking, religion, political_views')
      .in('id', [currentUserId, matchUserId]);

    if (error) {
      console.error('[SharedContent] Lifestyle fetch error:', error);
      throw error;
    }

    if (!profiles || profiles.length !== 2) {
      console.warn('[SharedContent] Missing profiles for lifestyle comparison');
      return { compatibleValues: [], neutralValues: [] };
    }

    const currentProfile = profiles.find(p => p.id === currentUserId);
    const matchProfile = profiles.find(p => p.id === matchUserId);

    if (!currentProfile || !matchProfile) {
      return { compatibleValues: [], neutralValues: [] };
    }

    // Compare lifestyle categories
    const comparisons: LifestyleCompatibility[] = [
      {
        category: 'Kids',
        userValue: currentProfile.kids || 'Not specified',
        matchValue: matchProfile.kids || 'Not specified',
        compatible: currentProfile.kids === matchProfile.kids,
      },
      {
        category: 'Drinking',
        userValue: currentProfile.drinking || 'Not specified',
        matchValue: matchProfile.drinking || 'Not specified',
        compatible: currentProfile.drinking === matchProfile.drinking,
      },
      {
        category: 'Smoking',
        userValue: currentProfile.smoking || 'Not specified',
        matchValue: matchProfile.smoking || 'Not specified',
        compatible: currentProfile.smoking === matchProfile.smoking,
      },
      {
        category: 'Religion',
        userValue: currentProfile.religion || 'Not specified',
        matchValue: matchProfile.religion || 'Not specified',
        compatible: currentProfile.religion === matchProfile.religion,
      },
      {
        category: 'Politics',
        userValue: currentProfile.political_views || 'Not specified',
        matchValue: matchProfile.political_views || 'Not specified',
        compatible: currentProfile.political_views === matchProfile.political_views,
      },
    ];

    // Split into compatible and neutral categories
    const compatibleValues = comparisons.filter(c => c.compatible);
    const neutralValues = comparisons.filter(c => !c.compatible);

    return { compatibleValues, neutralValues };
  } catch (error) {
    console.error('[SharedContent] Lifestyle compatibility fetch failed:', error);
    return { compatibleValues: [], neutralValues: [] };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate percentage overlap between two trait scores (0-100)
 */
function calculateOverlap(score1: number, score2: number): number {
  const difference = Math.abs(score1 - score2);
  const maxDifference = 100; // Scores are 0-100
  const overlap = ((maxDifference - difference) / maxDifference) * 100;
  return Math.round(overlap);
}

/**
 * Get a human-readable summary of shared content (for logging/debugging)
 */
export function getSharedContentSummary(content: SharedContent): string {
  return [
    `Spotify: ${content.spotify.sharedArtists.length} shared artists`,
    `YouTube: ${content.youtube.sharedChannels.length} shared channels`,
    `Personality: ${content.personality.overallCompatibility}% compatible`,
    `Lifestyle: ${content.lifestyle.compatibleValues.length} compatible values`,
  ].join(', ');
}
