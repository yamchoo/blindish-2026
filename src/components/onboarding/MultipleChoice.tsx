/**
 * Multiple Choice Component
 * Radio button UI for single-selection questions
 * Enhanced with animations and haptic feedback
 */

import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing, BorderRadius } from '@/lib/constants/typography';

export interface Option {
  value: string;
  label: string;
  description?: string;
}

interface MultipleChoiceProps {
  options: Option[];
  selected: string | null;
  onSelect: (value: string) => void;
}

export function MultipleChoice({ options, selected, onSelect }: MultipleChoiceProps) {
  const handleSelect = (value: string) => {
    // Haptic feedback on selection
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(value);
  };

  return (
    <View style={styles.container}>
      {options.map((option, index) => (
        <View key={option.value}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleSelect(option.value)}
            activeOpacity={0.7}
          >
            <View style={styles.optionText}>
              <Text style={styles.label}>
                {option.label}
              </Text>
              {option.description && (
                <Text style={styles.description}>{option.description}</Text>
              )}
            </View>

            {/* Radio Circle */}
            <View style={[
              styles.radio,
              selected === option.value && styles.radioSelected
            ]}>
              {selected === option.value && (
                <View style={styles.radioFilled} />
              )}
            </View>
          </TouchableOpacity>
          {index < options.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: 14, // Increased from 12
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    minHeight: 64, // Increased from 56
  },
  optionText: {
    flex: 1,
    marginRight: Spacing.md,
  },
  label: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium, // Increased from normal
    color: Colors.light.text.primary,
  },
  description: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    color: Colors.light.text.secondary,
    marginTop: Spacing.xs / 2,
    lineHeight: Typography.sizes.sm * 1.4,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
  },
  radioSelected: {
    borderColor: Colors.interactive.primary,
    backgroundColor: Colors.interactive.primary,
  },
  radioFilled: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.background,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: Spacing.lg,
  },
});
