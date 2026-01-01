/**
 * FloatingIvy Component
 *
 * Animated ivy vines with swaying leaves for organic fairy tale atmosphere.
 * Features two vines (left and right) with independently animated leaves.
 *
 * Animation:
 * - Each leaf sways independently: -3° to +3° rotation
 * - 2500ms cycle per leaf
 * - Staggered delays (100-200ms) for natural movement
 */

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Ellipse } from 'react-native-svg';
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

interface FloatingIvyProps {
  /** Width of the card */
  width: number;
  /** Height of the card */
  height: number;
  /** Enable swaying animation (default: true) */
  animated?: boolean;
}

interface Leaf {
  x: number;
  y: number;
  size: number;
  rotation: number;
  delay: number;
}

export function FloatingIvy({ width, height, animated = true }: FloatingIvyProps) {
  // Generate leaf positions along vines
  const { leftLeaves, rightLeaves } = useMemo(() => {
    const leftVineLeaves: Leaf[] = [];
    const rightVineLeaves: Leaf[] = [];

    // Left vine: bottom-left to (15, height * 0.4)
    const leftStartY = height;
    const leftEndY = height * 0.4;
    const leftVineLength = leftStartY - leftEndY;
    const leftLeafCount = 9;

    for (let i = 0; i < leftLeafCount; i++) {
      const progress = i / (leftLeafCount - 1);
      const y = leftStartY - leftVineLength * progress;
      const x = 15 * progress; // Curve outward
      leftVineLeaves.push({
        x,
        y,
        size: 10 + Math.random() * 6, // 10-16px
        rotation: Math.random() * 60 - 30, // -30° to +30° base rotation
        delay: i * 150, // Stagger by 150ms
      });
    }

    // Right vine: top-right to (width - 15, height * 0.35)
    const rightStartY = 0;
    const rightEndY = height * 0.35;
    const rightVineLength = rightEndY - rightStartY;
    const rightLeafCount = 9;

    for (let i = 0; i < rightLeafCount; i++) {
      const progress = i / (rightLeafCount - 1);
      const y = rightStartY + rightVineLength * progress;
      const x = width - 15 * progress; // Curve inward
      rightVineLeaves.push({
        x,
        y,
        size: 10 + Math.random() * 6,
        rotation: Math.random() * 60 - 30,
        delay: i * 150,
      });
    }

    return { leftLeaves: leftVineLeaves, rightLeaves: rightVineLeaves };
  }, [width, height]);

  return (
    <Svg width={width} height={height} style={styles.absolute}>
      {/* Left vine stem */}
      <Path
        d={`M0,${height} Q5,${height * 0.7} 10,${height * 0.5} Q15,${height * 0.45} 15,${
          height * 0.4
        }`}
        stroke={Colors.fairytale.ivy.stem}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />

      {/* Left vine leaves */}
      {leftLeaves.map((leaf, index) => (
        <IvyLeaf
          key={`left-${index}`}
          leaf={leaf}
          animated={animated}
        />
      ))}

      {/* Right vine stem */}
      <Path
        d={`M${width},0 Q${width - 5},${height * 0.15} ${width - 10},${height * 0.25} Q${
          width - 15
        },${height * 0.3} ${width - 15},${height * 0.35}`}
        stroke={Colors.fairytale.ivy.stem}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />

      {/* Right vine leaves */}
      {rightLeaves.map((leaf, index) => (
        <IvyLeaf
          key={`right-${index}`}
          leaf={leaf}
          animated={animated}
        />
      ))}
    </Svg>
  );
}

// Individual animated leaf component
function IvyLeaf({ leaf, animated }: { leaf: Leaf; animated: boolean }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      // Start animation after staggered delay
      setTimeout(() => {
        rotation.value = withRepeat(
          withSequence(
            withTiming(3, { duration: 1250, easing: Easing.bezier(0.42, 0, 0.58, 1) }),
            withTiming(-3, { duration: 1250, easing: Easing.bezier(0.42, 0, 0.58, 1) })
          ),
          -1,
          false
        );
      }, leaf.delay);
    }
  }, [animated, leaf.delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${leaf.rotation + rotation.value}deg` }],
  }));

  return (
    <AnimatedView
      style={[
        {
          position: 'absolute',
          left: leaf.x,
          top: leaf.y,
        },
        animatedStyle,
      ]}
    >
      <Svg width={leaf.size * 2} height={leaf.size * 2}>
        {/* Main leaf body */}
        <Ellipse
          cx={leaf.size}
          cy={leaf.size}
          rx={leaf.size * 0.6}
          ry={leaf.size}
          fill={Colors.fairytale.ivy.leaf}
        />
        {/* Highlight accent */}
        <Ellipse
          cx={leaf.size - leaf.size * 0.2}
          cy={leaf.size - leaf.size * 0.3}
          rx={leaf.size * 0.3}
          ry={leaf.size * 0.5}
          fill={Colors.fairytale.ivy.highlight}
          opacity="0.5"
        />
      </Svg>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
});
