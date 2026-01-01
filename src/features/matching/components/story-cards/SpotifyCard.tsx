/**
 * SpotifyCard Component
 * Shows shared Spotify artists
 * Blur: 18 (heavy blur)
 */

import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import { BaseStoryCard, BaseStoryCardProps } from './BaseStoryCard';
import { Colors } from '@/lib/constants/colors';
import { Typography } from '@/lib/constants/typography';
import { formatCount } from './utils';

interface SharedArtist {
  name: string;
  image_url?: string;
  genres?: string[];
  followers?: number;
}

export function SpotifyCard(props: BaseStoryCardProps) {
  const { card } = props;
  const sharedArtists = (card.data?.sharedArtists || []) as SharedArtist[];
  const totalShared = card.data?.totalSharedArtists || sharedArtists.length;
  const displayArtists = sharedArtists.slice(0, 3);
  const remainingCount = Math.max(0, totalShared - displayArtists.length);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Theme-aware colors
  const textPrimary = isDark ? Colors.dark.text.primary : Colors.light.text.primary;
  const textSecondary = isDark ? Colors.dark.text.secondary : Colors.light.text.secondary;
  const textTertiary = isDark ? Colors.dark.text.tertiary : Colors.light.text.tertiary;
  const artistItemBg = isDark ? Colors.fairytale.cardContent.dark : Colors.fairytale.cardContent.light;

  return (
    <BaseStoryCard {...props}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Your Music Taste</Text>

        {/* Decorative Line */}
        <View style={styles.decorativeLine} />

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: textSecondary }]}>You both love:</Text>

        {/* Artist List */}
        <NativeViewGestureHandler disallowInterruption>
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          >
            {displayArtists.map((artist, index) => (
            <View key={index} style={[styles.artistItem, { backgroundColor: artistItemBg }]}>
              {/* Artist Image */}
              <View style={styles.artistImageContainer}>
                {artist.image_url ? (
                  <Image
                    source={{ uri: artist.image_url }}
                    style={styles.artistImage}
                  />
                ) : (
                  <View style={[styles.artistImage, styles.artistImagePlaceholder]}>
                    <Text style={styles.placeholderIcon}>🎵</Text>
                  </View>
                )}
              </View>

              {/* Artist Info */}
              <View style={styles.artistInfo}>
                <Text style={[styles.artistName, { color: textPrimary }]} numberOfLines={1}>
                  {artist.name}
                </Text>
                <Text style={[styles.artistMeta, { color: textSecondary }]} numberOfLines={1}>
                  {artist.genres?.[0] || 'Music'}
                  {artist.followers ? ` • ${formatCount(artist.followers)}` : ''}
                </Text>
              </View>
            </View>
            ))}
          </ScrollView>
        </NativeViewGestureHandler>

        {/* More Count */}
        {remainingCount > 0 && (
          <Text style={[styles.moreText, { color: textTertiary }]}>
            + {remainingCount} more shared artist{remainingCount !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </BaseStoryCard>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
  },
  title: {
    fontFamily: Typography.fonts.serif,
    fontSize: 36,
    fontWeight: Typography.weights.bold,
    color: Colors.coral,
    textAlign: 'center',
    marginBottom: 8,
  },
  decorativeLine: {
    width: 60,
    height: 2,
    backgroundColor: Colors.fairytale.gold.deep,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    // color is dynamic (applied inline)
    marginBottom: 16,
  },
  scrollContainer: {
    width: '100%',
    maxHeight: 280,
  },
  listContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor is dynamic (applied inline)
    borderRadius: 12,
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  artistImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
  },
  artistImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  artistImagePlaceholder: {
    backgroundColor: Colors.peach,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 24,
  },
  artistInfo: {
    flex: 1,
    gap: 2,
  },
  artistName: {
    fontFamily: Typography.fonts.sans,
    fontSize: 18,
    fontWeight: Typography.weights.semibold,
    // color is dynamic (applied inline)
  },
  artistMeta: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    // color is dynamic (applied inline)
  },
  moreText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    // color is dynamic (applied inline)
    textAlign: 'center',
    marginTop: 12,
  },
});
