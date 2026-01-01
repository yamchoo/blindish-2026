/**
 * Card Component
 * Container component for grouping content with optional shadow and press behavior
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Colors } from '@/lib/constants/colors';
import { Spacing, BorderRadius } from '@/lib/constants/typography';

type CardVariant = 'elevated' | 'outlined' | 'flat';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  onPress,
  style,
  padding = 'md',
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.base,
      padding: Spacing[padding],
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...styles.elevated,
          backgroundColor: Colors.light.background,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: Colors.light.background,
          borderWidth: 1,
          borderColor: Colors.light.border,
        };
      case 'flat':
        return {
          ...baseStyle,
          backgroundColor: Colors.light.surface,
        };
      default:
        return baseStyle;
    }
  };

  const content = <View style={[getCardStyle(), style]}>{children}</View>;

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  elevated: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
});
