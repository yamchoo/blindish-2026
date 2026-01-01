/**
 * useDiscoverFeed Hook
 * Manages discover feed state with React Query
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPotentialMatches, refreshDiscoverFeed } from '../services/discoveryService';
import type { PotentialMatch } from '../types/matching.types';

/**
 * Hook for managing discover feed data
 *
 * @param userId - Current user's ID
 * @param enabled - Whether to enable the query (default: true)
 * @returns React Query result with potential matches
 */
export function useDiscoverFeed(userId: string | null, enabled: boolean = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['discoverFeed', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return fetchPotentialMatches(userId, 50, 0);
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  });

  /**
   * Refresh the discover feed with new matches
   */
  const refresh = async () => {
    if (!userId) return;

    await queryClient.invalidateQueries({ queryKey: ['discoverFeed', userId] });
    return query.refetch();
  };

  /**
   * Remove a user from the current feed (after swiping)
   * This provides optimistic updates for better UX
   */
  const removeFromFeed = (userIdToRemove: string) => {
    queryClient.setQueryData<PotentialMatch[]>(
      ['discoverFeed', userId],
      (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter((match) => match.userId !== userIdToRemove);
      }
    );
  };

  /**
   * Add a user back to the feed (for undo functionality)
   */
  const addToFeed = (match: PotentialMatch) => {
    queryClient.setQueryData<PotentialMatch[]>(
      ['discoverFeed', userId],
      (oldData) => {
        if (!oldData) return [match];
        // Add to the beginning of the array
        return [match, ...oldData];
      }
    );
  };

  return {
    matches: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isRefetching: query.isRefetching,
    refresh,
    removeFromFeed,
    addToFeed,
  };
}

/**
 * Hook for loading more matches (pagination)
 *
 * @param userId - Current user's ID
 * @param currentMatches - Currently loaded matches
 * @returns Function to load more matches
 */
export function useLoadMoreMatches(
  userId: string | null,
  currentMatches: PotentialMatch[]
) {
  const queryClient = useQueryClient();

  const loadMore = async () => {
    if (!userId) return;

    const offset = currentMatches.length;
    const newMatches = await fetchPotentialMatches(userId, 50, offset);

    // Append new matches to existing data
    queryClient.setQueryData<PotentialMatch[]>(
      ['discoverFeed', userId],
      (oldData) => {
        if (!oldData) return newMatches;
        return [...oldData, ...newMatches];
      }
    );

    return newMatches;
  };

  return { loadMore };
}
