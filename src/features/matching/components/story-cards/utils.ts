/**
 * Story Card Utility Functions
 * Helper functions for story card components
 */

/**
 * Calculate mesh gradient opacity based on blur amount
 * @param blurAmount - Blur radius (0-24)
 * @returns Opacity value (0.3-0.7)
 */
export function calculateMeshOpacity(blurAmount: number): number {
  return 0.3 + (blurAmount / 24) * 0.4;
}

/**
 * Format large numbers with K/M suffixes
 * @param count - Number to format
 * @returns Formatted string (e.g., "12.5M", "3.2K")
 */
export function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Get consistent particle configuration for cards
 * @param cardWidth - Width of the card
 * @param cardHeight - Height of the card
 * @returns Particle count configuration
 */
export function getParticleConfig(cardWidth: number, cardHeight: number) {
  return {
    butterflies: 2,
    fireflies: 4,
    sparkles: 5,
  };
}
