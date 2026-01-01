/**
 * Onboarding Complete Screen
 * Congratulations screen and redirect to main app
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Animated, Easing, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Button, AnimatedBackground } from '@/components/ui';
import { CelebrationOverlay } from '@/components/onboarding';
import { useAuth } from '@/features/auth';
import { useAuthStore } from '@/stores/authStore';
import { useBasicInfoStore } from '@/stores/basicInfoStore';
import { supabase, withRetryAndFallback, directUpdate } from '@/lib/supabase';
import { getAuthToken } from '@/lib/supabase/session-helper';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing, BorderRadius } from '@/lib/constants/typography';

export default function CompleteScreen() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Get user data from stores for personalization
  const { name } = useBasicInfoStore();
  const profile = useAuthStore((state) => state.profile);

  // Animation refs
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Show celebration overlay
    setShowCelebration(true);

    // Staggered entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 400, // After confetti starts
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: 400,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStart = async () => {
    if (!user) return;

    setLoading(true);

    // Set operation in progress to prevent navigation redirects
    useAuthStore.getState().setOperationInProgress(true);

    try {
      // Mark onboarding as complete with retry/fallback pattern
      const completionData = {
        onboarding_completed: true,
        onboarding_step: 5,
        updated_at: new Date().toISOString(),
      };

      // Get auth token for fallback operations (from in-memory auth store, no network call)
      const authToken = getAuthToken();

      const { error } = await withRetryAndFallback(
        () => supabase.from('profiles').update(completionData).eq('id', user.id),
        (token) =>
          directUpdate('profiles', completionData, [
            { column: 'id', operator: 'eq', value: user.id },
          ], token),
        undefined,
        authToken
      );

      if (error) {
        console.error('Error completing onboarding:', error);
        Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
        return;
      }

      // Refresh profile to update the onboarding state
      await refreshProfile();

      // Navigate to main app (tabs)
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error in handleStart:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      // Clear operation in progress flag
      useAuthStore.getState().setOperationInProgress(false);
    }
  };

  // Helper to generate personalized summary items
  const getSummaryItems = () => {
    const items = [];

    // Name and age
    if (name && profile?.age) {
      items.push({
        emoji: '👋',
        text: `You're ${name}, ${profile.age}`,
      });
    }

    // Music/Content connection
    if (profile?.spotify_connected) {
      items.push({
        emoji: '🎵',
        text: 'Music lover with great taste',
      });
    } else if (profile?.youtube_connected) {
      items.push({
        emoji: '📺',
        text: 'Curious mind with diverse interests',
      });
    } else {
      items.push({
        emoji: '✨',
        text: 'Ready to share your unique story',
      });
    }

    // Looking for
    if (profile?.looking_for_men && profile?.looking_for_women) {
      items.push({
        emoji: '💕',
        text: 'Open to meaningful connections',
      });
    } else if (profile?.looking_for_men) {
      items.push({
        emoji: '💕',
        text: 'Looking for genuine connections',
      });
    } else if (profile?.looking_for_women) {
      items.push({
        emoji: '💕',
        text: 'Seeking authentic relationships',
      });
    }

    return items;
  };

  const summaryItems = getSummaryItems();

  return (
    <View style={styles.container}>
      <AnimatedBackground opacity={0.3} speed={0.5} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Scrollable Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.main,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Text style={styles.emoji}>🎊</Text>

              <Text style={styles.title}>
                You're all set{name ? `, ${name}` : ''}!
              </Text>

              <Text style={styles.description}>
                You're ready to discover connections based on who you really are, not just looks.
              </Text>

              {/* Personalized Journey Summary */}
              {summaryItems.length > 0 && (
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>What we learned about you:</Text>
                  <View style={styles.summaryItems}>
                    {summaryItems.map((item, index) => (
                      <SummaryItem key={index} emoji={item.emoji} text={item.text} />
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.features}>
                <FeatureItem
                  emoji="🔍"
                  text="Browse compatible matches"
                />
                <FeatureItem
                  emoji="💬"
                  text="Start meaningful conversations"
                />
                <FeatureItem
                  emoji="✨"
                  text="Watch photos unblur as you connect"
                />
              </View>

              <Text style={styles.tip}>
                💡 Tip: You can update your integrations or profile settings anytime
              </Text>
            </Animated.View>
          </ScrollView>

          {/* Fixed Bottom Button */}
          <View style={styles.bottom}>
            <Button
              title="Show me my matches! ✨"
              onPress={handleStart}
              size="lg"
              fullWidth
              loading={loading}
            />
          </View>
        </View>
      </SafeAreaView>

      {/* Big Confetti Celebration */}
      <CelebrationOverlay
        visible={showCelebration}
        message="You did it! 🎊"
        intensity="high"
        onComplete={() => setShowCelebration(false)}
      />
    </View>
  );
}

interface SummaryItemProps {
  emoji: string;
  text: string;
}

const SummaryItem: React.FC<SummaryItemProps> = ({ emoji, text }) => (
  <View style={styles.summaryItem}>
    <Text style={styles.summaryEmoji}>{emoji}</Text>
    <Text style={styles.summaryText}>{text}</Text>
  </View>
);

interface FeatureItemProps {
  emoji: string;
  text: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ emoji, text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureEmoji}>{emoji}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
  },
  main: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  emoji: {
    fontSize: 80,
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.light.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.lg,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.lg * Typography.lineHeights.relaxed,
    marginBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.md,
  },
  // Personalized Journey Summary Card
  summaryCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.1)',
  },
  summaryTitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.light.text.secondary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  summaryItems: {
    gap: Spacing.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  summaryEmoji: {
    fontSize: Typography.sizes.xl,
  },
  summaryText: {
    flex: 1,
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    color: Colors.light.text.primary,
  },
  // Features Section
  features: {
    width: '100%',
    gap: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  featureEmoji: {
    fontSize: Typography.sizes['2xl'],
  },
  featureText: {
    flex: 1,
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    color: Colors.light.text.primary,
  },
  bottom: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  tip: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
});
