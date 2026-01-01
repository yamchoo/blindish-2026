/**
 * Match Story Modal
 *
 * Full-screen modal that displays 5-7 story cards revealing why two users match.
 * Uses Instagram Stories-style horizontal navigation with progressive photo unblur.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedBackground } from '@/components/ui';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing } from '@/lib/constants/typography';
import { useAuthStore } from '@/stores/authStore';
import { useStoryCards } from '../hooks/useStoryCards';
import type { PotentialMatch } from '@/features/matching/types';
import { StoryCardRenderer, DotPagination, CardActionButtons } from './story-cards';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// Props Interface
// ============================================================================

interface MatchStoryModalProps {
  /** Whether the modal is visible */
  visible: boolean;

  /** The potential match to show story cards for */
  match: PotentialMatch;

  /** Callback when user closes modal without action */
  onClose: () => void;

  /** Callback when user likes the match (from story cards or decision card) */
  onMatch: (reaction?: MatchReaction) => void;

  /** Callback when user passes on the match */
  onPass?: () => void;
}

/** Reaction data when user likes specific cards */
export interface MatchReaction {
  type: 'overall' | 'card-based';
  likedCards?: Array<{
    cardType: string;
    content: any;
  }>;
}

// ============================================================================
// Component
// ============================================================================

