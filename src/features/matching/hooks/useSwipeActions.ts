/**
 * useSwipeActions Hook
 * Handles like/pass actions with optimistic updates
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likeUser, passUser, undoSwipe } from '../services/matchingService';
import type { PotentialMatch, MatchResult, SwipeAction } from '../types/matching.types';

interface SwipeActionsOptions {
  userId: string | null;
  onMatch?: (matchResult: MatchResult) => void;
  onError?: (error: Error, action: SwipeAction) => void;
}

/**
 * Hook for handling swipe actions (like/pass)
 *
 * @param options - Configuration options
 * @returns Swipe action handlers and state
 */
export function useSwipeActions(options: SwipeActionsOptions) {
  const { userId, onMatch, onError } = options;
  const queryClient = useQueryClient();

  // Track last action for undo functionality
  const [lastAction, setLastAction] = useState<{
    action: SwipeAction;
    targetUserId: string;
    match: PotentialMatch;
  } | null>(null);

  /**
   * Like mutation
   */
  const likeMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!userId) throw new Error('User ID is required');
      return likeUser(userId, targetUserId);
    },
    onSuccess: (result, targetUserId) => {
      console.log('Like successful:', result);

      // If it's a match, trigger callback
      if (result.matched && onMatch) {
        onMatch(result);
      }

      // Invalidate matches query to refresh match list
      if (result.matched) {
        queryClient.invalidateQueries({ queryKey: ['matches', userId] });
      }
    },
    onError: (error: Error) => {
      console.error('Like error:', error);
      if (onError) {
        onError(error, 'like');
      }
    },
  });

  /**
   * Pass mutation
   */
  const passMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!userId) throw new Error('User ID is required');
      return passUser(userId, targetUserId);
    },
    onSuccess: () => {
      console.log('Pass successful');
    },
    onError: (error: Error) => {
      console.error('Pass error:', error);
      if (onError) {
        onError(error, 'pass');
      }
    },
  });

  /**
   * Undo mutation
   */
  const undoMutation = useMutation({
    mutationFn: async (params: { targetUserId: string; action: SwipeAction }) => {
      if (!userId) throw new Error('User ID is required');
      return undoSwipe(userId, params.targetUserId, params.action);
    },
    onSuccess: () => {
      console.log('Undo successful');
    },
    onError: (error: Error) => {
      console.error('Undo error:', error);
    },
  });

  /**
   * Handle like action
   *
   * @param targetUserId - User being liked
   * @param match - PotentialMatch object for undo functionality
   */
  const handleLike = async (targetUserId: string, match: PotentialMatch) => {
    setLastAction({ action: 'like', targetUserId, match });

    // Optimistically remove from feed
    queryClient.setQueryData<PotentialMatch[]>(
      ['discoverFeed', userId],
      (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter((m) => m.userId !== targetUserId);
      }
    );

    // Execute mutation
    await likeMutation.mutateAsync(targetUserId);
  };

  /**
   * Handle pass action
   *
   * @param targetUserId - User being passed
   * @param match - PotentialMatch object for undo functionality
   */
  const handlePass = async (targetUserId: string, match: PotentialMatch) => {
    setLastAction({ action: 'pass', targetUserId, match });

    // Optimistically remove from feed
    queryClient.setQueryData<PotentialMatch[]>(
      ['discoverFeed', userId],
      (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter((m) => m.userId !== targetUserId);
      }
    );

    // Execute mutation
    await passMutation.mutateAsync(targetUserId);
  };

  /**
   * Undo the last swipe action
   */
  const handleUndo = async () => {
    if (!lastAction) {
      console.warn('No action to undo');
      return;
    }

    const { action, targetUserId, match } = lastAction;

    // Optimistically add back to feed
    queryClient.setQueryData<PotentialMatch[]>(
      ['discoverFeed', userId],
      (oldData) => {
        if (!oldData) return [match];
        return [match, ...oldData];
      }
    );

    // Execute undo mutation
    await undoMutation.mutateAsync({ targetUserId, action });

    // Clear last action
    setLastAction(null);
  };

  return {
    handleLike,
    handlePass,
    handleUndo,
    canUndo: !!lastAction,
    isLoading: likeMutation.isPending || passMutation.isPending || undoMutation.isPending,
    lastAction,
  };
}
