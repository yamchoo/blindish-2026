/**
 * MagicalParticles Component
 *
 * Animated particles (butterflies, fireflies, sparkles) for fairy tale atmosphere.
 * Creates whimsical movement around the ProfileCard.
 *
 * Particle Types:
 * - Butterflies: Figure-8 flight paths with wing flapping
 * - Fireflies: Floating vertical drift with pulsing glow
 * - Sparkles: Twinkling star effect with random delays
 *
 * Performance: Uses native driver, total 12-17 particles
 */

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Polygon, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/lib/constants/colors';

const AnimatedView = Animated.createAnimatedComponent(View);

interface MagicalParticlesProps {
  /** Width of the card */
  width: number;
  /** Height of the card */
  height: number;
  /** Particle counts (optional) */
  particleCount?: {
    butterflies?: number;  // Default: 2
    fireflies?: number;    // Default: 5
    sparkles?: number;     // Default: 7
  };
  /** Enable animations (default: true) */
  animated?: boolean;
}

export function MagicalParticles({
  width,
  height,
  particleCount = {},
  animated = true,
}: MagicalParticlesProps) {
  const {
    butterflies = 2,
    fireflies = 5,
    sparkles = 7,
  } = particleCount;

  // Generate random starting positions for particles
  const butterflyPositions = useMemo(
    () =>
      Array.from({ length: butterflies }, () => ({
        startX: Math.random() * (width - 60) + 30,
        startY: Math.random() * (height - 100) + 50,
        duration: 8000 + Math.random() * 4000, // 8-12 seconds
        color: [
          Colors.fairytale.particles.butterflyPink,
          Colors.fairytale.particles.butterflyLavender,
          Colors.fairytale.particles.butterflyYellow,
        ][Math.floor(Math.random() * 3)],
        size: 12 + Math.random() * 4, // 12-16px
      })),
    [butterflies, width, height]
  );

  const fireflyPositions = useMemo(
    () =>
      Array.from({ length: fireflies }, () => ({
        startX: Math.random() * (width - 40) + 20,
        startY: Math.random() * height,
        size: 4 + Math.random() * 2, // 4-6px
        delay: Math.random() * 1000,
      })),
    [fireflies, width, height]
  );

  const sparklePositions = useMemo(
    () =>
      Array.from({ length: sparkles }, () => ({
        x: Math.random() * (width - 20) + 10,
        y: Math.random() * height,
        size: 3 + Math.random() * 2, // 3-5px
        delay: Math.random() * 2000,
        color: Math.random() > 0.5
          ? Colors.fairytale.particles.sparkleWhite
          : Colors.fairytale.gold.light,
      })),
    [sparkles, width, height]
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Butterflies */}
      {butterflyPositions.map((butterfly, index) => (
        <Butterfly
          key={`butterfly-${index}`}
          {...butterfly}
          animated={animated}
        />
      ))}

      {/* Fireflies */}
      {fireflyPositions.map((firefly, index) => (
        <Firefly
          key={`firefly-${index}`}
          {...firefly}
          animated={animated}
          height={height}
        />
      ))}

      {/* Sparkles */}
      {sparklePositions.map((sparkle, index) => (
        <Sparkle
          key={`sparkle-${index}`}
          {...sparkle}
          animated={animated}
        />
      ))}
    </View>
  );
}

// Butterfly Component with Figure-8 flight path
function Butterfly({
  startX,
  startY,
  duration,
  color,
  size,
  animated,
}: {
  startX: number;
  startY: number;
  duration: number;
  color: string;
  size: number;
  animated: boolean;
}) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      // Figure-8 horizontal movement
      x.value = withRepeat(
        withSequence(
          withTiming(30, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(-30, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      // Figure-8 vertical movement (faster frequency)
      y.value = withRepeat(
        withSequence(
          withTiming(-50, { duration: duration / 4, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: duration / 4, easing: Easing.inOut(Easing.ease) }),
          withTiming(50, { duration: duration / 4, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: duration / 4, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      // Rotation (wing tilt during flight)
      rotation.value = withRepeat(
        withSequence(
          withTiming(15, { duration: duration / 4 }),
          withTiming(-15, { duration: duration / 2 }),
          withTiming(0, { duration: duration / 4 })
        ),
        -1,
        false
      );
    }
  }, [animated, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX + x.value },
      { translateY: startY + y.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <AnimatedView style={[styles.particle, animatedStyle]}>
      <Svg width={size} height={size * 0.7}>
        {/* Left wing */}
        <Path
          d={`M${size / 2},${(size * 0.7) / 2} Q0,0 ${size * 0.3},${(size * 0.7) / 2} Q${
            size * 0.3
          },${size * 0.7} ${size / 2},${(size * 0.7) / 2}`}
          fill={color}
          opacity="0.8"
        />
        {/* Right wing */}
        <Path
          d={`M${size / 2},${(size * 0.7) / 2} Q${size},0 ${size * 0.7},${(size * 0.7) / 2} Q${
            size * 0.7
          },${size * 0.7} ${size / 2},${(size * 0.7) / 2}`}
          fill={color}
          opacity="0.8"
        />
        {/* Body */}
        <Circle
          cx={size / 2}
          cy={(size * 0.7) / 2}
          r={size * 0.08}
          fill={Colors.fairytale.ivy.stem}
        />
      </Svg>
    </AnimatedView>
  );
}

// Firefly Component with pulsing glow
function Firefly({
  startX,
  startY,
  size,
  delay,
  animated,
  height,
}: {
  startX: number;
  startY: number;
  size: number;
  delay: number;
  animated: boolean;
  height: number;
}) {
  const y = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (animated) {
      // Delayed start
      setTimeout(() => {
        // Slow vertical drift
        y.value = withRepeat(
          withTiming(-height * 0.3, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );

        // Pulsing glow
        opacity.value = withRepeat(
          withSequence(
            withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
      }, delay);
    }
  }, [animated, delay, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: startX }, { translateY: startY + y.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedView style={[styles.particle, animatedStyle]}>
      <Svg width={size * 2} height={size * 2}>
        <Defs>
          <RadialGradient id={`fireflyGlow-${startX}-${startY}`}>
            <Stop offset="0%" stopColor={Colors.fairytale.particles.fireflyGold} stopOpacity="1" />
            <Stop offset="50%" stopColor={Colors.fairytale.particles.fireflyGold} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={Colors.fairytale.particles.fireflyGold} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle
          cx={size}
          cy={size}
          r={size}
          fill={`url(#fireflyGlow-${startX}-${startY})`}
        />
      </Svg>
    </AnimatedView>
  );
}

// Sparkle Component with twinkle effect
function Sparkle({
  x,
  y,
  size,
  delay,
  color,
  animated,
}: {
  x: number;
  y: number;
  size: number;
  delay: number;
  color: string;
  animated: boolean;
}) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      setTimeout(() => {
        opacity.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }), // Fade in
            withTiming(1, { duration: 500 }), // Hold
            withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }), // Fade out
            withTiming(0, { duration: 500 }) // Pause
          ),
          -1,
          false
        );
      }, delay);
    }
  }, [animated, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x }, { translateY: y }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedView style={[styles.particle, animatedStyle]}>
      <Svg width={size} height={size}>
        {/* 4-point star */}
        <Polygon
          points={`${size / 2},0 ${size * 0.6},${size * 0.4} ${size},${size / 2} ${size * 0.6},${
            size * 0.6
          } ${size / 2},${size} ${size * 0.4},${size * 0.6} 0,${size / 2} ${size * 0.4},${
            size * 0.4
          }`}
          fill={color}
        />
      </Svg>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
  },
});
