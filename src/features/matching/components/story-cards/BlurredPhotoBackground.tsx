/**
 * BlurredPhotoBackground Component
 * Reusable blurred photo background with mesh gradient overlay
 */

import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { MeshGradientOverlay } from '@/components/ui';
import { calculateMeshOpacity } from './utils';

interface BlurredPhotoBackgroundProps {
  photoUrl: string;
  blurAmount: number; // 0-24
  meshOpacity?: number; // Optional override for calculated opacity
}

export function BlurredPhotoBackground({
  photoUrl,
  blurAmount,
  meshOpacity,
}: BlurredPhotoBackgroundProps) {
  const calculatedOpacity = meshOpacity ?? calculateMeshOpacity(blurAmount);

  return (
    <>
      {/* Blurred Photo Background */}
      <Image
        source={{ uri: photoUrl }}
        style={StyleSheet.absoluteFill}
        blurRadius={blurAmount}
        resizeMode="cover"
      />

      {/* Mesh Gradient Overlay for Mystery Effect */}
      <MeshGradientOverlay
        opacity={calculatedOpacity}
        speed={0.5}
        animated={true}
        style={StyleSheet.absoluteFill}
      />
    </>
  );
}
