/**
 * Matching Service
 * Handles like/pass actions and match creation
 */

import { supabase } from '@/lib/supabase/client';
import type { CompatibilityBreakdown, MatchResult, SwipeAction } from '../types/matching.types';

/**
 * Record a "like" action and check for mutual match
 *
 * @param currentUserId - Current user's ID
 * @param likedUserId - User being liked
 * @returns MatchResult with match details if mutual like detected
 */
export async function likeUser(
  currentUserId: string,
  likedUserId: string
): Promise<MatchResult> {
  try {
    // 1. Insert like record
    const { error: likeError } = await supabase.from('likes').insert({
      liker_id: currentUserId,
      liked_id: likedUserId,
    });

    if (likeError) {
      // Check if like already exists (duplicate constraint)
      if (likeError.code === '23505') {
        console.warn('Like already exists, skipping...');
      } else {
        console.error('Error inserting like:', likeError);
        throw new Error('Failed to record like');
      }
    }

    // 2. Check for mutual like using helper function
    const { data: mutualLikeData, error: mutualLikeError } = await supabase.rpc(
      'check_mutual_like',
      {
        user1: currentUserId,
        user2: likedUserId,
      }
    );

    if (mutualLikeError) {
      console.error('Error checking mutual like:', mutualLikeError);
      // Don't throw - just return no match
      return { matched: false };
    }

    // 3. If mutual like detected, create match
    if (mutualLikeData) {
      console.log(`Mutual like detected between ${currentUserId} and ${likedUserId}!`);

      // Call Edge Function to calculate compatibility
      const compatibility = await calculateCompatibility(currentUserId, likedUserId);

      // Create match record
      const matchId = await createMatch(currentUserId, likedUserId, compatibility);

      // Create notification for the other user
      await createMatchNotification(likedUserId, currentUserId, matchId);

      return {
        matched: true,
        matchId,
        compatibility,
        otherUserId: likedUserId,
      };
    }

    // No mutual match yet
    return { matched: false };
  } catch (error) {
    console.error('Error in likeUser:', error);
    throw error;
  }
}

/**
 * Record a "pass" action
 *
 * @param currentUserId - Current user's ID
 * @param passedUserId - User being passed
 */
export async function passUser(
  currentUserId: string,
  passedUserId: string
): Promise<void> {
  try {
    const { error } = await supabase.from('passes').insert({
      passer_id: currentUserId,
      passed_id: passedUserId,
    });

    if (error) {
      // Check if pass already exists (duplicate constraint)
      if (error.code === '23505') {
        console.warn('Pass already exists, skipping...');
        return;
      }

      console.error('Error inserting pass:', error);
      throw new Error('Failed to record pass');
    }

    console.log(`User ${currentUserId} passed on ${passedUserId}`);
  } catch (error) {
    console.error('Error in passUser:', error);
    throw error;
  }
}

/**
 * Call Edge Function to calculate compatibility between two users
 *
 * @param user1Id - First user's ID
 * @param user2Id - Second user's ID
 * @returns Detailed compatibility breakdown
 */
async function calculateCompatibility(
  user1Id: string,
  user2Id: string
): Promise<CompatibilityBreakdown> {
  try {
    const { data, error } = await supabase.functions.invoke('calculate-compatibility', {
      body: {
        user1_id: user1Id,
        user2_id: user2Id,
      },
    });

    if (error) {
      console.error('Error calling calculate-compatibility:', error);
      throw new Error('Failed to calculate compatibility');
    }

    if (!data) {
      throw new Error('No data returned from compatibility calculation');
    }

    return data as CompatibilityBreakdown;
  } catch (error) {
    console.error('Error in calculateCompatibility:', error);
    throw error;
  }
}

/**
 * Create a match record in the database
 *
 * @param user1Id - First user's ID
 * @param user2Id - Second user's ID
 * @param compatibility - Compatibility breakdown from Edge Function
 * @returns Match ID
 */
