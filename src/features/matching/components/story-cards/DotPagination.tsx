/**
 * DotPagination Component
 * Shows current position in story cards with clickable dots
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/lib/constants/colors';

interface DotPaginationProps {
  totalDots: number;
  currentIndex: number;
  onDotPress: (index: number) => void;
}

export function DotPagination({ totalDots, currentIndex, onDotPress }: DotPaginationProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Theme-aware colors
  const inactiveDotColor = isDark ? Colors.dark.border : Colors.light.border;

  return (
    <View style={styles.container}>
      {Array.from({ length: totalDots }).map((_, index) => (
        <TouchableOpacity
          key={index}
          style={styles.dotButton}
          onPress={() => onDotPress(index)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.dot,
              { backgroundColor: inactiveDotColor },
              index === currentIndex && styles.dotActive,
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  dotButton: {
    padding: 4, // Increase touch target
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    // backgroundColor is dynamic (applied inline)
    opacity: 0.5,
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.coral,
    opacity: 1,
  },
});
