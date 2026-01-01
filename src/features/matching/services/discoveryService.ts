/**
 * Discovery Service
 * Fetches and scores potential matches for the discover feed
 */

import { supabase } from '@/lib/supabase/client';
import type { Profile, PersonalityProfile, Photo } from '@/lib/supabase/client';
import type {
  PotentialMatch,
  LifestylePreferences,
  BigFiveScores,
} from '../types/matching.types';
import {
  calculateBigFiveDistance,
  calculateJaccardSimilarity,
  getLifestyleCompatibility,
  calculateDistance,
  checkDealbreakers,
} from '../utils/compatibilityHelpers';

/**
 * Extended profile type with related data
 */
interface ProfileWithRelations extends Profile {
  personality_profiles: PersonalityProfile | null;
  photos: Photo[];
}

/**
 * Fetch potential matches for the current user
 *
 * @param userId - Current user's ID
 * @param limit - Number of matches to fetch (default: 50)
 * @param offset - Pagination offset (default: 0)
 * @returns Array of potential matches sorted by compatibility score
 */
export async function fetchPotentialMatches(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<PotentialMatch[]> {
  try {
    // 1. Fetch current user's profile with personality data
    const { data: currentUserProfile, error: currentUserError } = await supabase
      .from('profiles')
      .select('*, personality_profiles(*)')
      .eq('id', userId)
      .single();

    if (currentUserError || !currentUserProfile) {
      console.error('Error fetching current user profile:', currentUserError);
      throw new Error('Failed to fetch current user profile');
    }

    // Ensure user has completed onboarding
    if (!currentUserProfile.onboarding_completed) {
      throw new Error('User must complete onboarding first');
    }

    // 2. Get list of excluded user IDs (already liked, passed, matched, blocked)
    const { data: excludedIds, error: excludedError } = await supabase.rpc(
      'get_excluded_user_ids',
      { target_user_id: userId }
    );

    if (excludedError) {
      console.error('Error fetching excluded IDs:', excludedError);
      // Continue with empty exclusion list rather than failing
    }

    const excludedUserIds = excludedIds?.map((row: { excluded_id: string }) => row.excluded_id) || [];
    // Always exclude self
    excludedUserIds.push(userId);

    console.log('Excluded user IDs:', excludedUserIds);

    // 3. Build query with filters
    let query = supabase
      .from('profiles')
      .select('*, personality_profiles(*), photos(*)')
      .eq('onboarding_completed', true); // Only show users who finished onboarding

    // Only exclude users if there are any to exclude
    if (excludedUserIds.length > 0) {
      query = query.not('id', 'in', `(${excludedUserIds.join(',')})`);
    }

    query = query.order('last_active_at', { ascending: false }); // Prioritize recently active users

    // Filter by gender preference (mutual match required)
    // Current user's gender must be in potential match's looking_for array
    // Potential match's gender must be in current user's looking_for array
    console.log('Current user gender:', currentUserProfile.gender);
    console.log('Current user looking_for:', currentUserProfile.looking_for);

    if (currentUserProfile.gender) {
      query = query.contains('looking_for', [currentUserProfile.gender]);
    }
    if (currentUserProfile.looking_for && currentUserProfile.looking_for.length > 0) {
      // Gender is a single value, not an array, so we need to check if it's IN the array
      query = query.in('gender', currentUserProfile.looking_for);
    }

    // Filter by age range (±10 years configurable)
    if (currentUserProfile.age) {
      const minAge = currentUserProfile.age - 10;
      const maxAge = currentUserProfile.age + 10;
      query = query.gte('age', minAge).lte('age', maxAge);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    console.log('Executing query for potential matches...');
    const { data: candidates, error: candidatesError } = await query;

    if (candidatesError) {
      console.error('Error fetching candidates:', {
        message: candidatesError.message,
        code: candidatesError.code,
        details: candidatesError.details,
        hint: candidatesError.hint,
      });
      throw new Error(`Failed to fetch potential matches: ${candidatesError.message}`);
    }

    console.log(`Found ${candidates?.length || 0} candidates`);

    if (!candidates || candidates.length === 0) {
      console.log('No candidates found, returning empty array');
      return [];
    }

    // 4. Calculate compatibility scores and transform to PotentialMatch format
    const potentialMatches: PotentialMatch[] = [];

    console.log(`Processing ${candidates.length} candidates...`);

    for (const candidate of candidates as ProfileWithRelations[]) {
      console.log(`\nProcessing candidate: ${candidate.name} (${candidate.id})`);

      // Skip if missing required data
      if (!candidate.personality_profiles) {
        console.warn(`Skipping candidate ${candidate.id}: missing personality profile`);
        continue;
      }

      console.log(`✓ Has personality profile`);
      console.log(`✓ Has ${candidate.photos?.length || 0} photos`);

      // Check dealbreakers
      const currentUserLifestyle: LifestylePreferences = {
        drinking: currentUserProfile.drinking,
        smoking: currentUserProfile.smoking,
        marijuana: currentUserProfile.marijuana_use,
        religion: currentUserProfile.religion || [],
        politics: currentUserProfile.politics,
        wantsKids: currentUserProfile.wants_kids,
      };

      const candidateLifestyle: LifestylePreferences = {
        drinking: candidate.drinking,
        smoking: candidate.smoking,
        marijuana: candidate.marijuana_use,
        religion: candidate.religion || [],
        politics: candidate.politics,
        wantsKids: candidate.wants_kids,
      };

      const dealbreakerCheck = checkDealbreakers(
        {
          id: userId,
          gender: currentUserProfile.gender || '',
          lookingFor: currentUserProfile.looking_for || [],
          lifestyle: currentUserLifestyle,
          personalityProfile: currentUserProfile.personality_profiles
            ? {
                openness: currentUserProfile.personality_profiles.openness,
                conscientiousness: currentUserProfile.personality_profiles.conscientiousness,
                extraversion: currentUserProfile.personality_profiles.extraversion,
                agreeableness: currentUserProfile.personality_profiles.agreeableness,
                neuroticism: currentUserProfile.personality_profiles.neuroticism,
                traits: currentUserProfile.personality_profiles.traits || [],
                interests: currentUserProfile.personality_profiles.interests || [],
                values: currentUserProfile.personality_profiles.values || [],
                summary: currentUserProfile.personality_profiles.summary || '',
              }
            : undefined,
        },
        {
          id: candidate.id,
          gender: candidate.gender || '',
          lookingFor: candidate.looking_for || [],
          lifestyle: candidateLifestyle,
          personalityProfile: candidate.personality_profiles
            ? {
                openness: candidate.personality_profiles.openness,
                conscientiousness: candidate.personality_profiles.conscientiousness,
                extraversion: candidate.personality_profiles.extraversion,
                agreeableness: candidate.personality_profiles.agreeableness,
                neuroticism: candidate.personality_profiles.neuroticism,
                traits: candidate.personality_profiles.traits || [],
                interests: candidate.personality_profiles.interests || [],
                values: candidate.personality_profiles.values || [],
                summary: candidate.personality_profiles.summary || '',
              }
            : undefined,
        }
      );

      console.log(`Checking dealbreakers...`);

      if (!dealbreakerCheck.compatible) {
        console.log(`✗ Filtered out ${candidate.name}: ${dealbreakerCheck.reason}`);
        continue;
      }

      console.log(`✓ Passed dealbreaker check`);

      // Calculate compatibility scores
      console.log('Current user personality:', {
        openness: currentUserProfile.personality_profiles!.openness,
        conscientiousness: currentUserProfile.personality_profiles!.conscientiousness,
        extraversion: currentUserProfile.personality_profiles!.extraversion,
        agreeableness: currentUserProfile.personality_profiles!.agreeableness,
        neuroticism: currentUserProfile.personality_profiles!.neuroticism,
      });
      console.log('Candidate personality:', {
        openness: candidate.personality_profiles.openness,
        conscientiousness: candidate.personality_profiles.conscientiousness,
        extraversion: candidate.personality_profiles.extraversion,
        agreeableness: candidate.personality_profiles.agreeableness,
        neuroticism: candidate.personality_profiles.neuroticism,
      });

      const personalityScore = calculateBigFiveDistance(
        {
          openness: currentUserProfile.personality_profiles!.openness,
          conscientiousness: currentUserProfile.personality_profiles!.conscientiousness,
          extraversion: currentUserProfile.personality_profiles!.extraversion,
          agreeableness: currentUserProfile.personality_profiles!.agreeableness,
          neuroticism: currentUserProfile.personality_profiles!.neuroticism,
        },
        {
          openness: candidate.personality_profiles.openness,
          conscientiousness: candidate.personality_profiles.conscientiousness,
          extraversion: candidate.personality_profiles.extraversion,
          agreeableness: candidate.personality_profiles.agreeableness,
          neuroticism: candidate.personality_profiles.neuroticism,
        }
      );

      const interestsScore = calculateJaccardSimilarity(
        currentUserProfile.personality_profiles!.interests || [],
        candidate.personality_profiles.interests || []
      );

      const valuesScore = calculateJaccardSimilarity(
        currentUserProfile.personality_profiles!.values || [],
        candidate.personality_profiles.values || []
      );

      const combinedInterestsScore = Math.round((interestsScore + valuesScore) / 2);

      const lifestyleResult = getLifestyleCompatibility(
        currentUserLifestyle,
        candidateLifestyle
      );

      console.log('Compatibility scores:', {
        personalityScore,
        interestsScore,
        valuesScore,
        combinedInterestsScore,
        lifestyleScore: lifestyleResult.score,
      });

      // Calculate overall compatibility (50% personality, 25% interests, 25% lifestyle)
      const overallScore = Math.round(
        personalityScore * 0.5 +
          combinedInterestsScore * 0.25 +
          lifestyleResult.score * 0.25
      );

      console.log('Overall score:', overallScore);

      // Calculate distance (if location data available)
      let distance = 0;
      if (
        currentUserProfile.location_lat &&
        currentUserProfile.location_lng &&
        candidate.location_lat &&
        candidate.location_lng
      ) {
        distance = calculateDistance(
          currentUserProfile.location_lat,
          currentUserProfile.location_lng,
          candidate.location_lat,
          candidate.location_lng
        );

        console.log(`Distance: ${distance} miles`);

        // Optional: Filter by distance (e.g., within 50 miles)
        if (distance > 50) {
          console.log(`✗ Filtered out ${candidate.name}: too far (${distance} miles)`);
          continue;
        }

        console.log(`✓ Within distance range`);
      } else {
        console.log(`⚠ No location data, skipping distance check`);
      }

      // Generate preview reasons (top 3 compatibility highlights)
      const previewReasons: string[] = [];

      if (personalityScore >= 80) {
        previewReasons.push('Very similar personalities');
      } else if (personalityScore >= 70) {
        previewReasons.push('Compatible personalities');
      }

      const sharedInterests = (currentUserProfile.personality_profiles!.interests || []).filter(
        (interest) => (candidate.personality_profiles!.interests || []).includes(interest)
      );

      if (sharedInterests.length > 0) {
        const topShared = sharedInterests.slice(0, 2).join(' & ');
        previewReasons.push(`Both love ${topShared}`);
      }

      if (lifestyleResult.compatible.includes('wants_kids')) {
        if (currentUserProfile.wants_kids === 'yes') {
          previewReasons.push('Both want kids');
        } else if (currentUserProfile.wants_kids === 'no') {
          previewReasons.push('Both child-free');
        }
      }

      if (
        lifestyleResult.compatible.includes('religion') &&
        currentUserProfile.religion &&
        currentUserProfile.religion.length > 0
      ) {
        previewReasons.push('Share religious values');
      }

      // Get primary photo
      const primaryPhoto = candidate.photos.find((p) => p.is_primary) || candidate.photos[0];

      // Build PotentialMatch object
      const potentialMatch: PotentialMatch = {
        userId: candidate.id,
        name: candidate.name || 'Unknown',
        age: candidate.age || 0,
        distance,
        primaryPhoto: {
          url: primaryPhoto?.storage_url || '',
          blurhash: primaryPhoto?.blurhash,
        },
        personality: {
          summary: candidate.personality_profiles.summary || '',
          traits: candidate.personality_profiles.traits || [],
          interests: candidate.personality_profiles.interests || [],
          values: candidate.personality_profiles.values || [],
          scores: {
            openness: candidate.personality_profiles.openness,
            conscientiousness: candidate.personality_profiles.conscientiousness,
            extraversion: candidate.personality_profiles.extraversion,
            agreeableness: candidate.personality_profiles.agreeableness,
            neuroticism: candidate.personality_profiles.neuroticism,
          },
        },
        compatibilityScore: overallScore,
        previewReasons: previewReasons.slice(0, 3), // Top 3 reasons
      };

      potentialMatches.push(potentialMatch);
      console.log(`✓ Added ${candidate.name} to potential matches (score: ${overallScore}%)`);
    }

    // 5. Sort by compatibility score (highest first)
    potentialMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    console.log(`Found ${potentialMatches.length} potential matches for user ${userId}`);

    return potentialMatches;
  } catch (error) {
    console.error('Error in fetchPotentialMatches:', error);
    throw error;
  }
}

/**
 * Refresh discover feed with new matches
 * Useful for "refresh" button in UI
 */
export async function refreshDiscoverFeed(userId: string): Promise<PotentialMatch[]> {
  // Fetch fresh set of matches (first 50)
  return fetchPotentialMatches(userId, 50, 0);
}

/**
 * Load more matches for pagination
 */
export async function loadMoreMatches(
  userId: string,
  currentCount: number
): Promise<PotentialMatch[]> {
  // Fetch next batch starting from current count
  return fetchPotentialMatches(userId, 50, currentCount);
}
