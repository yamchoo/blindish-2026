/**
 * Multiple Select Component
 * Checkbox UI for multi-selection questions
 * Enhanced with haptic feedback
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing, BorderRadius } from '@/lib/constants/typography';

export interface Option {
  value: string;
  label: string;
  description?: string;
}

interface MultipleSelectProps {
  options: Option[];
  selected: string[];
  onSelect: (values: string[]) => void;
}

export function MultipleSelect({ options, selected, onSelect }: MultipleSelectProps) {
  const handleToggle = (value: string) => {
    // Haptic feedback on toggle
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const isSelected = selected.includes(value);
    if (isSelected) {
      onSelect(selected.filter(v => v !== value));
    } else {
      onSelect([...selected, value]);
    }
  };

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isSelected = selected.includes(option.value);
        return (
          <View key={option.value}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleToggle(option.value)}
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

              {/* Checkbox */}
              <View style={[
                styles.checkbox,
                isSelected && styles.checkboxSelected
              ]}>
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
            {index < options.length - 1 && <View style={styles.divider} />}
          </View>
        );
      })}
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
  },
  checkboxSelected: {
    borderColor: Colors.interactive.primary,
    backgroundColor: Colors.interactive.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: Spacing.lg,
  },
});
