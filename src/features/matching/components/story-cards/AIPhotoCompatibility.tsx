/**
 * AIPhotoCompatibility Card
 * Shows AI analysis of their photo: vibe, style, and visual compatibility factors
 * Blur: 18 (medium blur)
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { BaseStoryCard, BaseStoryCardProps } from './BaseStoryCard';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing } from '@/lib/constants/typography';
import { Ionicons } from '@expo/vector-icons';

export function AIPhotoCompatibility(props: BaseStoryCardProps) {
  const { card, match } = props;
  const aiAnalysis = card.data as any; // AI analysis data

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Theme-aware colors
  const textPrimary = isDark ? Colors.dark.text.primary : Colors.light.text.primary;
  const textSecondary = isDark ? Colors.dark.text.secondary : Colors.light.text.secondary;
  const textTertiary = isDark ? Colors.dark.text.tertiary : Colors.light.text.tertiary;
  const vibeCardBg = isDark ? Colors.fairytale.cardContent.dark : Colors.fairytale.cardContent.light;
  const tagBg = isDark ? Colors.fairytale.componentBg.dark : Colors.fairytale.componentBg.light;

  if (!aiAnalysis) {
    return null;
  }

  const { vibeDescription, styleTags, visualCompatibilityFactors } = aiAnalysis;

  return (
    <BaseStoryCard {...props}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="eye-outline" size={32} color={Colors.interactive.primary} />
          <Text style={[styles.title, { color: textPrimary }]}>Visual First Impression</Text>
        </View>

        {/* Vibe Description */}
        {vibeDescription && (
          <View style={[styles.vibeCard, { backgroundColor: vibeCardBg }]}>
            <Text style={[styles.vibeLabel, { color: textSecondary }]}>Their Vibe</Text>
            <Text style={[styles.vibeText, { color: textPrimary }]}>{vibeDescription}</Text>
          </View>
        )}

        {/* Style Tags */}
        {styleTags && styleTags.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: textSecondary }]}>Style</Text>
            <View style={styles.tagContainer}>
              {styleTags.slice(0, 4).map((tag: string, index: number) => (
                <View key={index} style={[styles.tag, { backgroundColor: tagBg }]}>
                  <Text style={[styles.tagText, { color: textPrimary }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Visual Compatibility Factors */}
        {visualCompatibilityFactors && visualCompatibilityFactors.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: textSecondary }]}>What Stands Out</Text>
            <View style={styles.factorsList}>
              {visualCompatibilityFactors.slice(0, 3).map((factor: string, index: number) => (
                <View key={index} style={styles.factorItem}>
                  <View style={styles.factorDot} />
                  <Text style={[styles.factorText, { color: textPrimary }]}>{factor}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer Note */}
        <Text style={[styles.footerNote, { color: textTertiary }]}>AI-generated visual insights</Text>
      </View>
    </BaseStoryCard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    // color is dynamic (applied inline)
  },
  vibeCard: {
    // backgroundColor is dynamic (applied inline)
    borderRadius: 20,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(200, 168, 101, 0.2)',
  },
  vibeLabel: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    // color is dynamic (applied inline)
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  vibeText: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    // color is dynamic (applied inline)
    lineHeight: Typography.sizes.lg * Typography.lineHeights.relaxed,
  },
  section: {
    gap: Spacing.md,
  },
  sectionLabel: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    // color is dynamic (applied inline)
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  tag: {
    // backgroundColor is dynamic (applied inline)
    borderRadius: 16,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(200, 168, 101, 0.3)',
  },
  tagText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    // color is dynamic (applied inline)
  },
  factorsList: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  factorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.interactive.primary,
  },
  factorText: {
    flex: 1,
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    // color is dynamic (applied inline)
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
  },
  footerNote: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.xs,
    // color is dynamic (applied inline)
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
