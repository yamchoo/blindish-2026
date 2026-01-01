/**
 * Looking For Screen
 * Question 4/5: Who are you looking for?
 * Shows fun reactions based on selection
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { QuestionScreen, MultipleSelect, type Option } from '@/components/onboarding';
import { useBasicInfoStore, type LookingFor } from '@/stores/basicInfoStore';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing } from '@/lib/constants/typography';

const LOOKING_FOR_OPTIONS: Option[] = [
  { value: 'male', label: 'Men' },
  { value: 'female', label: 'Women' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'everyone', label: 'Everyone' },
];

export default function LookingForScreen() {
  const { lookingFor, setLookingFor } = useBasicInfoStore();
  const [reaction, setReaction] = useState<string | null>(null);

  useEffect(() => {
    // Show fun reaction based on selection
    if (lookingFor.length === 0) {
      setReaction(null);
    } else if (lookingFor.includes('everyone')) {
      setReaction("Open mind, open heart! 💕");
    } else if (lookingFor.length > 1) {
      setReaction("Great, more options! ✨");
    } else {
      setReaction("Crystal clear! 👌");
    }
  }, [lookingFor]);

  const handleSelect = (values: string[]) => {
    setLookingFor(values as LookingFor[]);
  };

  const handleContinue = () => {
    router.push('/(onboarding)/basic-info/occupation');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <QuestionScreen
      title="Who are you looking for?"
      description="You can select multiple"
      progress={4 / 5}
      totalQuestions={5}
      currentQuestion={4}
      canContinue={lookingFor.length > 0}
      onContinue={handleContinue}
      onBack={handleBack}
      showGlobalProgress={false}
    >
      <MultipleSelect
        options={LOOKING_FOR_OPTIONS}
        selected={lookingFor}
        onSelect={handleSelect}
      />

      {/* Fun reaction */}
      {reaction && (
        <View style={styles.reactionContainer}>
          <Text style={styles.reactionText}>{reaction}</Text>
        </View>
      )}
    </QuestionScreen>
  );
}

const styles = StyleSheet.create({
  reactionContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    alignItems: 'center',
  },
  reactionText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    color: Colors.interactive.primary,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
});
