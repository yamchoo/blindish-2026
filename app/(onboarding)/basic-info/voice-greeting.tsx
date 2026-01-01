/**
 * Voice Greeting Screen
 * Question 7/7: Record a short greeting
 * Saves all basic info to database before proceeding
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { QuestionScreen } from '@/components/onboarding';
import { VoiceRecorder } from '@/features/voice/components/VoiceRecorder';
import { voiceRecordingService } from '@/features/voice/services/voiceRecordingService';
import { useAuth } from '@/features/auth';
import { useAuthStore } from '@/stores/authStore';
import { useBasicInfoStore } from '@/stores/basicInfoStore';
import { supabase, withRetryAndFallback, directUpdate } from '@/lib/supabase';
import { getAuthToken } from '@/lib/supabase/session-helper';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing } from '@/lib/constants/typography';

export default function VoiceGreetingScreen() {
  const { user, refreshProfile } = useAuth();
  const { saveToDatabase } = useBasicInfoStore();
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [uploading, setUploading] = useState(false);

  const handleRecordingComplete = (uri: string, duration: number) => {
    setRecordingUri(uri);
    setDurationSeconds(duration);
  };

  const handleContinue = async () => {
    if (!user || !recordingUri) return;

    setUploading(true);

    // Set operation in progress to prevent navigation redirects
    useAuthStore.getState().setOperationInProgress(true);

    try {
      // First, save all basic info (name, birthday, gender, looking_for, occupation, height)
      const basicInfoResult = await saveToDatabase();
      if (!basicInfoResult.success) {
        console.error('Error saving basic info:', basicInfoResult.error);
        Alert.alert('Error', basicInfoResult.error?.message || 'Failed to save your information. Please try again.');
        useAuthStore.getState().setOperationInProgress(false);
        setUploading(false);
        return;
      }

      // Upload voice greeting to Supabase storage
      const voiceUrl = await voiceRecordingService.uploadVoiceGreeting(
        user.id,
        recordingUri
      );

      // Update profile with voice greeting URL
      const voiceData = {
        voice_greeting_url: voiceUrl,
        voice_duration_seconds: durationSeconds,
        onboarding_step: 3,
        updated_at: new Date().toISOString(),
      };

      // Get auth token for fallback operations (from in-memory auth store, no network call)
      const authToken = getAuthToken();

      const { error } = await withRetryAndFallback(
        () => supabase.from('profiles').update(voiceData).eq('id', user.id),
        (token) =>
          directUpdate('profiles', voiceData, [
            { column: 'id', operator: 'eq', value: user.id },
          ], token),
        undefined,
        authToken
      );

      if (error) {
        console.error('Error updating voice greeting:', error);
        Alert.alert('Error', 'Failed to save your voice greeting. Please try again.');
        return;
      }

      await refreshProfile();
      router.push('/(onboarding)/lifestyle-intro');
    } catch (error) {
      console.error('Error in handleContinue:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setUploading(false);
      // Clear operation in progress flag
      useAuthStore.getState().setOperationInProgress(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;

    setUploading(true);

    // Set operation in progress to prevent navigation redirects
    useAuthStore.getState().setOperationInProgress(true);

    try {
      // First, save all basic info (name, birthday, gender, looking_for, occupation, height)
      const basicInfoResult = await saveToDatabase();
      if (!basicInfoResult.success) {
        console.error('Error saving basic info:', basicInfoResult.error);
        Alert.alert('Error', basicInfoResult.error?.message || 'Failed to save your information. Please try again.');
        useAuthStore.getState().setOperationInProgress(false);
        setUploading(false);
        return;
      }

      // Update onboarding step without voice greeting
      const stepData = {
        onboarding_step: 3,
        updated_at: new Date().toISOString(),
      };

      // Get auth token for fallback operations (from in-memory auth store, no network call)
      const authToken = getAuthToken();

      const { error } = await withRetryAndFallback(
        () => supabase.from('profiles').update(stepData).eq('id', user.id),
        (token) =>
          directUpdate('profiles', stepData, [
            { column: 'id', operator: 'eq', value: user.id },
          ], token),
        undefined,
        authToken
      );

      if (error) {
        console.error('Error updating onboarding step:', error);
        Alert.alert('Error', 'Failed to skip. Please try again.');
        return;
      }

      await refreshProfile();
      router.push('/(onboarding)/lifestyle-intro');
    } catch (error) {
      console.error('Error in handleSkip:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setUploading(false);
      // Clear operation in progress flag
      useAuthStore.getState().setOperationInProgress(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <QuestionScreen
      title="Let them hear your voice 🎤"
      description="Record a short greeting so matches can get a sense of your personality"
      progress={7 / 7}
      totalQuestions={7}
      currentQuestion={7}
      canContinue={!!recordingUri && !uploading}
      onContinue={handleContinue}
      onBack={handleBack}
      showGlobalProgress={false}
      continueButtonText={uploading ? 'Saving...' : 'Continue'}
      showSkip={true}
      onSkip={handleSkip}
    >
      <View style={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoEmoji}>✨</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Why add a voice greeting?</Text>
            <Text style={styles.infoText}>
              Your voice reveals personality, warmth, and authenticity in ways photos can't.
              Matches can hear your greeting before deciding to connect!
            </Text>
          </View>
        </View>

        {/* Voice Recorder */}
        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          maxDurationSeconds={30}
        />

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for a great greeting:</Text>
          <View style={styles.tipsList}>
            <TipItem text="Be yourself and speak naturally" />
            <TipItem text="Share something interesting about you" />
            <TipItem text="Keep it short and sweet (10-20 seconds)" />
            <TipItem text="Record in a quiet place" />
          </View>
        </View>
      </View>
    </QuestionScreen>
  );
}

interface TipItemProps {
  text: string;
}

const TipItem: React.FC<TipItemProps> = ({ text }) => (
  <View style={styles.tipItem}>
    <View style={styles.tipDot} />
    <Text style={styles.tipText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  content: {
    gap: Spacing.xl,
  },
  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.1)',
    gap: Spacing.md,
  },
  infoEmoji: {
    fontSize: Typography.sizes['2xl'],
  },
  infoContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  infoTitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.light.text.primary,
  },
  infoText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    color: Colors.light.text.secondary,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
  },
  // Tips Section
  tipsContainer: {
    gap: Spacing.md,
  },
  tipsTitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.light.text.secondary,
  },
  tipsList: {
    gap: Spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingLeft: Spacing.sm,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.interactive.primary,
    marginTop: 7,
  },
  tipText: {
    flex: 1,
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    color: Colors.light.text.secondary,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
  },
});
