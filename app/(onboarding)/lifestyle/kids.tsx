/**
 * Kids Question Screen
 * Question 6 of 6: Do you want kids?
 * Final question - saves all data to database
 */

import React, { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { QuestionScreen, MultipleChoice, type Option } from '@/components/onboarding';
import { useLifestyleStore } from '@/stores/lifestyleStore';

const OPTIONS: Option[] = [
  { value: 'want', label: 'Want kids' },
  { value: 'maybe', label: 'Maybe someday' },
  { value: 'dont_want', label: 'Don\'t want kids' },
  { value: 'have_want_more', label: 'Have and want more' },
  { value: 'have_open_to_more', label: 'Have and open to more' },
  { value: 'have_dont_want_more', label: 'Have and don\'t want more' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', description: 'This will reduce the accuracy of our AI matchmaker' },
];

const getCelebrationMessage = (value: string): string => {
  switch (value) {
    case 'want':
      return 'Future parent! 💕';
    case 'maybe':
      return 'Keeping options open! 💭';
    case 'dont_want':
      return 'Childfree clarity! ✨';
    case 'have_want_more':
    case 'have_open_to_more':
    case 'have_dont_want_more':
      return 'Already a parent! 🌟';
    case 'prefer_not_to_say':
      return 'Privacy respected! 🔒';
    default:
      return 'Got it! ✨';
  }
};

export default function KidsQuestion() {
  const { wantsKids, setWantsKids, saveToDatabase } = useLifestyleStore();
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const handleSelect = (value: string) => {
    setWantsKids(value);

    // Show celebration
    const message = getCelebrationMessage(value);
    setCelebrationMessage(message);
    setShowCelebration(true);

    // Hide celebration after 1.5s
    setTimeout(() => {
      setShowCelebration(false);
    }, 1500);
  };

  const handleContinue = async () => {
    setLoading(true);

    const { success, error } = await saveToDatabase();

    if (!success) {
      Alert.alert('Error', error?.message || 'Failed to save answers. Please try again.');
      setLoading(false);
      return;
    }

    // Navigate to next onboarding step: Communication style questions
    router.push('/(onboarding)/communication-intro');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <QuestionScreen
      emoji="👶"
      title="Do you want kids?"
      description="Important for finding compatible long-term matches"
      progress={6 / 6}
      totalQuestions={6}
      currentQuestion={6}
      canContinue={!!wantsKids}
      onContinue={handleContinue}
      onBack={handleBack}
      loading={loading}
      celebrationMessage={celebrationMessage}
      showCelebration={showCelebration}
      showGlobalProgress={false}
    >
      <MultipleChoice
        options={OPTIONS}
        selected={wantsKids}
        onSelect={handleSelect}
      />
    </QuestionScreen>
  );
}
