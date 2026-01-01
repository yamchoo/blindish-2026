/**
 * CompassStar Component
 * 8-pointed compass star for decorative purposes
 */

import React from 'react';
import Svg, { Polygon, Circle } from 'react-native-svg';

interface CompassStarProps {
  size?: number;
  color?: string;
}

export function CompassStar({ size = 24, color = '#C8A865' }: CompassStarProps) {
  const center = size / 2;
  const outerRadius = size / 2;
  const innerRadius = size / 4;

  // Generate 8-pointed star points
  const points: string[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    points.push(`${x},${y}`);
  }

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Polygon
        points={points.join(' ')}
        fill={color}
        stroke={color}
        strokeWidth="0.5"
      />
      <Circle cx={center} cy={center} r={size * 0.08} fill={color} />
    </Svg>
  );
}
