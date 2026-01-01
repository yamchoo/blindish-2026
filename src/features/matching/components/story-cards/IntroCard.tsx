/**
 * IntroCard Component
 * First card showing name, age, distance, and compatibility score
 * Blur: 24 (heaviest - complete mystery)
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BaseStoryCard, BaseStoryCardProps } from './BaseStoryCard';
import { Colors } from '@/lib/constants/colors';
import { Typography } from '@/lib/constants/typography';
import { GoldenCircleFrame, MeshGradientOverlay } from '@/components/ui';

export function IntroCard(props: BaseStoryCardProps) {
  const { match, card } = props;
  const compatibilityScore = card.data?.compatibilityScore || match.compatibilityScore || 0;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Theme-aware colors
  const centerCardBg = isDark ? Colors.fairytale.cardContent.dark : Colors.fairytale.cardContent.light;
  const textPrimary = isDark ? Colors.dark.text.primary : Colors.light.text.primary;
  const textSecondary = isDark ? Colors.dark.text.secondary : Colors.light.text.secondary;
  const textTertiary = isDark ? Colors.dark.text.tertiary : Colors.light.text.tertiary;
  const badgeBg = isDark ? Colors.fairytale.componentBg.dark : Colors.fairytale.componentBg.light;
  const strengthsBg = isDark ? 'rgba(200, 168, 101, 0.15)' : 'rgba(200, 168, 101, 0.08)';

  // Get compatibility strengths from enhanced personality analysis
  const compatibilityStrengths = match.ai_analysis?.relationshipInsights?.compatibility_strengths;
  const hasStrengths = compatibilityStrengths && compatibilityStrengths.length > 0;

  return (
    <BaseStoryCard {...props} showLikeButton={false}>
      {/* Center Content Card */}
      <View style={[styles.centerCard, { backgroundColor: centerCardBg }]}>
        {/* Circular Photo with Golden Frame */}
        <View style={styles.photoContainer}>
          <GoldenCircleFrame size={190} borderWidth={3}>
            <Image
              source={{ uri: match.primaryPhoto.url }}
              style={styles.circlePhoto}
              blurRadius={20}
            />
            <MeshGradientOverlay
              opacity={0.7}
              speed={0.7}
              circular={true}
              size={180}
            />
          </GoldenCircleFrame>
        </View>

        {/* Eyebrow Text */}
        <Text style={[styles.eyebrow, { color: textSecondary }]}>You matched with</Text>

        {/* Name */}
        <Text style={[styles.name, { color: textPrimary }]}>{match.name}</Text>

        {/* Age and Distance */}
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: textSecondary }]}>{match.age}</Text>
          {match.distance > 0 && (
            <>
              <Text style={[styles.bullet, { color: textSecondary }]}> • </Text>
              <Text style={[styles.metaText, { color: textSecondary }]}>{match.distance} miles away</Text>
            </>
          )}
        </View>

        {/* Compatibility Strengths - Show if available from enhanced analysis */}
        {hasStrengths && (
          <View style={[styles.strengthsContainer, { backgroundColor: strengthsBg }]}>
            <View style={styles.strengthsHeader}>
              <Ionicons name="star" size={14} color={Colors.fairytale.gold.deep} />
              <Text style={[styles.strengthsTitle, { color: textPrimary }]}>
                Why this match stands out
              </Text>
            </View>
            {compatibilityStrengths.slice(0, 2).map((strength, index) => (
              <View key={index} style={styles.strengthItem}>
                <Text style={styles.strengthBullet}>•</Text>
                <Text style={[styles.strengthText, { color: textSecondary }]}>
                  {strength}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA Text */}
        <Text style={[styles.ctaText, { color: textTertiary }]}>Tap to explore why you matched</Text>
      </View>
    </BaseStoryCard>
  );
}

const styles = StyleSheet.create({
  centerCard: {
    // backgroundColor is dynamic (applied inline)
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  circlePhoto: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  eyebrow: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.xs,
    // color is dynamic (applied inline)
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  name: {
    fontFamily: Typography.fonts.serif,
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    lineHeight: 32,
    // color is dynamic (applied inline)
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    // color is dynamic (applied inline)
  },
  bullet: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    // color is dynamic (applied inline)
  },
  ctaText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    lineHeight: 18,
    // color is dynamic (applied inline)
    fontStyle: 'italic',
    textAlign: 'center',
  },
  strengthsContainer: {
    // backgroundColor is dynamic (applied inline)
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 12,
    marginBottom: 4,
    width: '100%',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(200, 168, 101, 0.2)',
  },
  strengthsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  strengthsTitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    // color is dynamic (applied inline)
    letterSpacing: 0.3,
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  strengthBullet: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.xs,
    color: Colors.fairytale.gold.deep,
    lineHeight: Typography.sizes.xs * Typography.lineHeights.relaxed,
    marginTop: 1,
  },
  strengthText: {
    flex: 1,
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.xs,
    // color is dynamic (applied inline)
    lineHeight: Typography.sizes.xs * Typography.lineHeights.relaxed,
  },
});
