/**
 * Button Component
 * Reusable button with multiple variants and sizes
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing, BorderRadius } from '@/lib/constants/typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
  children,
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.base,
      ...styles[`size_${size}`],
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: loading
            ? Colors.interactive.primaryFaded
            : disabled
            ? Colors.light.border
            : Colors.interactive.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: loading
            ? Colors.interactive.secondaryFaded
            : disabled
            ? Colors.light.border
            : Colors.interactive.secondary,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: loading
            ? Colors.interactive.primaryFaded
            : disabled
            ? Colors.light.border
            : Colors.interactive.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...styles.text,
      ...styles[`text_${size}`],
    };

    switch (variant) {
      case 'primary':
      case 'secondary':
        return {
          ...baseTextStyle,
          color: isDisabled
            ? Colors.light.text.tertiary
            : Colors.light.text.inverse,
        };
      case 'outline':
      case 'ghost':
        return {
          ...baseTextStyle,
          color: isDisabled
            ? Colors.light.text.tertiary
            : Colors.interactive.primary,
        };
      default:
        return baseTextStyle;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {loading && (
          <View style={styles.spinner}>
            <ActivityIndicator
              color={
                variant === 'primary' || variant === 'secondary'
                  ? Colors.light.text.inverse
                  : Colors.interactive.primary
              }
              size="small"
            />
          </View>
        )}
        {!loading && icon && <View style={styles.icon}>{icon}</View>}
        <Text style={[getTextStyle(), textStyle]}>
          {children || title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  size_sm: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },
  size_md: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  size_lg: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 56,
  },
  text: {
    fontFamily: Typography.fonts.sans,
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
  },
  text_sm: {
    fontSize: Typography.sizes.sm,
  },
  text_md: {
    fontSize: Typography.sizes.base,
  },
  text_lg: {
    fontSize: Typography.sizes.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  spinner: {
    marginRight: Spacing.sm,
  },
});
