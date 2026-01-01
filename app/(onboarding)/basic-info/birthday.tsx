/**
 * Birthday Screen
 * Question 2/5: When's your birthday?
 * Calculates age and shows milestone celebrations
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { QuestionScreen } from '@/components/onboarding';
import { Button } from '@/components/ui';
import { useBasicInfoStore } from '@/stores/basicInfoStore';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing, BorderRadius } from '@/lib/constants/typography';

export default function BirthdayScreen() {
  const { dateOfBirth, setDateOfBirth, validateAge } = useBasicInfoStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate age from date of birth
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get milestone celebration message
  const getMilestoneMessage = (age: number): string | null => {
    if (age === 21) return "Welcome to adulthood! 🎉";
    if (age === 25) return "Quarter century! ✨";
    if (age === 30) return "Hello, 30s! 🌟";
    if (age >= 35) return "Experience looks good on you! 💎";
    return null;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // On Android, the picker closes automatically
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDateOfBirth(selectedDate);
      if (error) {
        setError(null);
      }
    }
  };

  const handleContinue = () => {
    const validationError = validateAge();
    if (validationError) {
      setError(validationError);
      return;
    }

    router.push('/(onboarding)/basic-info/gender');
  };

  const handleBack = () => {
    router.back();
  };

  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;
  const milestoneMessage = age ? getMilestoneMessage(age) : null;

  return (
    <QuestionScreen
      title="When's your birthday?"
      description="We'll only show your age, not your birthday"
      progress={2 / 5}
      totalQuestions={5}
      currentQuestion={2}
      canContinue={!!dateOfBirth && !error}
      onContinue={handleContinue}
      onBack={handleBack}
      showGlobalProgress={false}
    >
      <View>
        {/* Date Picker Button */}
        <TouchableOpacity
          style={[
            styles.datePickerButton,
            error && styles.datePickerButtonError,
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text
            style={[
              styles.datePickerText,
              !dateOfBirth && styles.datePickerPlaceholder,
            ]}
          >
            {dateOfBirth ? formatDate(dateOfBirth) : 'Select your birthday'}
          </Text>
          {dateOfBirth && age && (
            <Text style={styles.ageDisplay}>Age: {age}</Text>
          )}
        </TouchableOpacity>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth || new Date(2000, 0, 1)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1924, 0, 1)}
          />
        )}

        {/* iOS: Add done button for date picker */}
        {Platform.OS === 'ios' && showDatePicker && (
          <View style={styles.datePickerActions}>
            <Button
              title="Done"
              onPress={() => setShowDatePicker(false)}
              size="sm"
            />
          </View>
        )}

        {/* Milestone Celebration */}
        {milestoneMessage && !error && (
          <View style={styles.celebrationContainer}>
            <Text style={styles.celebrationText}>{milestoneMessage}</Text>
          </View>
        )}
      </View>
    </QuestionScreen>
  );
}

const styles = StyleSheet.create({
  datePickerButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 16, // Increased from 12
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    minHeight: 56, // Increased from 48
    justifyContent: 'center',
  },
  datePickerButtonError: {
    borderColor: Colors.light.error,
  },
  datePickerText: {
    fontSize: 18, // Increased for mobile readability
    fontFamily: Typography.fonts.sans,
    color: Colors.light.text.primary,
  },
  datePickerPlaceholder: {
    color: Colors.light.text.tertiary,
  },
  ageDisplay: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.sans,
    color: Colors.light.text.secondary,
    marginTop: Spacing.xs,
  },
  errorText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.sans,
    color: Colors.light.error,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  datePickerActions: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  celebrationContainer: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    alignItems: 'center',
  },
  celebrationText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    color: Colors.interactive.primary,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
});
