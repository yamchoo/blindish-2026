/**
 * CardActionButtons Component
 * Displays heart (like) and X (pass) buttons at the bottom of story cards
 * Replaces both per-card like button and footer buttons
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/lib/constants/colors';

interface CardActionButtonsProps {
  onLike: () => void;
  onPass: () => void;
}

export function CardActionButtons({ onLike, onPass }: CardActionButtonsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onLike();
  };

  const handlePass = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onPass();
  };

  return (
    <View style={styles.container}>
      {/* Pass Button (X) */}
      <TouchableOpacity
        style={styles.buttonWrapper}
        onPress={handlePass}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <BlurView
          intensity={isDark ? 30 : 80}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blurContainer}
        >
          <View style={[styles.buttonInner, styles.passButton]}>
            <Ionicons
              name="close-circle"
              size={32}
              color={Colors.light.text.secondary}
            />
          </View>
        </BlurView>
      </TouchableOpacity>

      {/* Like Button (Heart) */}
      <TouchableOpacity
        style={styles.buttonWrapper}
        onPress={handleLike}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <BlurView
          intensity={isDark ? 30 : 80}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blurContainer}
        >
          <View style={[styles.buttonInner, styles.likeButton]}>
            <Ionicons
              name="heart"
              size={32}
              color={Colors.interactive.primary}
            />
          </View>
        </BlurView>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  buttonWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  blurContainer: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  buttonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  passButton: {
    // X button styling
  },
  likeButton: {
    // Heart button styling
  },
});
