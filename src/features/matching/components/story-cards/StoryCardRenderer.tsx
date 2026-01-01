/**
 * StoryCardRenderer Component
 * Dynamic card renderer based on card type
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StoryCardData, PotentialMatch } from '@/features/matching/types/matching.types';
import { IntroCard } from './IntroCard';
import { PhotoCard } from './PhotoCard';
import { SpotifyCard } from './SpotifyCard';
import { YouTubeCard } from './YouTubeCard';
import { LifestyleCard } from './LifestyleCard';
import { LifeWithBobIntro } from './LifeWithBobIntro';
import { AIPhotoCompatibility } from './AIPhotoCompatibility';
import { MusicalJourney } from './MusicalJourney';
import { InterestingDifferences } from './InterestingDifferences';
import { BaseStoryCard } from './BaseStoryCard';
import { Colors } from '@/lib/constants/colors';
import { Typography } from '@/lib/constants/typography';

interface StoryCardRendererProps {
  card: StoryCardData;
  match: PotentialMatch;
}

export function StoryCardRenderer({
  card,
  match,
}: StoryCardRendererProps) {
  const sharedProps = { card, match };

  switch (card.type) {
    // New narrative cards
    case 'life-with-bob':
      return <LifeWithBobIntro {...sharedProps} />;

    case 'musical-journey':
      return <MusicalJourney {...sharedProps} />;

    case 'ai-photo':
      return <AIPhotoCompatibility {...sharedProps} />;

    case 'interesting-differences':
      return <InterestingDifferences {...sharedProps} />;

    // Original cards (kept for backward compatibility)
    case 'intro':
      return <IntroCard {...sharedProps} />;

    case 'photo':
      return <PhotoCard {...sharedProps} />;

    case 'spotify':
      return <SpotifyCard {...sharedProps} />;

    case 'youtube':
      return <YouTubeCard {...sharedProps} />;

    case 'lifestyle':
      return <LifestyleCard {...sharedProps} />;

    // Placeholder for other cards
    case 'personality':
    case 'decision':
      return (
        <BaseStoryCard {...sharedProps}>
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderTitle}>
              {card.type.charAt(0).toUpperCase() + card.type.slice(1)} Card
            </Text>
            <Text style={styles.placeholderSubtitle}>Coming Soon</Text>
          </View>
        </BaseStoryCard>
      );

    default:
      return (
        <BaseStoryCard {...sharedProps}>
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderTitle}>Unknown Card Type</Text>
          </View>
        </BaseStoryCard>
      );
  }
}

const styles = StyleSheet.create({
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 32,
  },
  placeholderTitle: {
    fontFamily: Typography.fonts.serif,
    fontSize: 30,
    fontWeight: Typography.weights.bold,
    color: Colors.light.text.primary,
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    color: Colors.light.text.secondary,
  },
});
