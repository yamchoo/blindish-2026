/**
 * CompatibilityBadge Component
 * Displays compatibility score with color-coded badge
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/lib/constants/colors';

interface CompatibilityBadgeProps {
  score: number; // 0-100
  size?: 'small' | 'medium' | 'large';
}

export function CompatibilityBadge({ score, size = 'medium' }: CompatibilityBadgeProps) {
  // Determine badge color based on score
  const getBadgeColor = () => {
    if (score >= 80) return Colors.coral; // Excellent match
    if (score >= 60) return Colors.peach; // Good match
    return Colors.pink; // Decent match
  };

  // Size configurations
  const sizeConfig = {
    small: { container: 40, text: 12 },
    medium: { container: 56, text: 16 },
    large: { container: 72, text: 20 },
  };

  const { container, text } = sizeConfig[size];
  const badgeColor = getBadgeColor();

  return (
    <View
      style={[
        styles.container,
        {
          width: container,
          height: container,
          borderRadius: container / 2,
          backgroundColor: badgeColor,
        },
      ]}
    >
      <Text
        style={[
          styles.scoreText,
          {
            fontSize: text,
          },
        ]}
      >
        {score}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
});
