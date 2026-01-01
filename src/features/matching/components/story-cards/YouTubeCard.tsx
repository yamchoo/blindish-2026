/**
 * YouTubeCard Component
 * Shows shared YouTube channels
 * Blur: 12 (medium blur - 50% reveal)
 */

import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import { BaseStoryCard, BaseStoryCardProps } from './BaseStoryCard';
import { Colors } from '@/lib/constants/colors';
import { Typography } from '@/lib/constants/typography';

interface SharedChannel {
  channel_title: string;
  thumbnail?: string;
  description?: string;
}

export function YouTubeCard(props: BaseStoryCardProps) {
  const { card } = props;
  const sharedChannels = (card.data?.sharedChannels || []) as SharedChannel[];
  const totalShared = card.data?.totalSharedChannels || sharedChannels.length;
  const displayChannels = sharedChannels.slice(0, 3);
  const remainingCount = Math.max(0, totalShared - displayChannels.length);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Theme-aware colors
  const textPrimary = isDark ? Colors.dark.text.primary : Colors.light.text.primary;
  const textSecondary = isDark ? Colors.dark.text.secondary : Colors.light.text.secondary;
  const textTertiary = isDark ? Colors.dark.text.tertiary : Colors.light.text.tertiary;
  const channelItemBg = isDark ? Colors.fairytale.cardContent.dark : Colors.fairytale.cardContent.light;

  return (
    <BaseStoryCard {...props}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>What You Watch</Text>

        {/* Decorative Line */}
        <View style={styles.decorativeLine} />

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: textSecondary }]}>Shared favorites:</Text>

        {/* Channel List */}
        <NativeViewGestureHandler disallowInterruption>
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          >
            {displayChannels.map((channel, index) => (
            <View key={index} style={[styles.channelItem, { backgroundColor: channelItemBg }]}>
              {/* Channel Thumbnail */}
              <View style={styles.channelImageContainer}>
                {channel.thumbnail ? (
                  <Image
                    source={{ uri: channel.thumbnail }}
                    style={styles.channelImage}
                  />
                ) : (
                  <View style={[styles.channelImage, styles.channelImagePlaceholder]}>
                    <Text style={styles.placeholderIcon}>🎬</Text>
                  </View>
                )}
              </View>

              {/* Channel Info */}
              <View style={styles.channelInfo}>
                <Text style={[styles.channelName, { color: textPrimary }]} numberOfLines={1}>
                  {channel.channel_title}
                </Text>
                {channel.description && (
                  <Text style={[styles.channelDescription, { color: textSecondary }]} numberOfLines={2}>
                    {channel.description}
                  </Text>
                )}
              </View>
            </View>
            ))}
          </ScrollView>
        </NativeViewGestureHandler>

        {/* More Count */}
        {remainingCount > 0 && (
          <Text style={[styles.moreText, { color: textTertiary }]}>
            + {remainingCount} more shared channel{remainingCount !== 1 ? 's' : ''}
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
  channelItem: {
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
  channelImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
  },
  channelImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  channelImagePlaceholder: {
    backgroundColor: Colors.peach,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 24,
  },
  channelInfo: {
    flex: 1,
    gap: 2,
  },
  channelName: {
    fontFamily: Typography.fonts.sans,
    fontSize: 18,
    fontWeight: Typography.weights.semibold,
    // color is dynamic (applied inline)
  },
  channelDescription: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    // color is dynamic (applied inline)
    lineHeight: 18,
  },
  moreText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    // color is dynamic (applied inline)
    textAlign: 'center',
    marginTop: 12,
  },
});
