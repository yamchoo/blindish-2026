/**
 * ProfileCard Component
 * Swipeable card displaying potential match with blurred photo
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Colors } from '@/lib/constants/colors';
import { Typography } from '@/lib/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import type { PotentialMatch } from '@/features/matching/types/matching.types';
import { CompatibilityBadge } from './CompatibilityBadge';
import { GoldenCircleFrame, MeshGradientOverlay } from '@/components/ui';
import { MagicalParticles, DecorativeBorder } from '@/components/ui/fairytale';
import { CompatibilityScoreRow } from './CompatibilityScoreRow';
import { calculateDetailedScores } from '@/utils/compatibility/calculateDetailedScores';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.75;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const ROTATION_ANGLE = 30;

interface ProfileCardProps {
  match: PotentialMatch;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTapCard?: () => void;
  isTop?: boolean;
}

export function ProfileCard({
  match,
  onSwipeLeft,
  onSwipeRight,
  onTapCard,
  isTop = false,
}: ProfileCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const detailedScores = calculateDetailedScores(match);

  // Theme-aware colors
  const cardBackgroundColor = isDark
    ? Colors.fairytale.cardBackground.dark
    : Colors.fairytale.cardBackground.light;

  const textPrimary = isDark ? Colors.dark.text.primary : Colors.light.text.primary;
  const textSecondary = isDark ? Colors.dark.text.secondary : Colors.light.text.secondary;

  // Tap gesture to open story modal
  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (onTapCard) {
        runOnJS(onTapCard)();
      }
    });

  // Pan gesture for swipe actions
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      // Check if swipe threshold is met
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        // Swipe right = like
        if (event.translationX > 0) {
          translateX.value = withSpring(SCREEN_WIDTH * 1.5, { damping: 20 }, () => {
            if (onSwipeRight) runOnJS(onSwipeRight)();
          });
        }
        // Swipe left = pass
        else {
          translateX.value = withSpring(-SCREEN_WIDTH * 1.5, { damping: 20 }, () => {
            if (onSwipeLeft) runOnJS(onSwipeLeft)();
          });
        }
      } else {
        // Return to center if threshold not met
        translateX.value = withSpring(0, { damping: 20 });
        translateY.value = withSpring(0, { damping: 20 });
      }
    });

  // Combine gestures: Tap wins over pan (race condition)
  const combinedGesture = Gesture.Race(tapGesture, panGesture);

  const cardStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-ROTATION_ANGLE, 0, ROTATION_ANGLE],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH],
      [1, 0.3],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
      ],
      opacity,
    };
  });

  const likeStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0.5, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const passStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View style={[styles.card, { backgroundColor: cardBackgroundColor }, cardStyle, !isTop && styles.cardBehind]}>
        {/* Decorative Border */}
        <DecorativeBorder
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          borderRadius={24}
        />

        {/* Magical Particles */}
        {isTop && (
          <MagicalParticles
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            particleCount={{ butterflies: 2, fireflies: 5, sparkles: 7 }}
          />
        )}

        {/* Like stamp */}
        <Animated.View style={[styles.stamp, styles.likeStamp, likeStampStyle]}>
          <Text style={styles.stampText}>LIKE</Text>
        </Animated.View>

        {/* Pass stamp */}
        <Animated.View style={[styles.stamp, styles.passStamp, passStampStyle]}>
          <Text style={styles.stampText}>PASS</Text>
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          {/* Golden Circle with Photo */}
          <View style={styles.circleSection}>
            <GoldenCircleFrame size={190} borderWidth={3}>
              <Image
                source={{ uri: match.primaryPhoto.url }}
                style={styles.circlePhoto}
                blurRadius={20}
              />
              {/* Mesh gradient overlay for mystery effect */}
              <MeshGradientOverlay
                opacity={0.7}
                speed={0.7}
                circular={true}
                size={180}
              />
            </GoldenCircleFrame>
          </View>

          {/* Info section - Centered minimal layout */}
          <View style={styles.infoSection}>
            {/* Name and age */}
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: textPrimary }]}>{match.name}</Text>
              <Text style={[styles.age, { color: textSecondary }]}>, {match.age}</Text>
            </View>

            {/* Distance */}
            {match.distance > 0 && (
              <View style={styles.distanceRow}>
                <Ionicons name="location" size={14} color={textSecondary} />
                <Text style={[styles.distance, { color: textSecondary }]}>{match.distance} miles away</Text>
              </View>
            )}

            {/* Three Compatibility Scores */}
            <CompatibilityScoreRow
              overall={detailedScores.overall}
              interests={detailedScores.interests}
              lifestyle={detailedScores.lifestyle}
              size={52}
            />

            {/* Summary text */}
            <Text style={[styles.summary, { color: textSecondary }]} numberOfLines={3}>
              {match.previewReasons.length > 0
                ? match.previewReasons.join('. ') + '.'
                : match.personality.summary}
            </Text>

            {/* Explore Match button */}
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={onTapCard}
              activeOpacity={0.8}
            >
              <Text style={styles.exploreButtonText}>Explore Match</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    // backgroundColor set dynamically based on theme
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  cardBehind: {
    transform: [{ scale: 0.95 }],
    opacity: 0.7,
  },
  stamp: {
    position: 'absolute',
    top: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 4,
    borderRadius: 8,
    transform: [{ rotate: '-20deg' }],
    zIndex: 10,
  },
  likeStamp: {
    right: 40,
    borderColor: Colors.light.success,
  },
  passStamp: {
    left: 40,
    borderColor: Colors.light.error,
  },
  stampText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 24,
    paddingTop: 32,
  },
  circleSection: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  circlePhoto: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  infoSection: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  name: {
    fontFamily: Typography.fonts.serif, // Cormorant for fairy tale elegance
    fontSize: Typography.sizes['3xl'], // 30px
    fontWeight: Typography.weights.bold,
    // color is dynamic (applied inline)
  },
  age: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes.xl, // 20px
    fontWeight: Typography.weights.semibold,
    // color is dynamic (applied inline)
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  distance: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    // color is dynamic (applied inline)
  },
  summary: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    lineHeight: 22,
    // color is dynamic (applied inline)
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  exploreButton: {
    backgroundColor: Colors.coral,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 28,
    marginTop: 16,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
