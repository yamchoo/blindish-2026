/**
 * Name Screen
 * Question 1/5: What's your first name?
 * Shows encouraging message after typing 3+ characters
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { QuestionScreen } from '@/components/onboarding';
import { Input } from '@/components/ui';
import { useBasicInfoStore } from '@/stores/basicInfoStore';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing } from '@/lib/constants/typography';

export default function NameScreen() {
  const { name, setName, validateName } = useBasicInfoStore();
  const [error, setError] = useState<string | null>(null);
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    // Show encouraging message after typing 3+ characters
    if (name.trim().length >= 3) {
      setShowGreeting(true);
    } else {
      setShowGreeting(false);
    }
  }, [name]);

  const handleContinue = () => {
    const validationError = validateName();
    if (validationError) {
      setError(validationError);
      return;
    }

    router.push('/(onboarding)/basic-info/birthday');
  };

  const handleNameChange = (text: string) => {
    setName(text);
    if (error) {
      setError(null);
    }
  };

  return (
    <QuestionScreen
      title="What's your first name?"
      description="This is how matches will see you"
      progress={1 / 5}
      totalQuestions={5}
      currentQuestion={1}
      canContinue={name.trim().length >= 2}
      onContinue={handleContinue}
      showGlobalProgress={false}
    >
      <Input
        value={name}
        onChangeText={handleNameChange}
        placeholder="Your name"
        error={error || undefined}
        autoFocus
        returnKeyType="next"
        onSubmitEditing={handleContinue}
        clearable
        characterLimit={50}
        autoCapitalize="words"
        autoCorrect={false}
      />

      {/* Encouraging message */}
      {showGreeting && !error && (
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>
            Nice to meet you, {name}! 👋
          </Text>
        </View>
      )}
    </QuestionScreen>
  );
}

const styles = StyleSheet.create({
  greetingContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    alignItems: 'center',
  },
  greetingText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    color: Colors.interactive.primary,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
});
