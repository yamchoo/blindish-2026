/**
 * Animated Background Component
 * Creates an animated gradient background similar to the demo site
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'react-native';

interface AnimatedBackgroundProps {
  opacity?: number;
  speed?: number;
}

const LIGHT_MODE_COLORS = ['#FF6B6B', '#FFB6B6', '#FF8BA7', '#FFD4C8', '#F5F5F5'];
const DARK_MODE_COLORS = ['#3D1A1A', '#C25A70', '#B06A50', '#FF6B6B', '#FFB6B6'];

export function AnimatedBackground({ opacity = 0.4, speed = 0.5 }: AnimatedBackgroundProps) {
  const colorScheme = useColorScheme();
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 5000 / speed,
          useNativeDriver: false,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 5000 / speed,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [speed]);

  const colors = colorScheme === 'dark' ? DARK_MODE_COLORS : LIGHT_MODE_COLORS;

  // Interpolate gradient positions for animation
  const startX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  const startY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.2],
  });

  const endX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.7],
  });

  const endY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.8],
  });

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
        <LinearGradient
          colors={colors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
});
