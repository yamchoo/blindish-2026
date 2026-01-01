/**
 * BaseStoryCard Component
 * Shared wrapper providing consistent layout and decorative elements for all story cards
 */

import { MeshGradientOverlay } from '@/components/ui';
import { DecorativeBorder, MagicalParticles } from '@/components/ui/fairytale';
import type { PotentialMatch, StoryCardData } from '@/features/matching/types/matching.types';
import { Colors } from '@/lib/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, useColorScheme, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.90 - 20;

export interface BaseStoryCardProps {
  card: StoryCardData;
  match: PotentialMatch;
  children: React.ReactNode;
}

export function BaseStoryCard({
  card,
  match,
  children,
}: BaseStoryCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Select gradient colors based on theme
  const gradientColors = isDark
    ? Colors.fairytale.gradients.dark
    : Colors.fairytale.gradients.light;

  return (
    <View style={styles.container}>
      {/* Fairy Tale Gradient Background - Theme Aware */}
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated Mesh Gradient Overlay */}
      <MeshGradientOverlay
        opacity={0.3}
        speed={0.5}
        animated={true}
        style={StyleSheet.absoluteFill}
      />

      {/* Semi-transparent Card Content Container - NOW SCROLLABLE */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {children}
      </ScrollView>

      {/* Decorative Border */}
      <DecorativeBorder
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        borderRadius={24}
      />

      {/* Magical Particles */}
      <MagicalParticles
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        particleCount={{
          butterflies: 2,
          fireflies: 4,
          sparkles: 5,
        }}
        animated={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
    zIndex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center', // Centers when content is short
    alignItems: 'center',
    minHeight: CARD_HEIGHT - 48, // Ensures centering works for short content
  },
});
