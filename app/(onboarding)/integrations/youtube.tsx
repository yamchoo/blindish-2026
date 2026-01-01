/**
 * YouTube Integration Screen
 * Dedicated screen for connecting YouTube account
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Easing, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button, AnimatedBackground } from '@/components/ui';
import { IntegrationSuccessModal } from '@/components/onboarding';
import { useAuthStore } from '@/stores/authStore';
import { youtubeAuthService } from '@/features/auth/services/youtubeAuthService';
import { youtubeDataService } from '@/features/personality/services/youtubeDataService';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing, BorderRadius } from '@/lib/constants/typography';

const INSIGHTS = [
  { icon: '🎬', text: 'Understand your interests and learning style' },
  { icon: '📚', text: 'Find matches through content preferences' },
  { icon: '💫', text: 'Connect over shared channels and topics' },
];

export default function YouTubeIntegrationScreen() {
  const { user } = useAuthStore();
  const [connecting, setConnecting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [alreadyConnected, setAlreadyConnected] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const iconScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Check if already connected
    const profile = useAuthStore.getState().profile;
    if (profile?.youtube_connected) {
      setAlreadyConnected(true);
    }

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing YouTube icon
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(iconScaleAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconScaleAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  const handleConnect = async () => {
    if (!user) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConnecting(true);

    const result = await youtubeAuthService.connect(user.id);

    if (result.success) {
      // Sync detailed YouTube data to database (don't block on this)
      youtubeDataService.syncDetailedDataToDatabase(user.id).catch(err => {
        console.error('Failed to sync detailed YouTube data (non-blocking):', err);
      });

      setConnecting(false);
      setShowSuccessModal(true);
      setAlreadyConnected(true);
    } else {
      setConnecting(false);
      // Show error in a friendly way
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleModalContinue = () => {
    setShowSuccessModal(false);
    router.push('/(onboarding)/analysis');
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(onboarding)/analysis');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground opacity={0.2} speed={0.5} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={28} color={Colors.interactive.primary} />
            </TouchableOpacity>

            {/* Main Content */}
            <View style={styles.main}>
              {/* YouTube Icon */}
              <Animated.View
                style={[
                  styles.iconContainer,
                  { transform: [{ scale: iconScaleAnim }] },
                ]}
              >
                <Ionicons name="logo-youtube" size={72} color="#FF0000" />
              </Animated.View>

              <Text style={styles.title}>Connect YouTube</Text>

              <Text style={styles.description}>
                Your watch history reveals your curiosity. We'll understand what you love to learn and explore.
              </Text>

              {/* Insights Cards */}
              <View style={styles.insightsSection}>
                <Text style={styles.insightsSectionTitle}>What we'll discover:</Text>
                {INSIGHTS.map((insight, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.insightCard,
                      {
                        opacity: fadeAnim,
                        transform: [
                          {
                            translateX: slideAnim.interpolate({
                              inputRange: [0, 30],
                              outputRange: [0, 30],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.insightIcon}>{insight.icon}</Text>
                    <Text style={styles.insightText}>{insight.text}</Text>
                  </Animated.View>
                ))}
              </View>

              {/* Privacy Note */}
              <View style={styles.privacyNote}>
                <Ionicons name="lock-closed" size={16} color={Colors.light.text.secondary} />
                <Text style={styles.privacyText}>
                  We only read your public data. Never posted or shared.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Fixed Bottom Section */}
          <View style={styles.footer}>
            {alreadyConnected ? (
              <>
                <View style={styles.connectedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#FF0000" />
                  <Text style={styles.connectedText}>YouTube Connected</Text>
                </View>
                <Button
                  title="Continue"
                  onPress={handleModalContinue}
                  size="lg"
                  fullWidth
                />
              </>
            ) : (
              <>
                <Button
                  title="Connect YouTube"
                  onPress={handleConnect}
                  size="lg"
                  fullWidth
                  loading={connecting}
                />
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                  <Text style={styles.skipText}>Skip for now</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      </SafeAreaView>

      {/* Success Modal */}
      <IntegrationSuccessModal
        visible={showSuccessModal}
        platform="youtube"
        onContinue={handleModalContinue}
      />
    </View>
  );
}

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
  },
  backButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  insightsSection: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  insightsSectionTitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.1)',
  },
  insightIcon: {
    fontSize: Typography.sizes['2xl'],
    marginRight: Spacing.md,
  },
  insightText: {
    flex: 1,
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    color: Colors.light.text.primary,
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  privacyText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    color: Colors.light.text.secondary,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: Spacing.sm,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  connectedText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: '#FF0000',
  },
  skipButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  skipText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    color: Colors.light.text.secondary,
  },
});
