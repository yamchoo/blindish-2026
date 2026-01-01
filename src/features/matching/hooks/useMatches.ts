/**
 * useMatches Hook
 * Manages user's match list
 */

import { useQuery } from '@tanstack/react-query';
import { getUserMatches } from '../services/matchingService';

/**
 * Hook for fetching and managing user's matches
 *
 * @param userId - Current user's ID
 * @param enabled - Whether to enable the query (default: true)
 * @returns React Query result with matches
 */
export function useMatches(userId: string | null, enabled: boolean = true) {
  const query = useQuery({
    queryKey: ['matches', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return getUserMatches(userId);
    },
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: true, // Refetch when app comes to foreground
  });

  return {
    matches: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
