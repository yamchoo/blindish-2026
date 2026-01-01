/**
 * Login Screen
 * Sign in with Google or Apple
 */

import { BlurRevealDemo } from '@/components/onboarding';
import { AnimatedBackground, Button } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { Colors } from '@/lib/constants/colors';
import { Spacing, Typography } from '@/lib/constants/typography';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading('google');
      const { success, error } = await signInWithGoogle();

      if (!success || error) {
        console.error('Sign in failed:', error);
        Alert.alert('Sign In Failed', error?.message || 'Failed to sign in with Google');
        setLoading(null);
        return;
      }

      // Auth state listener will handle navigation
      // Loading state will be cleared by navigation
    } catch (error) {
      console.error('Error in Google sign in:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading('apple');
      const { success, error } = await signInWithApple();

      if (!success || error) {
        console.error('Sign in failed:', error);
        Alert.alert('Sign In Failed', error?.message || 'Failed to sign in with Apple');
        setLoading(null);
        return;
      }

      // Auth state listener will handle navigation
      // Loading state will be cleared by navigation
    } catch (error) {
      console.error('Error in Apple sign in:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground opacity={0.3} speed={0.5} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>

          {/* Header */}
          <View style={styles.header}>
            <BlurRevealDemo size={200} />
            <Text style={styles.logo}>blindish</Text>
          </View>

          {/* Main Content */}
          <View style={styles.main}>
            <Text style={styles.description}>
              AI-Powered Matchmaking based on personality and interests, not just looks. Photos unblur as
              you have meaningful conversations.
            </Text>
          </View>

          {/* Sign In Buttons */}
          <View style={styles.footer}>
            <Button
              title="Continue with Google"
              onPress={handleGoogleSignIn}
              size="lg"
              fullWidth
              loading={loading === 'google'}
              disabled={loading !== null}
            />

            <Button
              title="Continue with Apple"
              onPress={handleAppleSignIn}
              size="lg"
              variant="outline"
              fullWidth
              loading={loading === 'apple'}
              disabled={loading !== null}
            />

            <Text style={styles.terms}>
              By continuing, you agree to our{'\n'}
              <Text style={styles.link}>Terms of Service</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
  },
  logo: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.interactive.primary,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    color: Colors.light.text.secondary,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: Spacing['3xl'],
  },
  title: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes['5xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.light.text.primary,
    lineHeight: Typography.sizes['5xl'] * Typography.lineHeights.tight,
  },
  description: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.lg,
    color: Colors.light.text.secondary,
    lineHeight: Typography.sizes.lg * Typography.lineHeights.relaxed,
    marginTop: Spacing.xl,
  },
  footer: {
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  terms: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.xs,
    color: Colors.light.text.tertiary,
    textAlign: 'center',
    lineHeight: Typography.sizes.xs * Typography.lineHeights.relaxed,
    marginTop: Spacing.sm,
  },
  link: {
    color: Colors.interactive.primary,
    textDecorationLine: 'underline',
  },
});
