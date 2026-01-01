/**
 * MusicalJourney Card
 * Enhanced Spotify with narrative framing
 * Shows shared artists with creative storytelling
 * Always shown, even with 0 artists (uses creative fallback)
 * Blur: 18
 */

import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import { BaseStoryCard, BaseStoryCardProps } from './BaseStoryCard';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing } from '@/lib/constants/typography';
import { Ionicons } from '@expo/vector-icons';

interface SharedArtist {
  name: string;
  imageUrl?: string;
  genres?: string[];
}

export function MusicalJourney(props: BaseStoryCardProps) {
  const { card, match } = props;
  const sharedArtists = (card.data?.sharedArtists || []) as SharedArtist[];
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Theme-aware colors
  const textPrimary = isDark ? Colors.dark.text.primary : Colors.light.text.primary;
  const textSecondary = isDark ? Colors.dark.text.secondary : Colors.light.text.secondary;
  const textTertiary = isDark ? Colors.dark.text.tertiary : Colors.light.text.tertiary;
  const narrativeCardBg = isDark ? Colors.fairytale.cardContent.dark : Colors.fairytale.cardContent.light;
  const artistImageBg = isDark ? Colors.fairytale.surface.dark : Colors.fairytale.surface.light;
  const hasArtists = sharedArtists.length > 0;

  // Generate narrative based on whether they have shared artists
  const generateNarrative = () => {
    const firstName = match.name;

    if (hasArtists) {
      const artistCount = sharedArtists.length;
      const topArtist = sharedArtists[0]?.name;

      return {
        title: 'Musical Connection',
        description: `You and ${firstName} share ${artistCount} ${artistCount === 1 ? 'artist' : 'artists'} in common. Imagine discovering ${topArtist} together on a lazy Sunday morning.`,
      };
    }

    // Creative fallback for no shared artists
    return {
      title: 'Musical Discovery',
      description: `${firstName}'s music taste could introduce you to something entirely new. Sometimes the best playlists come from unexpected places.`,
    };
  };

  const { title, description } = generateNarrative();

  return (
    <BaseStoryCard {...props}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="musical-notes" size={32} color={Colors.interactive.primary} />
          <Text style={[styles.title, { color: textPrimary }]}>{title}</Text>
        </View>

        {/* Narrative Description */}
        <View style={[styles.narrativeCard, { backgroundColor: narrativeCardBg }]}>
          <Text style={[styles.narrativeText, { color: textPrimary }]}>{description}</Text>
        </View>

        {/* Shared Artists (if any) */}
        {hasArtists && (
          <NativeViewGestureHandler disallowInterruption>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.artistsScroll}
              style={styles.artistsContainer}
            >
              {sharedArtists.slice(0, 3).map((artist, index) => (
              <View key={index} style={styles.artistCard}>
                {artist.imageUrl ? (
                  <Image
                    source={{ uri: artist.imageUrl }}
                    style={styles.artistImage}
                  />
                ) : (
                  <View style={[styles.artistImage, styles.artistImagePlaceholder, { backgroundColor: artistImageBg }]}>
                    <Ionicons name="musical-note" size={32} color={textTertiary} />
                  </View>
                )}
                <Text style={[styles.artistName, { color: textPrimary }]} numberOfLines={2}>
                  {artist.name}
                </Text>
                {artist.genres && artist.genres.length > 0 && (
                  <Text style={[styles.artistGenre, { color: textTertiary }]} numberOfLines={1}>
                    {artist.genres[0]}
                  </Text>
                )}
              </View>
              ))}
            </ScrollView>
          </NativeViewGestureHandler>
        )}

        {/* Fallback message for no shared artists */}
        {!hasArtists && (
          <View style={styles.fallbackCard}>
            <Ionicons name="headset-outline" size={48} color={textTertiary} />
            <Text style={[styles.fallbackText, { color: textSecondary }]}>
              Musical tastes waiting to be discovered
            </Text>
          </View>
        )}

        {/* Count Badge */}
        {hasArtists && sharedArtists.length > 3 && (
          <Text style={[styles.countText, { color: textTertiary }]}>
            +{sharedArtists.length - 3} more shared {sharedArtists.length - 3 === 1 ? 'artist' : 'artists'}
          </Text>
        )}
      </View>
    </BaseStoryCard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    // color is dynamic (applied inline)
  },
  narrativeCard: {
    // backgroundColor is dynamic (applied inline)
    borderRadius: 20,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(200, 168, 101, 0.2)',
  },
  narrativeText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    // color is dynamic (applied inline)
    textAlign: 'center',
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
  },
  artistsContainer: {
    maxHeight: 180,
  },
  artistsScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  artistCard: {
    width: 120,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  artistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    // backgroundColor is dynamic (applied inline)
  },
  artistImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200, 168, 101, 0.2)',
  },
  artistName: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    // color is dynamic (applied inline)
    textAlign: 'center',
  },
  artistGenre: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.xs,
    // color is dynamic (applied inline)
    textAlign: 'center',
  },
  fallbackCard: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  fallbackText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    // color is dynamic (applied inline)
    fontStyle: 'italic',
    textAlign: 'center',
  },
  countText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    // color is dynamic (applied inline)
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
