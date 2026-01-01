/**
 * Celebration Overlay Component
 * Shows confetti and milestone messages during onboarding
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing } from '@/lib/constants/typography';

interface CelebrationOverlayProps {
  visible: boolean;
  message: string;
  intensity?: 'low' | 'medium' | 'high';
  onComplete: () => void;
}

const { width, height } = Dimensions.get('window');

export function CelebrationOverlay({
  visible,
  message,
  intensity = 'medium',
  onComplete,
}: CelebrationOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Confetti animation refs (simplified - can be enhanced with react-native-confetti-cannon)
  const confettiAnimations = useRef(
    Array.from({ length: 20 }, () => ({
      translateY: new Animated.Value(-50),
      translateX: new Animated.Value(Math.random() * width - width / 2),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // Haptic feedback based on intensity
      switch (intensity) {
        case 'low':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'high':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
      }

      // Fade in and scale up message
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate confetti
      confettiAnimations.forEach((anim, index) => {
        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: height,
            duration: 2000 + Math.random() * 1000,
            delay: Math.random() * 200,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: 1,
            duration: 2000,
            delay: Math.random() * 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 2000,
            delay: 1000,
            useNativeDriver: true,
          }),
        ]).start();
      });

      // Auto-dismiss after 2 seconds
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Reset animations for next use
          fadeAnim.setValue(0);
          scaleAnim.setValue(0.8);
          confettiAnimations.forEach((anim) => {
            anim.translateY.setValue(-50);
            anim.rotate.setValue(0);
            anim.opacity.setValue(1);
          });
          onComplete();
        });
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [visible, intensity]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        {/* Confetti particles */}
        {confettiAnimations.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                left: width / 2,
                opacity: anim.opacity,
                transform: [
                  { translateX: anim.translateX },
                  { translateY: anim.translateY },
                  {
                    rotate: anim.rotate.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '720deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.confettiPiece,
                { backgroundColor: getConfettiColor(index) },
              ]}
            />
          </Animated.View>
        ))}

        {/* Celebration message */}
        <Animated.View
          style={[
            styles.messageContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.message}>{message}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Helper to get confetti colors
function getConfettiColor(index: number): string {
  const colors = [
    Colors.interactive.primary,
    Colors.peach,
    Colors.pink,
    '#FFD700', // Gold
    '#87CEEB', // Sky blue
    '#FF69B4', // Hot pink
  ];
  return colors[index % colors.length];
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    top: 0,
  },
  confettiPiece: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  messageContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: width - Spacing.xl * 2,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  message: {
    fontFamily: Typography.fonts.serif,
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.light.text.primary,
    textAlign: 'center',
  },
});
