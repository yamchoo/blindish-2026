/**
 * Communication Preference Question Screen
 * Question 3 of 3: What's your communication style?
 */

import React, { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { QuestionScreen, MultipleChoice, type Option } from '@/components/onboarding';
import { useCommunicationStyleStore } from '@/stores/communicationStyleStore';

const OPTIONS: Option[] = [
  {
    value: 'deep_vulnerable',
    label: 'Deep and emotionally vulnerable',
    description: 'Share feelings openly, discuss emotions in depth',
  },
  {
    value: 'light_fun',
    label: 'Light and fun, serious when needed',
    description: 'Keep things lighthearted, go deep occasionally',
  },
  {
    value: 'practical',
    label: 'Practical and solution-focused',
    description: 'Focus on solving problems, less on emotions',
  },
  {
    value: 'balanced',
    label: 'Balanced between all styles',
    description: 'Adapt communication style to the situation',
  },
];

const getCelebrationMessage = (value: string): string => {
  switch (value) {
    case 'deep_vulnerable':
      return 'Emotional depth! 💙';
    case 'light_fun':
      return 'Balanced approach! ⚖️';
    case 'practical':
      return 'Solution-oriented! 🎯';
    case 'balanced':
      return 'Flexible communicator! ✨';
    default:
      return 'Got it! ✨';
  }
};

export default function CommunicationPreferenceQuestion() {
  const { communication_preference, setCommunicationPreference, saveToDatabase } = useCommunicationStyleStore();
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const handleSelect = (value: string) => {
    setCommunicationPreference(value);

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

    // Navigate to the next onboarding step: Spotify integration
    router.push('/(onboarding)/integrations/spotify');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <QuestionScreen
      emoji="💬"
      title="In relationships, you prefer communication that is:"
      description="Matching communication styles leads to better understanding"
      progress={3 / 3}
      totalQuestions={3}
      currentQuestion={3}
      canContinue={!!communication_preference}
      onContinue={handleContinue}
      onBack={handleBack}
      loading={loading}
      celebrationMessage={celebrationMessage}
      showCelebration={showCelebration}
      showGlobalProgress={false}
    >
      <MultipleChoice
        options={OPTIONS}
        selected={communication_preference}
        onSelect={handleSelect}
      />
    </QuestionScreen>
  );
}
