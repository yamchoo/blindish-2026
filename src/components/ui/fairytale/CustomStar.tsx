/**
 * CustomStar Component
 * Converted from blindish-star.svg
 * 8-pointed star with center ellipse and radiating lines
 */

import React from 'react';
import Svg, { G, Ellipse, Line } from 'react-native-svg';

interface CustomStarProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function CustomStar({
  size = 40,
  color = '#C8A865',
  strokeWidth = 3,
}: CustomStarProps) {
  // Original viewBox: 0 0 88.61 95.55
  // Aspect ratio: 88.61 / 95.55 ≈ 0.927
  const viewBoxWidth = 88.61;
  const viewBoxHeight = 95.55;

  // Calculate width and height based on size (size = height)
  const width = (viewBoxWidth / viewBoxHeight) * size;
  const height = size;

  // Scale strokeWidth relative to size
  const scaledStrokeWidth = (strokeWidth / 40) * size;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
    >
      <G>
        {/* Center Ellipse */}
        <Ellipse
          cx="44.31"
          cy="47.77"
          rx="16.02"
          ry="14.67"
          fill="none"
          stroke={color}
          strokeWidth={scaledStrokeWidth}
          strokeMiterlimit={10}
        />

        {/* Vertical line (top to bottom) */}
        <Line
          x1="44.31"
          y1="0"
          x2="44.31"
          y2="95.55"
          stroke={color}
          strokeWidth={scaledStrokeWidth}
          strokeMiterlimit={10}
        />

        {/* Horizontal line (left to right) */}
        <Line
          x1="0"
          y1="47.77"
          x2="88.61"
          y2="47.77"
          stroke={color}
          strokeWidth={scaledStrokeWidth}
          strokeMiterlimit={10}
        />

        {/* Diagonal line (top-left to center-left) */}
        <Line
          x1="15.36"
          y1="21.69"
          x2="27.83"
          y2="33.11"
          stroke={color}
          strokeWidth={scaledStrokeWidth}
          strokeMiterlimit={10}
        />

        {/* Diagonal line (top-right to center-right) */}
        <Line
          x1="73.25"
          y1="21.69"
          x2="60.78"
          y2="33.11"
          stroke={color}
          strokeWidth={scaledStrokeWidth}
          strokeMiterlimit={10}
        />

        {/* Diagonal line (bottom-left to center-left) */}
        <Line
          x1="15.36"
          y1="75.29"
          x2="27.83"
          y2="63.87"
          stroke={color}
          strokeWidth={scaledStrokeWidth}
          strokeMiterlimit={10}
        />

        {/* Diagonal line (bottom-right to center-right) */}
        <Line
          x1="73.25"
          y1="75.29"
          x2="60.78"
          y2="63.87"
          stroke={color}
          strokeWidth={scaledStrokeWidth}
          strokeMiterlimit={10}
        />
      </G>
    </Svg>
  );
}
