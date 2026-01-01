/**
 * MeshGradientOverlay Component
 *
 * Multi-layer animated gradient overlay for blurred photos.
 * Creates mesh-like effect using 3 rotating LinearGradients at different speeds.
 *
 * Usage:
 * <MeshGradientOverlay
 *   opacity={0.7}
 *   speed={0.7}
 *   circular={true}
 *   size={180}
 * />
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/lib/constants/colors';

const CORAL_MESH_COLORS = Colors.meshGradient.coral;

interface MeshGradientOverlayProps {
  /** Opacity of gradient overlay (default: 0.7) */
  opacity?: number;

  /** Animation speed multiplier (default: 0.7) */
  speed?: number;

  /** Color palette for gradient (default: CORAL_MESH_COLORS) */
  colors?: string[];

  /** Enable/disable animation (default: true) */
  animated?: boolean;

  /** Circular mask for circular photos (default: false) */
  circular?: boolean;

  /** Size for circular mask (required if circular=true) */
  size?: number;

  /** Additional styles */
  style?: ViewStyle;
}

export const MeshGradientOverlay = React.memo(({
  opacity = 0.7,
  speed = 0.7,
  colors = CORAL_MESH_COLORS,
  animated = true,
  circular = false,
  size,
  style,
}: MeshGradientOverlayProps) => {
  // Rotation progress values (0 to 1) for each layer - interpolated to degrees
  const rotation1 = useSharedValue(0);
  const rotation2 = useSharedValue(0);
  const rotation3 = useSharedValue(0);

  // Memoize colors array to prevent re-renders
  const memoizedColors = useMemo(() => colors, [JSON.stringify(colors)]);

  useEffect(() => {
    if (animated) {
      // Layer 1: 4-second per full rotation (faster for visible movement)
      // Animate to large number (100 = 100 rotations) for effectively infinite smooth animation
      rotation1.value = withRepeat(
        withTiming(100, { duration: (4000 * 100) / speed, easing: Easing.linear }),
        -1, // Infinite
        false
      );

      // Layer 2: 5-second per full rotation
      rotation2.value = withRepeat(
        withTiming(100, { duration: (5000 * 100) / speed, easing: Easing.linear }),
        -1,
        false
      );

      // Layer 3: 3-second per full rotation
      rotation3.value = withRepeat(
        withTiming(100, { duration: (3000 * 100) / speed, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [animated, speed]);

  const containerStyle = useMemo((): ViewStyle => ({
    ...StyleSheet.absoluteFillObject,
    opacity,
    borderRadius: circular && size ? size / 2 : 0,
    overflow: 'hidden',
  }), [opacity, circular, size]);

  // Interpolate rotation values from 0-1 to 0-360deg (Layer 1: clockwise)
  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation1.value * 360}deg` }],
  }));

  // Layer 2: counter-clockwise rotation
  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-rotation2.value * 360}deg` }],
  }));

  // Layer 3: clockwise rotation
  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation3.value * 360}deg` }],
  }));

  return (
    <View style={[containerStyle, style]} pointerEvents="none">
      {/* Layer 1: Off-center diagonal gradient - creates visible rotation */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle1]}>
        <LinearGradient
          colors={[memoizedColors[0], memoizedColors[1], memoizedColors[2]]}
          start={{ x: 0.15, y: 0.1 }}
          end={{ x: 0.85, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Layer 2: Asymmetric reverse diagonal (60% opacity) */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.layer2, animatedStyle2]}>
        <LinearGradient
          colors={[memoizedColors[3], memoizedColors[4], memoizedColors[5]]}
          start={{ x: 0.85, y: 0.15 }}
          end={{ x: 0.15, y: 0.85 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Layer 3: Off-center radial effect (40% opacity) */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.layer3, animatedStyle3]}>
        <LinearGradient
          colors={[memoizedColors[1], memoizedColors[3], memoizedColors[0]]}
          start={{ x: 0.25, y: 0.25 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for performance optimization
  return (
    prevProps.opacity === nextProps.opacity &&
    prevProps.speed === nextProps.speed &&
    prevProps.animated === nextProps.animated &&
    prevProps.circular === nextProps.circular &&
    prevProps.size === nextProps.size &&
    JSON.stringify(prevProps.colors) === JSON.stringify(nextProps.colors)
  );
});

MeshGradientOverlay.displayName = 'MeshGradientOverlay';

const styles = StyleSheet.create({
  layer2: {
    opacity: 0.6,
  },
  layer3: {
    opacity: 0.4,
  },
});
