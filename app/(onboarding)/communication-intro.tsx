/**
 * Communication Style Questions Intro Screen
 * Prepares user for the communication style questions sequence
 */

import { AnimatedBackground, Button } from '@/components/ui';
import { Colors } from '@/lib/constants/colors';
import { BorderRadius, Spacing, Typography } from '@/lib/constants/typography';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CommunicationIntroScreen() {
  const handleContinue = () => {
    router.push('/(onboarding)/communication/conflict-resolution');
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
              <Text style={styles.icon}>💬</Text>
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Let's talk communication</Text>
              <Text style={styles.subtitle}>
                How you communicate in relationships is one of the biggest predictors of compatibility.
                We'll ask just 3 quick questions to help find your best matches.
              </Text>
            </View>

            {/* Info Cards */}
            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <Text style={styles.infoEmoji}>🎯</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Research-Backed</Text>
                  <Text style={styles.infoText}>
                    Communication style is a top predictor of relationship success
                  </Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoEmoji}>💡</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Better Matches</Text>
                  <Text style={styles.infoText}>
                    Find people who communicate in ways that resonate with you
                  </Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoEmoji}>⚡</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Quick & Easy</Text>
                  <Text style={styles.infoText}>
                    Just 3 questions, takes less than a minute
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View style={styles.footer}>
          <Button
            title="Let's go"
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