export function MatchStoryModal({
  visible,
  match,
  onClose,
  onMatch,
  onPass,
}: MatchStoryModalProps) {
  // Theme
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Get current user ID from auth store
  const { user } = useAuthStore();
  const currentUserId = user?.id || '';

  // Use story cards hook to manage card state and data
  const {
    cards,
    currentIndex,
    totalCards,
    goToNext,
    goToPrevious,
    goToCard,
    isLoading,
    error,
    sharedContent,
  } = useStoryCards(currentUserId, match);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Reanimated values for swipe gesture
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Theme-aware colors
  const containerBackground = isDark ? Colors.dark.background : Colors.light.background;
  const closeButtonBackground = isDark ? 'rgba(42, 31, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const textPrimary = isDark ? Colors.dark.text.primary : Colors.light.text.primary;
  const textSecondary = isDark ? Colors.dark.text.secondary : Colors.light.text.secondary;
  const textTertiary = isDark ? Colors.dark.text.tertiary : Colors.light.text.tertiary;
  const placeholderBackground = isDark ? 'rgba(42, 31, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const errorColor = isDark ? Colors.dark.error : Colors.light.error;

  // Entrance animation when modal opens
  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations when closing
      fadeAnim.setValue(0);
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate out before closing
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleOverallLike = () => {
    console.log('[MatchStoryModal] Overall like');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Pass overall match decision to parent
    onMatch({
      type: 'overall',
      likedCards: [],
    });
  };

  const handlePass = () => {
    console.log('[MatchStoryModal] Pass');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onPass?.();
    handleClose();
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      goToNext();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      goToPrevious();
    }
  };

  const handleDotPress = (index: number) => {
    if (index !== currentIndex && index >= 0 && index < totalCards) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      goToCard(index);
    }
  };

  // Animated style for card with swipe feedback
  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
    };
  });

  // Swipe gesture handling with animation
  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Apply translation with resistance on edges
      const maxTranslation = SCREEN_WIDTH * 0.3;
      const translation = event.translationX;

      // Add resistance at boundaries
      if (
        (translation < 0 && currentIndex === totalCards - 1) || // No more cards to right
        (translation > 0 && currentIndex === 0) // No more cards to left
      ) {
        translateX.value = translation * 0.2; // Heavy resistance
      } else {
        translateX.value = Math.max(-maxTranslation, Math.min(maxTranslation, translation));
      }

      // Subtle opacity change
      opacity.value = 1 - Math.abs(translation) / (SCREEN_WIDTH * 2);
    })
    .onEnd((event) => {
      const swipeThreshold = 50;

      // Determine if swipe should trigger navigation
      if (event.translationX < -swipeThreshold && currentIndex < totalCards - 1) {
        // Swipe left -> next card
        runOnJS(handleNext)();
      } else if (event.translationX > swipeThreshold && currentIndex > 0) {
        // Swipe right -> previous card
        runOnJS(handlePrevious)();
      }

      // Spring back to center
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
      opacity.value = withTiming(1, { duration: 200 });
    });

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="none" // We handle animations manually
      transparent={false}
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={[styles.container, { backgroundColor: containerBackground }]}>
        <AnimatedBackground opacity={0.3} speed={0.3} />

        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <View style={[styles.closeButtonCircle, { backgroundColor: closeButtonBackground }]}>
                <Ionicons name="close" size={24} color={textPrimary} />
              </View>
            </TouchableOpacity>

            {/* Story Cards Container with Gestures */}
            <View style={styles.cardsContainer}>
              <GestureDetector gesture={swipeGesture}>
                <Reanimated.View style={[styles.cardWrapper, animatedCardStyle]}>
                  {isLoading ? (
                    <View style={[styles.cardPlaceholder, { backgroundColor: placeholderBackground }]}>
                      <View style={styles.placeholderContent}>
                        <ActivityIndicator size="large" color={Colors.interactive.primary} />
                        <Text style={[styles.placeholderHint, { color: textTertiary }]}>Loading your story...</Text>
                      </View>
                    </View>
                  ) : error ? (
                    <View style={[styles.cardPlaceholder, { backgroundColor: placeholderBackground }]}>
                      <View style={styles.placeholderContent}>
                        <Ionicons name="alert-circle" size={80} color={errorColor} />
                        <Text style={[styles.placeholderTitle, { color: textPrimary }]}>Oops!</Text>
                        <Text style={[styles.placeholderHint, { color: textTertiary }]}>{error}</Text>
                      </View>
                    </View>
                  ) : cards.length > 0 ? (
                    <>
                      <StoryCardRenderer
                        card={cards[currentIndex]}
                        match={match}
                      />
                      {/* Tap zones for navigation (Instagram Stories style) */}
                      <TouchableOpacity
                        style={styles.tapZoneLeft}
                        onPress={handlePrevious}
                        activeOpacity={1}
                      />
                      <TouchableOpacity
                        style={styles.tapZoneRight}
                        onPress={handleNext}
                        activeOpacity={1}
                      />
                    </>
                  ) : (
                    <View style={[styles.cardPlaceholder, { backgroundColor: placeholderBackground }]}>
                      <View style={styles.placeholderContent}>
                        <Ionicons name="alert-circle" size={80} color={textSecondary} />
                        <Text style={[styles.placeholderTitle, { color: textPrimary }]}>No cards available</Text>
                      </View>
                    </View>
                  )}
                </Reanimated.View>
              </GestureDetector>
            </View>

            {/* Dot Pagination */}
            {!isLoading && !error && cards.length > 0 && (
              <DotPagination
                totalDots={totalCards}
                currentIndex={currentIndex}
                onDotPress={handleDotPress}
              />
            )}

            {/* Card Action Buttons (Heart/X) */}
            {!isLoading && !error && cards.length > 0 && (
              <CardActionButtons
                onLike={handleOverallLike}
                onPass={handlePass}
              />
            )}
          </Animated.View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor is dynamic (applied inline)
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 4,
    right: Spacing.lg,
    zIndex: 100,
  },
  closeButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    // backgroundColor is dynamic (applied inline)
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.95 - 40,
    position: 'relative',
  },
  tapZoneLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    zIndex: 50,
  },
  tapZoneRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    zIndex: 50,
  },
  cardPlaceholder: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.95 - 40,
    borderRadius: 24,
    // backgroundColor is dynamic (applied inline)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  placeholderContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  placeholderTitle: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
    // color is dynamic (applied inline)
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.xl,
    // color is dynamic (applied inline)
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  placeholderHint: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    // color is dynamic (applied inline)
    marginTop: Spacing.xl,
    textAlign: 'center',
  },
  navButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.interactive.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    backgroundColor: Colors.light.border,
    opacity: 0.5,
  },
  likeTestButton: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 24,
    backgroundColor: Colors.interactive.primary,
    alignItems: 'center',
  },
  navButtonText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: '#FFFFFF',
  },
});
