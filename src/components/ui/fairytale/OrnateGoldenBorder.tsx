/**
 * OrnateGoldenBorder Component
 *
 * Baroque-inspired golden border with corner flourishes and edge decorations.
 * Creates an elegant fairy tale frame around the ProfileCard.
 *
 * Features:
 * - Corner flourishes: Triple-curve scrollwork extending 40px from corners
 * - Edge decorations: Small diamond shapes along top and bottom
 * - Subtle pulsing animation for magical shimmer effect
 */

import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/lib/constants/colors';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

interface OrnateGoldenBorderProps {
  /** Width of the card */
  width: number;
  /** Height of the card */
  height: number;
  /** Border radius of the card (for corner positioning) */
  borderRadius: number;
  /** Enable subtle pulsing animation (default: true) */
  animated?: boolean;
}

export function OrnateGoldenBorder({
  width,
  height,
  borderRadius,
  animated = true,
}: OrnateGoldenBorderProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (animated) {
      opacity.value = withRepeat(
        withTiming(0.8, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [animated]);

  const animatedProps = useAnimatedProps(() => ({
    opacity: opacity.value,
  }));

  const strokeWidth = 4;
  const flourishSize = 40;
  const diamondSize = 12;
  const diamondSpacing = 60;

  // Calculate number of diamonds that fit along top edge
  const diamondsCount = Math.floor((width - flourishSize * 2 - diamondSpacing) / diamondSpacing);

  return (
    <AnimatedSvg
      width={width}
      height={height}
      style={styles.absolute}
      animatedProps={animatedProps}
    >
      <Defs>
        <LinearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={Colors.fairytale.gold.deep} stopOpacity="1" />
          <Stop offset="50%" stopColor={Colors.fairytale.gold.light} stopOpacity="1" />
          <Stop offset="100%" stopColor={Colors.fairytale.gold.medium} stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Top-left corner flourish */}
      <Path
        d={`M${borderRadius},${flourishSize} Q${borderRadius},${flourishSize * 0.7} ${
          borderRadius + flourishSize * 0.3
        },${flourishSize * 0.6} Q${borderRadius + flourishSize * 0.6},${
          flourishSize * 0.4
        } ${flourishSize},${borderRadius}`}
        stroke="url(#goldGradient)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d={`M${borderRadius + 5},${flourishSize - 5} Q${borderRadius + 5},${
          flourishSize * 0.6
        } ${borderRadius + flourishSize * 0.5},${flourishSize * 0.5}`}
        stroke="url(#goldGradient)"
        strokeWidth={strokeWidth - 1}
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Top-right corner flourish */}
      <Path
        d={`M${width - borderRadius},${flourishSize} Q${width - borderRadius},${
          flourishSize * 0.7
        } ${width - borderRadius - flourishSize * 0.3},${flourishSize * 0.6} Q${
          width - borderRadius - flourishSize * 0.6
        },${flourishSize * 0.4} ${width - flourishSize},${borderRadius}`}
        stroke="url(#goldGradient)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d={`M${width - borderRadius - 5},${flourishSize - 5} Q${width - borderRadius - 5},${
          flourishSize * 0.6
        } ${width - borderRadius - flourishSize * 0.5},${flourishSize * 0.5}`}
        stroke="url(#goldGradient)"
        strokeWidth={strokeWidth - 1}
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Bottom-left corner flourish */}
      <Path
        d={`M${borderRadius},${height - flourishSize} Q${borderRadius},${
          height - flourishSize * 0.3
        } ${borderRadius + flourishSize * 0.3},${height - flourishSize * 0.4} Q${
          borderRadius + flourishSize * 0.6
        },${height - flourishSize * 0.6} ${flourishSize},${height - borderRadius}`}
        stroke="url(#goldGradient)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d={`M${borderRadius + 5},${height - flourishSize + 5} Q${borderRadius + 5},${
          height - flourishSize * 0.4
        } ${borderRadius + flourishSize * 0.5},${height - flourishSize * 0.5}`}
        stroke="url(#goldGradient)"
        strokeWidth={strokeWidth - 1}
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Bottom-right corner flourish */}
      <Path
        d={`M${width - borderRadius},${height - flourishSize} Q${width - borderRadius},${
          height - flourishSize * 0.3
        } ${width - borderRadius - flourishSize * 0.3},${height - flourishSize * 0.4} Q${
          width - borderRadius - flourishSize * 0.6
        },${height - flourishSize * 0.6} ${width - flourishSize},${height - borderRadius}`}
        stroke="url(#goldGradient)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d={`M${width - borderRadius - 5},${height - flourishSize + 5} Q${
          width - borderRadius - 5
        },${height - flourishSize * 0.4} ${width - borderRadius - flourishSize * 0.5},${
          height - flourishSize * 0.5
        }`}
        stroke="url(#goldGradient)"
        strokeWidth={strokeWidth - 1}
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Diamond decorations along top edge */}
      {Array.from({ length: diamondsCount }).map((_, i) => {
        const x = flourishSize + diamondSpacing + i * diamondSpacing;
        const y = borderRadius / 2;
        return (
          <Path
            key={`top-diamond-${i}`}
            d={`M${x},${y - diamondSize / 2} L${x + 4},${y} L${x},${y + diamondSize / 2} L${
              x - 4
            },${y} Z`}
            fill="url(#goldGradient)"
            opacity="0.8"
          />
        );
      })}

      {/* Diamond decorations along bottom edge */}
      {Array.from({ length: diamondsCount }).map((_, i) => {
        const x = flourishSize + diamondSpacing + i * diamondSpacing;
        const y = height - borderRadius / 2;
        return (
          <Path
            key={`bottom-diamond-${i}`}
            d={`M${x},${y - diamondSize / 2} L${x + 4},${y} L${x},${y + diamondSize / 2} L${
              x - 4
            },${y} Z`}
            fill="url(#goldGradient)"
            opacity="0.8"
          />
        );
      })}
    </AnimatedSvg>
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
