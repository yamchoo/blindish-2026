/**
 * LikeButton Component
 * Heart button for liking individual story cards
 */

import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '@/lib/constants/colors';

interface LikeButtonProps {
  isLiked: boolean;
  onPress: () => void;
  position?: 'top-right' | 'top-left';
}

export function LikeButton({
  isLiked,
  onPress,
  position = 'top-right',
}: LikeButtonProps) {
  const scale = useSharedValue(1);

  // Animate scale when liked state changes
  useEffect(() => {
    scale.value = withSpring(isLiked ? 1.2 : 1, {
      damping: 10,
      stiffness: 200,
    });
    // Reset to normal size after animation
    setTimeout(() => {
      scale.value = withSpring(1, {
        damping: 10,
        stiffness: 200,
      });
    }, 200);
  }, [isLiked]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const positionStyles = position === 'top-right' ? styles.topRight : styles.topLeft;

  return (
    <TouchableOpacity
      style={[styles.container, positionStyles]}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={24}
          color={isLiked ? Colors.coral : Colors.light.text.primary}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRight: {
    top: 16,
    right: 16,
  },
  topLeft: {
    top: 16,
    left: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