async function createMatch(
  user1Id: string,
  user2Id: string,
  compatibility: CompatibilityBreakdown
): Promise<string> {
  try {
    // Always store with lower ID first for consistency
    const [userId1, userId2] =
      user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

    const { data: match, error } = await supabase
      .from('matches')
      .insert({
        user1_id: userId1,
        user2_id: userId2,
        compatibility_score: compatibility.overallScore,
        compatibility_breakdown: compatibility,
        blur_points: 0, // Start with 0 points
        is_unblurred: false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating match:', error);
      throw new Error('Failed to create match');
    }

    if (!match) {
      throw new Error('Match created but no ID returned');
    }

    console.log(`Match created: ${match.id}`);
    return match.id;
  } catch (error) {
    console.error('Error in createMatch:', error);
    throw error;
  }
}

/**
 * Create a notification for a new match
 *
 * @param recipientId - User receiving the notification
 * @param matchedUserId - User they matched with
 * @param matchId - Match ID
 */
async function createMatchNotification(
  recipientId: string,
  matchedUserId: string,
  matchId: string
): Promise<void> {
  try {
    // Fetch matched user's name for notification
    const { data: matchedUser } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', matchedUserId)
      .single();

    const matchedUserName = matchedUser?.name || 'Someone';

    const { error } = await supabase.from('notifications').insert({
      user_id: recipientId,
      type: 'new_match',
      title: "It's a Match! 🎉",
      body: `You matched with ${matchedUserName}!`,
      data: {
        match_id: matchId,
        matched_user_id: matchedUserId,
      },
    });

    if (error) {
      console.error('Error creating notification:', error);
      // Don't throw - notification failure shouldn't break match creation
    }
  } catch (error) {
    console.error('Error in createMatchNotification:', error);
    // Don't throw - notification failure shouldn't break match creation
  }
}

/**
 * Undo the last swipe action (like or pass)
 * This is useful for implementing an "undo" button
 *
 * @param currentUserId - Current user's ID
 * @param targetUserId - User to undo action for
 * @param action - Action to undo ('like' or 'pass')
 */
export async function undoSwipe(
  currentUserId: string,
  targetUserId: string,
  action: SwipeAction
): Promise<void> {
  try {
    if (action === 'like') {
      // Delete like record
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('liker_id', currentUserId)
        .eq('liked_id', targetUserId);

      if (error) {
        console.error('Error undoing like:', error);
        throw new Error('Failed to undo like');
      }
    } else if (action === 'pass') {
      // Delete pass record
      const { error } = await supabase
        .from('passes')
        .delete()
        .eq('passer_id', currentUserId)
        .eq('passed_id', targetUserId);

      if (error) {
        console.error('Error undoing pass:', error);
        throw new Error('Failed to undo pass');
      }
    }

    console.log(`Undid ${action} for user ${targetUserId}`);
  } catch (error) {
    console.error('Error in undoSwipe:', error);
    throw error;
  }
}

/**
 * Get all matches for a user
 * Useful for displaying matches in chat list
 *
 * @param userId - User's ID
 * @returns Array of matches with compatibility details
 */
export async function getUserMatches(userId: string): Promise<any[]> {
  try {
    // Query matches where user is either user1 or user2
    const { data: matches, error } = await supabase
      .from('matches')
      .select(
        `
        *,
        user1:profiles!matches_user1_id_fkey(id, name, age, photos(storage_url, is_primary)),
        user2:profiles!matches_user2_id_fkey(id, name, age, photos(storage_url, is_primary))
      `
      )
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching matches:', error);
      throw new Error('Failed to fetch matches');
    }

    return matches || [];
  } catch (error) {
    console.error('Error in getUserMatches:', error);
    throw error;
  }
}

/**
 * Check if two users are already matched
 *
 * @param user1Id - First user's ID
 * @param user2Id - Second user's ID
 * @returns True if matched, false otherwise
 */
export async function areUsersMatched(
  user1Id: string,
  user2Id: string
): Promise<boolean> {
  try {
    const [userId1, userId2] =
      user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .eq('user1_id', userId1)
      .eq('user2_id', userId2)
      .maybeSingle();

    if (error) {
      console.error('Error checking match status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in areUsersMatched:', error);
    return false;
  }
}
