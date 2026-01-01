/**
 * DecorativeBorder Component
 * Minimal decorative border with custom star elements
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Line } from 'react-native-svg';
import { CustomStar } from './CustomStar';

interface DecorativeBorderProps {
  width: number;
  height: number;
  borderRadius: number;
  strokeWidth?: number;
  color?: string;
}

export function DecorativeBorder({
  width,
  height,
  borderRadius,
  strokeWidth = 1.5,
  color = '#C8A865',
}: DecorativeBorderProps) {
  const inset = 8;
  const dotRadius = 3;
  const innerInset = 24;

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      <Svg width={width} height={height} style={styles.svg}>
        {/* Main rounded rectangle */}
        <Rect
          x={inset}
          y={inset}
          width={width - inset * 2}
          height={height - inset * 2}
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
        />

        {/* Corner dots */}
        <Circle cx={inset + 12} cy={inset + 12} r={dotRadius} fill={color} />

        {/* Top-right: 2 connected dots */}
        <Circle cx={width - inset - 12} cy={inset + 12} r={dotRadius} fill={color} />
        <Circle cx={width - inset - 28} cy={inset + 12} r={dotRadius} fill={color} />
        <Line
          x1={width - inset - 28}
          y1={inset + 12}
          x2={width - inset - 12}
          y2={inset + 12}
          stroke={color}
          strokeWidth={1.5}
        />

        <Circle cx={inset + 12} cy={height - inset - 12} r={dotRadius} fill={color} />
        <Circle cx={width - inset - 12} cy={height - inset - 12} r={dotRadius} fill={color} />

        {/* Mid-edge dots (subtle) */}
        <Circle cx={width / 2} cy={inset + 8} r={dotRadius * 0.8} fill={color} opacity={0.6} />
        <Circle cx={width / 2} cy={height - inset - 8} r={dotRadius * 0.8} fill={color} opacity={0.6} />
      </Svg>

      {/* Custom stars */}
      <View style={[styles.star, { top: innerInset, left: innerInset }]}>
        <CustomStar size={36} color={color} />
      </View>
      <View style={[styles.star, { bottom: innerInset, right: innerInset }]}>
        <CustomStar size={36} color={color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0 },
  svg: { position: 'absolute' },
  star: { position: 'absolute' },
});
