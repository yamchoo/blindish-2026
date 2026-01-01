/**
 * InterestingDifferences Card
 * Celebrates complementary personality traits
 * Uses personality contrasts (extraversion, conscientiousness, neuroticism)
 * Positive framing: differences as strengths
 * Blur: 12
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { BaseStoryCard, BaseStoryCardProps } from './BaseStoryCard';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing } from '@/lib/constants/typography';
import { Ionicons } from '@expo/vector-icons';

interface Difference {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export function InterestingDifferences(props: BaseStoryCardProps) {
  const { card, match } = props;
  const differences = (card.data?.differences || []) as Difference[];

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Theme-aware colors
  const textPrimary = isDark ? Colors.dark.text.primary : Colors.light.text.primary;
  const textSecondary = isDark ? Colors.dark.text.secondary : Colors.light.text.secondary;
  const differenceCardBg = isDark ? Colors.fairytale.cardContent.dark : Colors.fairytale.cardContent.light;
  const quoteCardBg = isDark ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 107, 107, 0.05)';
  const researchCardBg = isDark ? 'rgba(200, 168, 101, 0.12)' : 'rgba(200, 168, 101, 0.06)';

  // Get relationship insights from enhanced personality analysis
  const relationshipInsights = match.ai_analysis?.relationshipInsights;
  const whatToKnow = relationshipInsights?.what_to_know;
  const researchNote = relationshipInsights?.research_backed_note;

  if (!differences || differences.length === 0) {
    return null;
  }

  return (
    <BaseStoryCard {...props}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="git-compare-outline" size={32} color={Colors.interactive.primary} />
          <Text style={[styles.title, { color: textPrimary }]}>Complementary Strengths</Text>
        </View>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          Your differences could make you stronger together
        </Text>

        {/* Differences List */}
        <View style={styles.differencesList}>
          {differences.slice(0, 3).map((diff, index) => (
            <View key={index} style={[styles.differenceCard, { backgroundColor: differenceCardBg }]}>
              <View style={styles.differenceHeader}>
                <View style={[styles.iconCircle, { backgroundColor: `${diff.color}20` }]}>
                  <Ionicons name={diff.icon} size={24} color={diff.color} />
                </View>
                <Text style={[styles.differenceTitle, { color: textPrimary }]}>{diff.title}</Text>
              </View>
              <Text style={[styles.differenceDescription, { color: textSecondary }]}>{diff.description}</Text>
            </View>
          ))}
        </View>

        {/* What to Know - Show insights from enhanced analysis */}
        {whatToKnow && whatToKnow.length > 0 && (
          <View style={[styles.insightsCard, { backgroundColor: differenceCardBg }]}>
            <View style={styles.insightsHeader}>
              <Ionicons name="information-circle" size={20} color={Colors.interactive.primary} />
              <Text style={[styles.insightsTitle, { color: textPrimary }]}>What these differences mean</Text>
            </View>
            {whatToKnow.slice(0, 2).map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <Text style={styles.insightBullet}>•</Text>
                <Text style={[styles.insightText, { color: textSecondary }]}>{insight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Research-Backed Note */}
        {researchNote && (
          <View style={[styles.researchCard, { backgroundColor: researchCardBg }]}>
            <View style={styles.researchHeader}>
              <Ionicons name="school" size={16} color={Colors.fairytale.gold.deep} />
              <Text style={[styles.researchLabel, { color: textSecondary }]}>Research-backed</Text>
            </View>
            <Text style={[styles.researchText, { color: textPrimary }]}>{researchNote}</Text>
          </View>
        )}

        {/* Footer Quote - Show only if no research note */}
        {!researchNote && (
          <View style={[styles.quoteCard, { backgroundColor: quoteCardBg }]}>
            <Text style={[styles.quoteText, { color: textPrimary }]}>
              "Opposites don't just attract—they complete each other."
            </Text>
          </View>
        )}
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
  },
  title: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    // color is dynamic (applied inline)
  },
  subtitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    // color is dynamic (applied inline)
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: -Spacing.md,
  },
  differencesList: {
    gap: Spacing.lg,
  },
  differenceCard: {
    // backgroundColor is dynamic (applied inline)
    borderRadius: 16,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(200, 168, 101, 0.2)',
  },
  differenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  differenceTitle: {
    flex: 1,
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    // color is dynamic (applied inline)
  },
  differenceDescription: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    // color is dynamic (applied inline)
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
    paddingLeft: 48 + Spacing.md, // Align with title
  },
  quoteCard: {
    // backgroundColor is dynamic (applied inline)
    borderRadius: 16,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.interactive.primary,
  },
  quoteText: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    // color is dynamic (applied inline)
    fontStyle: 'italic',
    textAlign: 'center',
  },
  insightsCard: {
    // backgroundColor is dynamic (applied inline)
    borderRadius: 12,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.25)',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  insightsTitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    // color is dynamic (applied inline)
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: 2,
  },
  insightBullet: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    color: Colors.interactive.primary,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
    marginTop: 1,
  },
  insightText: {
    flex: 1,
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    // color is dynamic (applied inline)
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
  },
  researchCard: {
    // backgroundColor is dynamic (applied inline)
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: Colors.fairytale.gold.deep,
  },
  researchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  researchLabel: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    // color is dynamic (applied inline)
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  researchText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    // color is dynamic (applied inline)
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
    fontStyle: 'italic',
  },
});
