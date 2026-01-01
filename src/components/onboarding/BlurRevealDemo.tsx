/**
 * Blur Reveal Demo Component
 * Demonstrates the blur-to-unblur mechanic used in the app
 * Shows circular profile pictures that gradually unblur
 * Cycles through multiple demo profile images
 */

import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, useColorScheme } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { MeshGradientOverlay } from '@/components/ui';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface BlurRevealDemoProps {
  size?: number;
  autoPlay?: boolean;
  speed?: number;
}

// Demo profile images from the blindish-mvp-voice demo
const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', // Madison
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', // James
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop', // Sarah
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop', // Marcus
];

export function BlurRevealDemo({
  size = 180,
  autoPlay = true,
  speed = 1,
}: BlurRevealDemoProps) {
  const colorScheme = useColorScheme();
  const blurOpacityAnim = useRef(new Animated.Value(1)).current;
  const imageOpacity = useRef(new Animated.Value(1)).current;
  const shineRotation = useRef(new Animated.Value(0)).current;
  const [mounted] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);

  // Rotating shine animation - runs continuously, independent of image changes
  useEffect(() => {
    if (autoPlay) {
      shineRotation.setValue(0); // Reset to 0 only on initial mount
      const rotationAnimation = Animated.loop(
        Animated.timing(shineRotation, {
          toValue: 1,
          duration: 6000 / speed, // Slower rotation for elegant shine effect
          useNativeDriver: true,
        })
      );

      rotationAnimation.start();

      return () => {
        rotationAnimation.stop();
      };
    }
  }, [autoPlay, speed]); // Removed 'mounted' to prevent restarts

  // Blur animation - runs continuously
  useEffect(() => {
    if (autoPlay && mounted) {
      const animation = Animated.loop(
        Animated.sequence([
          // Wait a bit at start
          Animated.delay(500 / speed),
          // Unblur (fade out blur overlay)
          Animated.timing(blurOpacityAnim, {
            toValue: 0,
            duration: 2000 / speed,
            useNativeDriver: true,
          }),
          // Wait before looping
          Animated.delay(2000 / speed),
          // Blur back (show blur overlay)
          Animated.timing(blurOpacityAnim, {
            toValue: 1,
            duration: 1500 / speed,
            useNativeDriver: true,
          }),
          // Wait before next image
          Animated.delay(500 / speed),
        ])
      );

      animation.start();

      return () => {
        animation.stop();
      };
    }
  }, [autoPlay, speed, mounted]);

  // Image cycling - separate from blur animation
  useEffect(() => {
    if (autoPlay && mounted) {
      const imageInterval = setInterval(() => {
        // Fade out current image
        Animated.timing(imageOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // Switch to next image
          setCurrentImageIndex(nextImageIndex);
          setNextImageIndex((nextImageIndex + 1) % DEMO_IMAGES.length);
          // Fade in new image
          Animated.timing(imageOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        });
      }, (500 + 2000 + 2000 + 1500 + 500) / speed);

      return () => {
        clearInterval(imageInterval);
      };
    }
  }, [autoPlay, speed, mounted, nextImageIndex]);

  const borderWidth = 4;
  const innerSize = size - borderWidth * 2;
  const radius = (size - borderWidth) / 2;

  const rotate = shineRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.container, {
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    }]}>
      {/* SVG Border with rotating gradient shine */}
      <Animated.View style={{
        position: 'absolute',
        width: size,
        height: size,
        transform: [{ rotate }],
      }}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#C8A865" stopOpacity="1" />
              <Stop offset="25%" stopColor="#D9B870" stopOpacity="1" />
              <Stop offset="50%" stopColor="#F5E8C8" stopOpacity="1" />
              <Stop offset="75%" stopColor="#D9B870" stopOpacity="1" />
              <Stop offset="100%" stopColor="#C8A865" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#shineGradient)"
            strokeWidth={borderWidth}
            fill="none"
          />
        </Svg>
      </Animated.View>

      {/* Profile image with crossfade */}
      <Animated.View style={{
        opacity: imageOpacity,
        width: innerSize,
        height: innerSize,
        borderRadius: innerSize / 2,
        overflow: 'hidden',
      }}>
        <Image
          source={{ uri: DEMO_IMAGES[currentImageIndex] }}
          style={{
            width: innerSize,
            height: innerSize,
          }}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Static blur overlay with animated opacity */}
      <Animated.View
        style={{
          position: 'absolute',
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          overflow: 'hidden',
          opacity: blurOpacityAnim,
        }}
        pointerEvents="none"
      >
        <BlurView
          intensity={24}
          style={StyleSheet.absoluteFill}
          tint={colorScheme === 'dark' ? 'dark' : 'light'}
        />
        {/* Mesh gradient overlay for mystery effect */}
        <MeshGradientOverlay
          opacity={0.7}
          speed={0.7}
          circular={true}
          size={innerSize}
          animated={autoPlay}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    overflow: 'hidden',
  },
  profileImage: {
    backgroundColor: '#f5f5f5',
  },
});
