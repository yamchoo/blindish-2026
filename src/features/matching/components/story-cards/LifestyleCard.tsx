/**
 * LifestyleCard Component
 * Shows compatible lifestyle values
 * Blur: 12 (medium blur)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { BaseStoryCard, BaseStoryCardProps } from './BaseStoryCard';
import { Colors } from '@/lib/constants/colors';
import { Typography } from '@/lib/constants/typography';

interface LifestyleValue {
  category: string;
  userValue: string;
  matchValue: string;
  compatible: boolean;
}

interface CommunicationCompatibility {
  type: 'conflict_resolution' | 'affection_expression' | 'communication_preference';
  label: string;
  userValue: string;
  matchValue: string;
  compatible: boolean;
  insight?: string;
}

export function LifestyleCard(props: BaseStoryCardProps) {
  const { card, match } = props;
  const compatibleValues = (card.data?.compatibleValues || []) as LifestyleValue[];
  const displayValues = compatibleValues.slice(0, 5); // Show max 5

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Theme-aware colors
  const textPrimary = isDark ? Colors.dark.text.primary : Colors.light.text.primary;
  const textSecondary = isDark ? Colors.dark.text.secondary : Colors.light.text.secondary;
  const textTertiary = isDark ? Colors.dark.text.tertiary : Colors.light.text.tertiary;
  const valueItemBg = isDark ? Colors.fairytale.cardContent.dark : Colors.fairytale.cardContent.light;
  const commCardBg = isDark ? 'rgba(78, 205, 196, 0.12)' : 'rgba(78, 205, 196, 0.08)';

  // Get communication compatibility (from explicit data or inferred)
  const userCommStyle = match.communication_style;
  const matchCommStyle = (card.data?.matchCommunicationStyle || null) as any;

  // Build communication compatibility items
  const commCompatibility: CommunicationCompatibility[] = [];

  if (userCommStyle?.conflict_resolution && matchCommStyle?.conflict_resolution) {
    const compatible = userCommStyle.conflict_resolution === matchCommStyle.conflict_resolution;
    commCompatibility.push({
      type: 'conflict_resolution',
      label: 'Conflict Resolution',
      userValue: formatCommValue(userCommStyle.conflict_resolution),
      matchValue: formatCommValue(matchCommStyle.conflict_resolution),
      compatible,
      insight: compatible
        ? 'Similar approaches to handling disagreements'
        : 'Different conflict styles - worth discussing early',
    });
  }

  if (userCommStyle?.affection_expression && matchCommStyle?.affection_expression) {
    const compatible = userCommStyle.affection_expression === matchCommStyle.affection_expression;
    commCompatibility.push({
      type: 'affection_expression',
      label: 'Love Language',
      userValue: formatCommValue(userCommStyle.affection_expression),
      matchValue: formatCommValue(matchCommStyle.affection_expression),
      compatible,
      insight: compatible
        ? 'Speak the same love language'
        : 'Different love languages can complement each other',
    });
  }

  const hasCommunicationData = commCompatibility.length > 0;

  // Helper to format communication values
  function formatCommValue(value: string): string {
    return value
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Helper to format the value description
  const formatValueDescription = (value: LifestyleValue): string => {
    const category = value.category.toLowerCase();

    // Special formatting for different categories
    if (category === 'kids') {
      return `Both want: ${value.userValue}`;
    } else if (category === 'drinking' || category === 'smoking' || category === 'cannabis') {
      return `Both prefer: ${value.userValue}`;
    } else if (category === 'religion') {
      return `Both identify: ${value.userValue}`;
    } else if (category === 'politics') {
      return `Both lean: ${value.userValue}`;
    } else {
      return `Both: ${value.userValue}`;
    }
  };

  return (
    <BaseStoryCard {...props}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Lifestyle Match</Text>

        {/* Decorative Line */}
        <View style={styles.decorativeLine} />

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: textSecondary }]}>You're aligned on:</Text>

        {/* Values List */}
        <NativeViewGestureHandler disallowInterruption>
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          >
            {displayValues.length > 0 ? (
            displayValues.map((value, index) => (
              <View key={index} style={[styles.valueItem, { backgroundColor: valueItemBg }]}>
                {/* Checkmark Icon */}
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.interactive.success}
                  />
                </View>

                {/* Value Info */}
                <View style={styles.valueInfo}>
                  <Text style={[styles.category, { color: textPrimary }]}>{value.category}</Text>
                  <Text style={[styles.description, { color: textSecondary }]}>
                    {formatValueDescription(value)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="people-outline"
                size={32}
                color={textTertiary}
              />
              <Text style={[styles.emptyText, { color: textTertiary }]}>
                Different values, but respectful perspectives
              </Text>
            </View>
            )}

            {/* Communication Compatibility Section */}
            {hasCommunicationData && (
              <>
                <View style={styles.sectionDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={[styles.sectionLabel, { color: textSecondary }]}>Communication Style</Text>
                  <View style={styles.dividerLine} />
                </View>

                {commCompatibility.map((comm, index) => (
                  <View key={index} style={[styles.commItem, { backgroundColor: commCardBg }]}>
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name={comm.compatible ? 'heart-circle' : 'infinite'}
                        size={20}
                        color={comm.compatible ? Colors.interactive.success : Colors.interactive.primary}
                      />
                    </View>

                    <View style={styles.valueInfo}>
                      <Text style={[styles.category, { color: textPrimary }]}>{comm.label}</Text>
                      <Text style={[styles.description, { color: textSecondary }]}>
                        {comm.insight}
                      </Text>
                      {!comm.compatible && (
                        <View style={styles.commValues}>
                          <Text style={[styles.commValueLabel, { color: textTertiary }]}>
                            You: {comm.userValue} • {match.name}: {comm.matchValue}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </NativeViewGestureHandler>
      </View>
    </BaseStoryCard>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
  },
  title: {
    fontFamily: Typography.fonts.serif,
    fontSize: 36,
    fontWeight: Typography.weights.bold,
    color: Colors.coral,
    textAlign: 'center',
    marginBottom: 8,
  },
  decorativeLine: {
    width: 60,
    height: 2,
    backgroundColor: Colors.fairytale.gold.deep,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    // color is dynamic (applied inline)
    marginBottom: 16,
  },
  scrollContainer: {
    width: '100%',
    maxHeight: 320,
  },
  listContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // backgroundColor is dynamic (applied inline)
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    paddingTop: 2,
  },
  valueInfo: {
    flex: 1,
    gap: 4,
  },
  category: {
    fontFamily: Typography.fonts.sans,
    fontSize: 18,
    fontWeight: Typography.weights.semibold,
    // color is dynamic (applied inline)
  },
  description: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    // color is dynamic (applied inline)
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    // color is dynamic (applied inline)
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(200, 168, 101, 0.3)',
  },
  sectionLabel: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    // color is dynamic (applied inline)
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  commItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // backgroundColor is dynamic (applied inline)
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.2)',
  },
  commValues: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  commValueLabel: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.xs,
    // color is dynamic (applied inline)
    fontStyle: 'italic',
  },
});
