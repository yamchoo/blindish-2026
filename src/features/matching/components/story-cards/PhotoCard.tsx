/**
 * PhotoCard Component
 * Shows heavily blurred preview of photo in golden circle
 * Blur: 20 (heavy blur - teaser before full reveal in messaging)
 */

import React from 'react';
import { View, Text, Image, StyleSheet, useColorScheme } from 'react-native';
import { BaseStoryCard, BaseStoryCardProps } from './BaseStoryCard';
import { GoldenCircleFrame, MeshGradientOverlay } from '@/components/ui';
import { Colors } from '@/lib/constants/colors';
import { Typography } from '@/lib/constants/typography';

export function PhotoCard(props: BaseStoryCardProps) {
  const { match } = props;
  const topTraits = match.personality?.highlights?.slice(0, 3) || [];

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Theme-aware colors
  const textPrimary = isDark ? Colors.dark.text.primary : Colors.light.text.primary;
  const textSecondary = isDark ? Colors.dark.text.secondary : Colors.light.text.secondary;
  const textTertiary = isDark ? Colors.dark.text.tertiary : Colors.light.text.tertiary;
  const traitsContainerBg = isDark ? Colors.fairytale.componentBg.dark : Colors.fairytale.componentBg.light;

  return (
    <BaseStoryCard {...props}>
      <View style={styles.content}>
        {/* Golden Circle Frame with Heavily Blurred Photo */}
        <View style={styles.circleContainer}>
          <GoldenCircleFrame size={180} borderWidth={5}>
            <Image
              source={{ uri: match.primaryPhoto.url }}
              style={styles.circlePhoto}
              blurRadius={20}
            />
            {/* Mesh gradient overlay for mystery effect */}
            <MeshGradientOverlay
              opacity={0.5}
              speed={0.7}
              circular={true}
              size={170}
            />
          </GoldenCircleFrame>
        </View>

        {/* Name and Age */}
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: textPrimary }]}>{match.name}</Text>
          <Text style={[styles.age, { color: textSecondary }]}>, {match.age}</Text>
        </View>

        {/* Top Traits */}
        {topTraits.length > 0 && (
          <View style={[styles.traitsContainer, { backgroundColor: traitsContainerBg }]}>
            {topTraits.map((trait, index) => (
              <React.Fragment key={index}>
                <Text style={[styles.trait, { color: textSecondary }]}>{trait}</Text>
                {index < topTraits.length - 1 && (
                  <Text style={[styles.traitSeparator, { color: textSecondary }]}> • </Text>
                )}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* CTA Text */}
        <Text style={[styles.ctaText, { color: textTertiary }]}>Match to see the full reveal</Text>
      </View>
    </BaseStoryCard>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: 16,
  },
  circleContainer: {
    marginBottom: 8,
  },
  circlePhoto: {
    width: 170,
    height: 170,
    borderRadius: 85,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  name: {
    fontFamily: Typography.fonts.serif,
    fontSize: 30,
    fontWeight: Typography.weights.bold,
    // color is dynamic (applied inline)
  },
  age: {
    fontFamily: Typography.fonts.serif,
    fontSize: 24,
    fontWeight: Typography.weights.semibold,
    // color is dynamic (applied inline)
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    // backgroundColor is dynamic (applied inline)
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    maxWidth: '90%',
  },
  trait: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    // color is dynamic (applied inline)
  },
  traitSeparator: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    // color is dynamic (applied inline)
  },
  ctaText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    // color is dynamic (applied inline)
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
});
