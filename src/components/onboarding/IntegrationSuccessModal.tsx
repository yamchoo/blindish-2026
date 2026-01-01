/**
 * Integration Success Modal
 * Animated celebration modal when user connects Spotify/YouTube
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SpotifyLogo } from '@/components/icons';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing, BorderRadius } from '@/lib/constants/typography';
import { Button } from '@/components/ui';

interface IntegrationSuccessModalProps {
  visible: boolean;
  platform: 'spotify' | 'youtube' | null;
  onContinue: () => void;
}

const PLATFORM_CONFIG = {
  spotify: {
    color: '#1DB954',
    title: 'Connected to Spotify! 🎉',
    insights: [
      'Match based on music taste and concert-going habits',
      'Discover shared playlists and favorite artists',
      'Connect through emotional expression in music',
    ],
  },
  youtube: {
    color: '#FF0000',
    icon: 'logo-youtube' as const,
    title: 'Connected to YouTube! 🎉',
    insights: [
      'Understand your interests and learning style',
      'Find matches through content preferences',
      'Connect over shared channels and topics',
    ],
  },
};

const { width: screenWidth } = Dimensions.get('window');

export function IntegrationSuccessModal({
  visible,
  platform,
  onContinue,
}: IntegrationSuccessModalProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const iconScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && platform) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Slide up and fade in animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulsing icon animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(iconScaleAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(iconScaleAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      // Reset animations
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      iconScaleAnim.setValue(1);
    }
  }, [visible, platform]);

  if (!platform) return null;

  const config = PLATFORM_CONFIG[platform];

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onContinue();
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleContinue}
      >
        <Animated.View
          style={[
            styles.modal,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Platform Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              { backgroundColor: config.color },
              { transform: [{ scale: iconScaleAnim }] },
            ]}
          >
            {platform === 'spotify' ? (
              <SpotifyLogo size={48} color="white" />
            ) : platform === 'youtube' ? (
              <Ionicons name={PLATFORM_CONFIG.youtube.icon} size={48} color="white" />
            ) : null}
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>{config.title}</Text>

          {/* Insights */}
          <View style={styles.insightsContainer}>
            <Text style={styles.insightsTitle}>What we'll learn:</Text>
            {config.insights.map((insight, index) => (
              <View key={index} style={styles.insightRow}>
                <View style={styles.bullet} />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>

          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <Ionicons name="lock-closed" size={16} color={Colors.light.text.secondary} />
            <Text style={styles.privacyText}>
              Your data is encrypted and never shared
            </Text>
          </View>

          {/* Continue Button */}
          <Button
            title="Continue"
            onPress={handleContinue}
            size="lg"
            fullWidth
          />
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modal: {
    width: screenWidth - Spacing.xl * 2,
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.light.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  insightsContainer: {
    backgroundColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  insightsTitle: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.light.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.interactive.primary,
    marginTop: 7,
    marginRight: Spacing.sm,
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
    marginBottom: Spacing.lg,
  },
  privacyText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    color: Colors.light.text.secondary,
  },
});
