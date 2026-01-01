/**
 * CardStack Component
 * Manages stack of profile cards with swipe functionality
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { PotentialMatch } from '@/features/matching/types/matching.types';
import { ProfileCard } from './ProfileCard';
import { EmptyState } from './EmptyState';
import { MatchStoryModal } from '@/features/matching/components/MatchStoryModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CardStackProps {
  matches: PotentialMatch[];
  onSwipeLeft: (match: PotentialMatch) => void;
  onSwipeRight: (match: PotentialMatch) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function CardStack({
  matches,
  onSwipeLeft,
  onSwipeRight,
  onRefresh,
  isRefreshing = false,
}: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [removedCards, setRemovedCards] = useState<Set<string>>(new Set());

  // Story modal state
  const [storyModalVisible, setStoryModalVisible] = useState(false);
  const [currentStoryMatch, setCurrentStoryMatch] = useState<PotentialMatch | null>(null);

  // Reset index when matches change
  useEffect(() => {
    setCurrentIndex(0);
    setRemovedCards(new Set());
  }, [matches]);

  // Handle swipe left (pass)
  const handleSwipeLeft = () => {
    const currentMatch = matches[currentIndex];
    if (!currentMatch) return;

    // Mark card as removed
    setRemovedCards((prev) => new Set(prev).add(currentMatch.userId));

    // Call parent callback
    onSwipeLeft(currentMatch);

    // Move to next card
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 300); // Wait for animation to complete
  };

  // Handle swipe right (like)
  const handleSwipeRight = () => {
    const currentMatch = matches[currentIndex];
    if (!currentMatch) return;

    // Mark card as removed
    setRemovedCards((prev) => new Set(prev).add(currentMatch.userId));

    // Call parent callback
    onSwipeRight(currentMatch);

    // Move to next card
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 300); // Wait for animation to complete
  };

  // Handle card tap to open story modal
  const handleCardTap = () => {
    const currentMatch = matches[currentIndex];
    if (!currentMatch) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentStoryMatch(currentMatch);
    setStoryModalVisible(true);
  };

  // Handle story modal close
  const handleStoryModalClose = () => {
    setStoryModalVisible(false);
    // Don't clear currentStoryMatch immediately to prevent flicker during exit animation
    setTimeout(() => {
      setCurrentStoryMatch(null);
    }, 300);
  };

  // Handle match from story modal (user liked from cards or decision)
  const handleStoryMatch = (reaction?: any) => {
    console.log('[CardStack] Story match:', reaction);

    // Close modal
    setStoryModalVisible(false);

    // Trigger the same flow as swipe right
    setTimeout(() => {
      handleSwipeRight();
    }, 300);
  };

  // Handle pass from story modal
  const handleStoryPass = () => {
    console.log('[CardStack] Story pass');

    // Close modal
    setStoryModalVisible(false);

    // Trigger the same flow as swipe left
    setTimeout(() => {
      handleSwipeLeft();
    }, 300);
  };

  // Filter out removed cards
  const visibleMatches = matches.filter(
    (match) => !removedCards.has(match.userId)
  );

  // Check if we're out of matches
  if (visibleMatches.length === 0 || currentIndex >= visibleMatches.length) {
    return (
      <EmptyState
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />
    );
  }

  // Show top 2 cards for depth effect
  const topCard = visibleMatches[currentIndex];
  const nextCard = visibleMatches[currentIndex + 1];

  return (
    <View style={styles.container}>
      {/* Next card (behind) */}
      {nextCard && (
        <View style={styles.cardContainer}>
          <ProfileCard match={nextCard} isTop={false} />
        </View>
      )}

      {/* Top card (interactive) */}
      {topCard && (
        <View style={styles.cardContainer}>
          <ProfileCard
            match={topCard}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onTapCard={handleCardTap}
            isTop={true}
          />
        </View>
      )}

      {/* Story Modal */}
      {currentStoryMatch && (
        <MatchStoryModal
          visible={storyModalVisible}
          match={currentStoryMatch}
          onClose={handleStoryModalClose}
          onMatch={handleStoryMatch}
          onPass={handleStoryPass}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
