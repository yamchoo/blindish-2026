/**
 * CompatibilityScoreRow Component
 * Displays three compatibility scores in horizontal row with circular progress indicators
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/lib/constants/colors';
import { Typography } from '@/lib/constants/typography';

interface ScoreBadgeProps {
  score: number;
  label: string;
  size?: number;
}

function ScoreBadge({ score, label, size = 52 }: ScoreBadgeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const getBadgeColor = () => {
    if (score >= 80) return Colors.coral;
    if (score >= 60) return Colors.peach;
    return Colors.pink;
  };

  const color = getBadgeColor();
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  // Theme-aware colors
  const badgeBackground = isDark ? Colors.fairytale.componentBg.dark : Colors.fairytale.componentBg.light;
  const textPrimary = isDark ? Colors.dark.text.primary : Colors.light.text.primary;
  const textSecondary = isDark ? Colors.dark.text.secondary : Colors.light.text.secondary;

  return (
    <View style={styles.badgeWrapper}>
      <View style={[styles.badge, { width: size, height: size, backgroundColor: badgeBackground }]}>
        {/* SVG Circular Progress */}
        <Svg
          width={size}
          height={size}
          style={StyleSheet.absoluteFill}
        >
          {/* Background circle (empty/transparent) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeOpacity={0.2}
            fill="none"
          />
          {/* Foreground circle (filled progress) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeOpacity={1}
            fill="none"
            strokeDasharray={`${progress} ${circumference}`}
            strokeDashoffset={0}
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
            strokeLinecap="round"
          />
        </Svg>

        {/* Score text */}
        <Text style={[styles.scoreText, { fontSize: size * 0.28, color: textPrimary }]}>
          {score}%
        </Text>
      </View>
      <Text style={[styles.label, { color: textSecondary }]}>{label}</Text>
    </View>
  );
}

interface CompatibilityScoreRowProps {
  overall: number;
  interests: number;
  lifestyle: number;
  size?: number;
}

export function CompatibilityScoreRow({
  overall,
  interests,
  lifestyle,
  size = 52,
}: CompatibilityScoreRowProps) {
  return (
    <View style={styles.container}>
      <ScoreBadge score={overall} label="overall" size={size} />
      <ScoreBadge score={interests} label="interests" size={size} />
      <ScoreBadge score={lifestyle} label="lifestyle" size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 24,
    paddingVertical: 12,
  },
  badgeWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor is dynamic (applied inline)
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreText: {
    fontWeight: '700',
    // color is dynamic (applied inline)
    zIndex: 1,
  },
  label: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    // color is dynamic (applied inline)
  },
});
