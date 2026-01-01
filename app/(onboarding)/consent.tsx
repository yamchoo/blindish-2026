/**
 * Consent & Permissions Screen
 * Get user consent for data processing and digital footprint access
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, AnimatedBackground } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useAuthStore } from '@/stores/authStore';
import { supabase, withRetryAndFallback, directUpdate } from '@/lib/supabase';
import { getAuthToken } from '@/lib/supabase/session-helper';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing, BorderRadius } from '@/lib/constants/typography';

interface ConsentItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

const CONSENT_ITEMS: ConsentItem[] = [
  {
    id: 'data_processing',
    title: 'Find Your Perfect Match',
    description: 'Use my profile to connect me with compatible people who share my values and interests.',
    required: true,
  },
];

interface BenefitCard {
  emoji: string;
  title: string;
  description: string;
}

const BENEFIT_CARDS: BenefitCard[] = [
  {
    emoji: '🎵',
    title: 'Music Taste Analysis',
    description: 'Find matches with similar vibes and concert-going habits',
  },
  {
    emoji: '📺',
    title: 'Interest Matching',
    description: 'Connect through shared hobbies and content preferences',
  },
  {
    emoji: '🧠',
    title: 'Personality Insights',
    description: 'Match based on compatibility, not just surface preferences',
  },
];

export default function ConsentScreen() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [consents, setConsents] = useState<Record<string, boolean>>({
    data_processing: false,
  });

  const toggleConsent = (id: string) => {
    setConsents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const canContinue = CONSENT_ITEMS
    .filter(item => item.required)
    .every(item => consents[item.id]);

  const handleContinue = async () => {
    if (!canContinue) {
      Alert.alert('Required Consent', 'Please accept the required consents to continue.');
      return;
    }

    if (!user) return;

    setLoading(true);

    // Set operation in progress to prevent navigation redirects
    useAuthStore.getState().setOperationInProgress(true);

    try {
      // Check if user has connected any integrations
      const profile = useAuthStore.getState().profile;
      const hasIntegrations = profile?.spotify_connected || profile?.youtube_connected;

      // Update profile with consent using retry/fallback pattern
      // Auto-consent to digital footprint if user connected Spotify/YouTube
      const consentData = {
        consent_data_processing: consents.data_processing,
        consent_digital_footprint: hasIntegrations || false,
        consent_timestamp: new Date().toISOString(),
        onboarding_step: 4,
        updated_at: new Date().toISOString(),
      };

      // Get auth token for fallback operations (from in-memory auth store, no network call)
      const authToken = getAuthToken();

      const { error } = await withRetryAndFallback(
        () => supabase.from('profiles').update(consentData).eq('id', user.id),
        (token) =>
          directUpdate('profiles', consentData, [
            { column: 'id', operator: 'eq', value: user.id },
          ], token),
        undefined,
        authToken
      );

      if (error) {
        console.error('Error updating consent:', error);
        Alert.alert('Error', 'Failed to save your consent. Please try again.');
        return;
      }

      await refreshProfile();
      router.push('/(onboarding)/complete');
    } catch (error) {
      console.error('Error in handleContinue:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      // Clear operation in progress flag
      useAuthStore.getState().setOperationInProgress(false);
    }
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>🤝</Text>
            <Text style={styles.title}>One Last Thing</Text>
            <Text style={styles.subtitle}>
              Here's how we'll use your data to find your most compatible matches:
            </Text>
          </View>

          {/* Benefit Cards */}
          <View style={styles.benefitsSection}>
            {BENEFIT_CARDS.map((benefit, index) => (
              <View key={index} style={styles.benefitCard}>
                <Text style={styles.benefitEmoji}>{benefit.emoji}</Text>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDescription}>{benefit.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Consent Items */}
          <View style={styles.consentList}>
            {CONSENT_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.consentItem,
                  consents[item.id] && styles.consentItemChecked,
                ]}
                onPress={() => toggleConsent(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.consentRow}>
                  <View style={styles.consentTextContainer}>
                    <View style={styles.consentTitleRow}>
                      <Text style={styles.consentTitle}>{item.title}</Text>
                      {item.required && (
                        <View style={styles.requiredBadge}>
                          <Text style={styles.requiredBadgeText}>Required</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.consentDescription}>{item.description}</Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      consents[item.id] && styles.checkboxChecked,
                    ]}
                  >
                    {consents[item.id] && (
                      <Ionicons name="checkmark" size={20} color="white" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Privacy Reassurance */}
          <View style={styles.privacySection}>
            <View style={styles.privacyRow}>
              <Ionicons name="lock-closed" size={20} color={Colors.interactive.primary} />
              <Text style={styles.privacyText}>
                Your data is encrypted and never shared with third parties. You can delete everything anytime from settings.
              </Text>
            </View>
          </View>

          {/* Privacy Policy Link - Moved to bottom */}
          <View style={styles.policySection}>
            <Text style={styles.policyText}>
              By continuing, you agree to our{' '}
              <Text style={styles.policyLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.policyLink}>Privacy Policy</Text>.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.footer}>
        <Button
          title="Let's find my matches! 💕"
          onPress={handleContinue}
          size="lg"
          fullWidth
          loading={loading}
          disabled={!canContinue}
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
  },
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.light.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.lg,
    color: Colors.light.text.secondary,
    lineHeight: Typography.sizes.lg * Typography.lineHeights.relaxed,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  // Benefit Cards Section
  benefitsSection: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 107, 107, 0.03)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.08)',
  },
  benefitEmoji: {
    fontSize: Typography.sizes.xl,
    marginRight: Spacing.md,
    marginTop: 2,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.light.text.primary,
    marginBottom: 2,
  },
  benefitDescription: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    color: Colors.light.text.secondary,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
  },
  consentList: {
    marginBottom: Spacing.xl,
  },
  consentItem: {
    padding: Spacing.lg,
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  consentItemChecked: {
    borderColor: Colors.interactive.primary,
    backgroundColor: 'rgba(255, 107, 107, 0.02)',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  consentTextContainer: {
    flex: 1,
  },
  consentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  consentTitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.light.text.primary,
  },
  requiredBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  requiredBadgeText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.light.error,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: Colors.interactive.primary,
    borderColor: Colors.interactive.primary,
  },
  consentDescription: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    color: Colors.light.text.secondary,
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
  },
  // Privacy Reassurance Section
  privacySection: {
    padding: Spacing.lg,
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.1)',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  privacyText: {
    flex: 1,
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    color: Colors.light.text.secondary,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
  },
  policySection: {
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  policyText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.xs,
    color: Colors.light.text.tertiary,
    textAlign: 'center',
    lineHeight: Typography.sizes.xs * Typography.lineHeights.relaxed,
  },
  policyLink: {
    color: Colors.interactive.primary,
    fontWeight: Typography.weights.semibold,
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});
