/**
 * GoldenCircleFrame Component
 *
 * Reusable golden circle with rotating shimmer effect for fairy tale aesthetic.
 * Used in ProfileCard to frame photos with an enchanted, magical appearance.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ============================================================================
// Props Interface
// ============================================================================

interface GoldenCircleFrameProps {
  /** Size of the circle (diameter) - Default: 190 */
  size?: number;

  /** Border width in pixels - Default: 5 */
  borderWidth?: number;

  /** Content to display inside the circle (e.g., Image) */
  children?: React.ReactNode;

  /** Additional styles for the container */
  style?: ViewStyle;
}

// ============================================================================
// Component
// ============================================================================

export function GoldenCircleFrame({
  size = 190,
  borderWidth = 5,
  children,
  style,
}: GoldenCircleFrameProps) {
  // Rotation animation for shimmer effect
  const rotationAnim = useSharedValue(0);

  useEffect(() => {
    // Continuous 6-second rotation for subtle shimmer
    rotationAnim.value = withRepeat(
      withTiming(360, {
        duration: 6000,
        easing: Easing.linear,
      }),
      -1, // Infinite loop
      false
    );
  }, []);

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* SVG Golden Circle with Rotating Gradient */}
      <Svg height={size} width={size} style={styles.svgBorder}>
        <Defs>
          <LinearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#C8A865" stopOpacity="1" />
            <Stop offset="25%" stopColor="#D9B870" stopOpacity="1" />
            <Stop offset="50%" stopColor="#F5E8C8" stopOpacity="1" />
            <Stop offset="75%" stopColor="#D9B870" stopOpacity="1" />
            <Stop offset="100%" stopColor="#C8A865" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={(size - borderWidth) / 2}
          stroke="url(#goldGradient)"
          strokeWidth={borderWidth}
          fill="none"
          rotation={rotationAnim}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      {/* Content inside circle (photo, etc.) */}
      {children && (
        <View style={styles.childrenContainer}>
          {children}
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgBorder: {
    position: 'absolute',
  },
  childrenContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
