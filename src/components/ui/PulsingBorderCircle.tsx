/**
 * Pulsing Border Circle Component
 * Creates an animated circular border with pulsing effect similar to the demo site
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useColorScheme } from 'react-native';

interface PulsingBorderCircleProps {
  size?: number;
  borderWidth?: number;
  children?: React.ReactNode;
  speed?: number;
}

const LIGHT_MODE_COLORS = ['#D4AF37', '#E8C547', '#F0E68C', '#DAA520'];
const DARK_MODE_COLORS = ['#B8860B', '#D4AF37', '#E8C547', '#F0E68C'];

export function PulsingBorderCircle({
  size = 200,
  borderWidth = 4,
  children,
  speed = 1,
}: PulsingBorderCircleProps) {
  const colorScheme = useColorScheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Glow pulse animation (opacity only, no size change)
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 2000 / speed,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000 / speed,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation for shimmer effect
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000 / speed,
        useNativeDriver: true,
      })
    );

    pulse.start();
    rotate.start();

    return () => {
      pulse.stop();
      rotate.stop();
    };
  }, [speed]);

  const colors = colorScheme === 'dark' ? DARK_MODE_COLORS : LIGHT_MODE_COLORS;
  const radius = (size - borderWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.border,
          {
            opacity: pulseAnim,
            transform: [{ rotate }],
          },
        ]}
      >
        <Svg width={size} height={size} style={styles.svg}>
          {/* Gradient effect using multiple circles */}
          {colors.map((color, index) => (
            <Circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={borderWidth / colors.length}
              fill="none"
              opacity={0.3 + (index * 0.2)}
              strokeDasharray={`${circumference * 0.25} ${circumference * 0.75}`}
              strokeDashoffset={-(circumference * index * 0.25) / colors.length}
            />
          ))}

          {/* Main border circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors[0]}
            strokeWidth={borderWidth}
            fill="none"
            opacity={0.8}
          />
        </Svg>
      </Animated.View>

      {/* Content */}
      <View style={[styles.content, {
        width: size - borderWidth * 4,
        height: size - borderWidth * 4,
        borderRadius: (size - borderWidth * 4) / 2,
      }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  border: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
