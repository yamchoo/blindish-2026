/**
 * Gender Screen
 * Question 3/5: What's your gender?
 * Shows affirming message after selection
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { QuestionScreen, MultipleChoice, type Option } from '@/components/onboarding';
import { useBasicInfoStore, type Gender } from '@/stores/basicInfoStore';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing } from '@/lib/constants/typography';

const GENDER_OPTIONS: Option[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
];

export default function GenderScreen() {
  const { gender, setGender } = useBasicInfoStore();
  const [showAffirmation, setShowAffirmation] = useState(!!gender);

  const handleSelect = (value: string) => {
    setGender(value as Gender);
    setShowAffirmation(true);
  };

  const handleContinue = () => {
    router.push('/(onboarding)/basic-info/looking-for');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <QuestionScreen
      title="What's your gender?"
      progress={3 / 5}
      totalQuestions={5}
      currentQuestion={3}
      canContinue={!!gender}
      onContinue={handleContinue}
      onBack={handleBack}
      showGlobalProgress={false}
    >
      <MultipleChoice
        options={GENDER_OPTIONS}
        selected={gender}
        onSelect={handleSelect}
      />

      {/* Affirming message */}
      {showAffirmation && gender && (
        <View style={styles.affirmationContainer}>
          <Text style={styles.affirmationText}>Got it! ✨</Text>
        </View>
      )}
    </QuestionScreen>
  );
}

const styles = StyleSheet.create({
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
