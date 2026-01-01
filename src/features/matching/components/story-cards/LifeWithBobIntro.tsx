/**
 * LifeWithBobIntro Card
 * First card - narrative opener using personality summary
 * Sets the stage for imagining life together
 * Blur: 24 (highest - most mysterious)
 * No like button
 */

import React from 'react';
import { View, Text, StyleSheet, Image, useColorScheme } from 'react-native';
import { BaseStoryCard, BaseStoryCardProps } from './BaseStoryCard';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing } from '@/lib/constants/typography';

export function LifeWithBobIntro(props: BaseStoryCardProps) {
  const { match } = props;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Theme-aware colors
  const textPrimary = isDark ? Colors.dark.text.primary : Colors.light.text.primary;
  const textSecondary = isDark ? Colors.dark.text.secondary : Colors.light.text.secondary;
  const textTertiary = isDark ? Colors.dark.text.tertiary : Colors.light.text.tertiary;
  const photoBackground = isDark ? Colors.fairytale.surface.dark : Colors.fairytale.surface.light;
  const summaryCardBg = isDark ? Colors.fairytale.cardContent.dark : Colors.fairytale.cardContent.light;

  // Generate narrative opener based on personality
  const generateNarrative = () => {
    const firstName = match.name;
    const personalityType = match.personality?.type || 'thoughtful';
    const highlights = match.personality?.highlights || [];

    // Get top personality trait
    const topTrait = highlights[0] || 'interesting';

    // Create narrative based on personality
    const narratives = [
      `Imagine life with ${firstName}...`,
      `Picture this: A ${personalityType} companion who brings ${topTrait.toLowerCase()} energy to your days.`,
      `Someone who sees the world with curiosity and wonder.`,
    ];

    return narratives;
  };

  const narrativeLines = generateNarrative();

  return (
    <BaseStoryCard {...props} showLikeButton={false}>
      <View style={styles.content}>
        {/* Circular Blurred Photo */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: match.primaryPhoto.url }}
            style={[styles.circularPhoto, { backgroundColor: photoBackground }]}
            blurRadius={24}
          />
        </View>

        {/* Narrative Text */}
        <View style={styles.narrativeContainer}>
          {narrativeLines.map((line, index) => (
            <Text
              key={index}
              style={[
                styles.narrativeText,
                { color: textPrimary },
                index === 0 && styles.narrativeFirst,
                index === narrativeLines.length - 1 && [styles.narrativeLast, { color: textSecondary }],
              ]}
            >
              {line}
            </Text>
          ))}
        </View>

        {/* Personality Summary */}
        {match.personality?.summary && (
          <View style={[styles.summaryCard, { backgroundColor: summaryCardBg }]}>
            <Text style={[styles.summaryText, { color: textPrimary }]}>{match.personality.summary}</Text>
          </View>
        )}

        {/* CTA */}
        <Text style={[styles.ctaText, { color: textTertiary }]}>Swipe through their story to learn more</Text>
      </View>
    </BaseStoryCard>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  photoContainer: {
    marginBottom: Spacing.sm,
  },
  circularPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    // backgroundColor is dynamic (applied inline)
  },
  narrativeContainer: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  narrativeText: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.medium,
    // color is dynamic (applied inline)
    textAlign: 'center',
    lineHeight: Typography.sizes['2xl'] * 1.3, // More compact (was relaxed)
  },
  narrativeFirst: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.interactive.primary,
    lineHeight: Typography.sizes['3xl'] * 1.2, // More compact
  },
  narrativeLast: {
    fontSize: Typography.sizes.lg,
    fontStyle: 'italic',
    // color is dynamic (applied inline)
    lineHeight: Typography.sizes.lg * 1.4, // More compact
  },
  summaryCard: {
    // backgroundColor is dynamic (applied inline)
    borderRadius: 20,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(200, 168, 101, 0.3)',
    maxWidth: '90%',
  },
  summaryText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    // color is dynamic (applied inline)
    textAlign: 'center',
    lineHeight: Typography.sizes.base * 1.4, // More compact (was relaxed)
  },
  ctaText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    // color is dynamic (applied inline)
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
