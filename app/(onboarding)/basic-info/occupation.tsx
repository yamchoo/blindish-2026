/**
 * Occupation Screen
 * Question 5/7: What do you do?
 * Optional field with fun rotating placeholders
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { QuestionScreen } from '@/components/onboarding';
import { Input, Button } from '@/components/ui';
import { useBasicInfoStore } from '@/stores/basicInfoStore';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing } from '@/lib/constants/typography';

const FUN_PLACEHOLDERS = [
  "Rocket scientist",
  "Professional dog petter",
  "World changer",
  "Coffee enthusiast",
  "Dream chaser",
  "Adventure seeker",
];

export default function OccupationScreen() {
  const { occupation, setOccupation } = useBasicInfoStore();
  const [placeholder, setPlaceholder] = useState(FUN_PLACEHOLDERS[0]);

  useEffect(() => {
    // Rotate placeholders every 2 seconds if field is empty
    if (!occupation) {
      const interval = setInterval(() => {
        setPlaceholder(prev => {
          const currentIndex = FUN_PLACEHOLDERS.indexOf(prev);
          const nextIndex = (currentIndex + 1) % FUN_PLACEHOLDERS.length;
          return FUN_PLACEHOLDERS[nextIndex];
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [occupation]);

  const handleContinue = () => {
    router.push('/(onboarding)/basic-info/height');
  };

  const handleSkip = () => {
    setOccupation(''); // Clear occupation if skipping
    router.push('/(onboarding)/basic-info/height');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <QuestionScreen
      title="What do you do?"
      description="Optional - helps us find compatible matches"
      progress={5 / 7}
      totalQuestions={7}
      currentQuestion={5}
      canContinue={true} // Always can continue (field is optional)
      onContinue={handleContinue}
      onBack={handleBack}
      showGlobalProgress={false}
    >
      <View>
        <Input
          value={occupation}
          onChangeText={setOccupation}
          placeholder={placeholder}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          clearable
          characterLimit={100}
          autoCapitalize="words"
        />

        {/* Skip button with personality */}
        <View style={styles.skipContainer}>
          <Button
            title="I'm mysterious 🎭"
            onPress={handleSkip}
            variant="ghost"
            size="md"
            fullWidth
          />
        </View>
      </View>
    </QuestionScreen>
  );
}

const styles = StyleSheet.create({
  skipContainer: {
    marginTop: Spacing.md,
  },
});
