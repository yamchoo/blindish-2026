import { View, Text, StyleSheet, ActivityIndicator, Animated, Easing } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { router } from 'expo-router';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing, BorderRadius } from '@/lib/constants/typography';
import { useAuthStore } from '@/stores/authStore';
import { personalityService } from '@/features/personality/services/personalityService';

const STATUS_MESSAGES = [
  { emoji: '🎵', text: 'Analyzing your music taste...' },
  { emoji: '📊', text: 'Crunching personality data...' },
  { emoji: '💭', text: 'Finding your patterns...' },
  { emoji: '✨', text: 'Building your profile...' },
  { emoji: '🎯', text: 'Almost there...' },
];

export default function AnalysisScreen() {
  const { user } = useAuthStore();
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [error, setError] = useState(false);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    // Start personality analysis
    analyzePersonality();

    // Progress bar animation (0 to 1 over 30 seconds)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 30000,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: false,
    }).start();

    // Cycle through status messages every 5 seconds
    const messageInterval = setInterval(() => {
      setCurrentStatusIndex((prev) =>
        prev < STATUS_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 5000);

    // Pulsing brain emoji animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      clearInterval(messageInterval);
      pulseAnimation.stop();
    };
  }, [user]);

  const analyzePersonality = async () => {
    if (!user) return;

    try {
      const success = await personalityService.analyzeUserPersonality(user.id);

      if (success) {
        // Wait a moment to show completion message
        setTimeout(() => {
          router.push('/(onboarding)/personality-results');
        }, 1000);
      } else {
        setError(true);
        setTimeout(() => {
          // Fallback: still navigate to results even if analysis failed
          router.push('/(onboarding)/personality-results');
        }, 2000);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(true);
      setTimeout(() => {
        router.push('/(onboarding)/personality-results');
      }, 2000);
    }
  };

  const currentStatus = STATUS_MESSAGES[currentStatusIndex];
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Animated Brain Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.icon}>🧠</Text>
        </Animated.View>

        <Text style={styles.title}>Analyzing Your Personality</Text>

        {/* Progress Container */}
        <View style={styles.progressContainer}>
          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressWidth },
              ]}
            />
          </View>

          {/* Status Message with Emoji */}
          <View style={styles.statusRow}>
            <Text style={styles.statusEmoji}>{currentStatus.emoji}</Text>
            <Text style={[styles.statusText, error && styles.errorMessage]}>
              {currentStatus.text}
            </Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          This will just take a moment...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontFamily: 'Cormorant-Bold',
    fontSize: Typography.sizes['3xl'],
    color: Colors.light.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  progressContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.interactive.primary,
    borderRadius: BorderRadius.full,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  statusEmoji: {
    fontSize: Typography.sizes.xl,
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: Typography.sizes.lg,
    color: Colors.light.text.primary,
    textAlign: 'center',
  },
  errorMessage: {
    color: Colors.light.error,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: Typography.sizes.base,
    color: Colors.light.text.secondary,
    textAlign: 'center',
  },
});
