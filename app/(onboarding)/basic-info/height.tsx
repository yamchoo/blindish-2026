/**
 * Height Screen
 * Question 6/7: What's your height?
 * Shows affirming message after selection
 * Optional - can be skipped
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { QuestionScreen } from '@/components/onboarding';
import { useBasicInfoStore } from '@/stores/basicInfoStore';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing } from '@/lib/constants/typography';

// Generate height options from 150cm to 220cm (4'11" to 7'3")
const HEIGHT_OPTIONS = Array.from({ length: 71 }, (_, i) => {
  const cm = 150 + i;
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;

  return {
    value: cm,
    label: `${cm}cm`,
    sublabel: `${feet}'${inches}"`,
  };
});

export default function HeightScreen() {
  const { height, setHeight } = useBasicInfoStore();
  const [showAffirmation, setShowAffirmation] = useState(!!height);

  const handleSelect = (value: number) => {
    setHeight(value);
    setShowAffirmation(true);
  };

  const handleSkip = () => {
    setHeight(null);
    router.push('/(onboarding)/basic-info/voice-greeting');
  };

  const handleContinue = () => {
    router.push('/(onboarding)/basic-info/voice-greeting');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <QuestionScreen
      title="What's your height?"
      subtitle="Optional - helps us find compatible matches"
      progress={6 / 7}
      totalQuestions={7}
      currentQuestion={6}
      canContinue={true} // Can always continue (optional field)
      onContinue={height ? handleContinue : handleSkip}
      onBack={handleBack}
      showGlobalProgress={false}
      continueButtonText={height ? 'Continue' : 'Skip for now'}
    >
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {HEIGHT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.heightOption,
              height === option.value && styles.heightOptionSelected,
            ]}
            onPress={() => handleSelect(option.value)}
            activeOpacity={0.7}
          >
            <View style={styles.heightLabelContainer}>
              <Text
                style={[
                  styles.heightLabel,
                  height === option.value && styles.heightLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              <Text
                style={[
                  styles.heightSublabel,
                  height === option.value && styles.heightSublabelSelected,
                ]}
              >
                {option.sublabel}
              </Text>
            </View>
            {height === option.value && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Affirming message */}
      {showAffirmation && height && (
        <View style={styles.affirmationContainer}>
          <Text style={styles.affirmationText}>Perfect! ✨</Text>
        </View>
      )}
    </QuestionScreen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  heightOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  heightOptionSelected: {
    backgroundColor: Colors.light.accent,
    borderColor: Colors.interactive.primary,
  },
  heightLabelContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  heightLabel: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.light.text.primary,
  },
  heightLabelSelected: {
    color: Colors.interactive.primary,
  },
  heightSublabel: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    color: Colors.light.text.secondary,
  },
  heightSublabelSelected: {
    color: Colors.interactive.primary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.interactive.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: Typography.weights.bold,
  },
  affirmationContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    alignItems: 'center',
  },
  affirmationText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    color: Colors.interactive.primary,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
});
