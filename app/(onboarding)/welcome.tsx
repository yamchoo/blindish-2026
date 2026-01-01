/**
 * Welcome Screen
 * First onboarding screen - explains the app concept
 */

import { AnimatedBackground, Button } from '@/components/ui';
import { Colors } from '@/lib/constants/colors';
import { Spacing, Typography } from '@/lib/constants/typography';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Fade in and slide up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    router.push('/(onboarding)/basic-info/name');
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground opacity={0.3} speed={0.5} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >

            {/* Main Content */}
            <View style={styles.main}>
              {/* Pulsing Heart Emoji */}
              <Text style={styles.emojiLarge}>💘</Text>

              <Text style={styles.logo}>blindish</Text>
              <Text style={styles.tagline}>Let's find your person</Text>

              <View style={styles.features}>
                <FeatureItem
                  emoji="🎭"
                  title="AI-Powered Matching"
                  description="Match based on personality, not just looks. Our AI analyzes your digital footprint to find compatible connections."
                />

                <FeatureItem
                  emoji="💬"
                  title="Progressive Unblurring"
                  description="Photos start blurred. As you have meaningful conversations, they gradually become clear."
                />

                <FeatureItem
                  emoji="🎵"
                  title="Beyond Swipes"
                  description="Connect through inferred similiarity via Spotify, YouTube, and real interests—not just profile pics and stated preferences."
                />
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View style={styles.footer}>
          <Button
            title="I'm ready"
            onPress={handleContinue}
            size="lg"
            fullWidth
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

interface FeatureItemProps {
  emoji: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ emoji, title, description }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureEmoji}>{emoji}</Text>
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  demoContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  demoHint: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    color: Colors.light.text.secondary,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  emojiLarge: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  logo: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes['4xl'],
    fontWeight: '700' as any,
    color: Colors.interactive.primary,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    color: Colors.light.text.secondary,
  },
  main: {
    flex: 1,
    paddingTop: Spacing.xl,
  },
  title: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.light.text.primary,
    lineHeight: Typography.sizes['3xl'] * Typography.lineHeights.tight,
  },
  features: {
    marginTop: Spacing['2xl'],
    gap: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  featureEmoji: {
    fontSize: Typography.sizes['3xl'],
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.light.text.primary,
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    color: Colors.light.text.secondary,
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});
