/**
 * Lifestyle Questions Intro Screen
 * Prepares user for the lifestyle questions sequence
 */

import { AnimatedBackground, Button } from '@/components/ui';
import { Colors } from '@/lib/constants/colors';
import { BorderRadius, Spacing, Typography } from '@/lib/constants/typography';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LifestyleIntroScreen() {
  const handleContinue = () => {
    router.push('/(onboarding)/lifestyle/drinking');
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground opacity={0.2} speed={0.5} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>💭</Text>
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Now, let's talk about you</Text>
              <Text style={styles.subtitle}>
                We'll ask a few lifestyle questions to help find your most compatible matches.
                These questions help us understand what matters to you in a relationship.
              </Text>
            </View>

            {/* Info Cards */}
            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <Text style={styles.infoEmoji}>🔒</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Your Privacy Matters</Text>
                  <Text style={styles.infoText}>
                    You control what information is visible on your profile
                  </Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoEmoji}>💭</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Be Honest</Text>
                  <Text style={styles.infoText}>
                    Authentic answers lead to better matches and connections
                  </Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoEmoji}>⏱️</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Takes 2 Minutes</Text>
                  <Text style={styles.infoText}>
                    Just a few quick questions about your lifestyle
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View style={styles.footer}>
          <Button
            title="Let's do this"
            onPress={handleContinue}
            size="lg"
            fullWidth
          />
        </View>
      </SafeAreaView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.light.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
    paddingHorizontal: Spacing.md,
  },
  infoSection: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  infoEmoji: {
    fontSize: 32,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.light.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  infoText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    color: Colors.light.text.secondary,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});
