/**
 * Compatibility calculation helper functions
 * Used by both client-side preview and server-side Edge Function
 */

import type {
  BigFiveScores,
  LifestylePreferences,
  UserProfileForMatching,
} from '../types/matching.types';

/**
 * Calculate personality compatibility using normalized Euclidean distance
 *
 * @param profile1 - First user's Big Five scores
 * @param profile2 - Second user's Big Five scores
 * @returns Compatibility score from 0-100 (100 = perfect similarity)
 *
 * Formula: 100 - sqrt(sum((trait1 - trait2)²) / 5) × 100 / 100
 */
export function calculateBigFiveDistance(
  profile1: BigFiveScores,
  profile2: BigFiveScores
): number {
  const traits: (keyof BigFiveScores)[] = [
    'openness',
    'conscientiousness',
    'extraversion',
    'agreeableness',
    'neuroticism',
  ];

  // Calculate sum of squared differences
  const sumSquaredDifferences = traits.reduce((sum, trait) => {
    const diff = profile1[trait] - profile2[trait];
    return sum + diff * diff;
  }, 0);

  // Calculate Euclidean distance and normalize
  const distance = Math.sqrt(sumSquaredDifferences / traits.length);
  const normalizedDistance = distance / 100; // Normalize to 0-1 range

  // Convert to compatibility score (0-100, where 100 is perfect match)
  const compatibilityScore = (1 - normalizedDistance) * 100;

  return Math.round(Math.max(0, Math.min(100, compatibilityScore)));
}

/**
 * Calculate Jaccard similarity coefficient for two sets
 *
 * @param set1 - First set of items
 * @param set2 - Second set of items
 * @returns Similarity score from 0-100 (100 = identical sets)
 *
 * Formula: (intersection / union) × 100
 */
export function calculateJaccardSimilarity(set1: string[], set2: string[]): number {
  if (!set1 || !set2 || (set1.length === 0 && set2.length === 0)) {
    return 0;
  }

  const s1 = new Set(set1.map((s) => s.toLowerCase().trim()));
  const s2 = new Set(set2.map((s) => s.toLowerCase().trim()));

  // Calculate intersection
  const intersection = new Set([...s1].filter((x) => s2.has(x)));

  // Calculate union
  const union = new Set([...s1, ...s2]);

  if (union.size === 0) {
    return 0;
  }

  const similarity = (intersection.size / union.size) * 100;

  return Math.round(Math.max(0, Math.min(100, similarity)));
}

/**
 * Get lifestyle compatibility score and details
 *
 * @param profile1 - First user's lifestyle preferences
 * @param profile2 - Second user's lifestyle preferences
 * @returns Object with score (0-100) and details about compatibility
 */
export function getLifestyleCompatibility(
  profile1: LifestylePreferences,
  profile2: LifestylePreferences
): { score: number; compatible: string[]; neutral: string[] } {
  let score = 100;
  const compatible: string[] = [];
  const neutral: string[] = [];

  // Define ordinal scales for substance use
  const drinkingScale: Record<string, number> = {
    never: 0,
    rarely: 1,
    socially: 2,
    regularly: 3,
  };

  const politicsScale: Record<string, number> = {
    very_liberal: 0,
    liberal: 1,
    moderate: 2,
    conservative: 3,
    very_conservative: 4,
    apolitical: 2, // Treat apolitical as neutral/moderate
  };

  // 1. Kids preference (dealbreaker weight)
  if (profile1.wantsKids && profile2.wantsKids) {
    if (profile1.wantsKids === profile2.wantsKids) {
      compatible.push('wants_kids');
      score += 10; // Bonus for agreement
    } else if (
      profile1.wantsKids === 'maybe' ||
      profile2.wantsKids === 'maybe'
    ) {
      neutral.push('wants_kids');
      // No penalty for maybe
    } else {
      // Hard dealbreaker: one wants, one doesn't
      score -= 30;
      neutral.push('wants_kids');
    }
  }

  // 2. Religion compatibility (array overlap)
  if (profile1.religion && profile2.religion && profile1.religion.length > 0 && profile2.religion.length > 0) {
    const religionOverlap = calculateJaccardSimilarity(
      profile1.religion,
      profile2.religion
    );
    if (religionOverlap > 50) {
      compatible.push('religion');
      score += Math.round(religionOverlap * 0.2); // Up to +20 points
    } else if (religionOverlap > 0) {
      neutral.push('religion');
    }
  }

  // 3. Drinking compatibility
  if (profile1.drinking && profile2.drinking) {
    const diff = Math.abs(
      drinkingScale[profile1.drinking] - drinkingScale[profile2.drinking]
    );
    if (diff === 0) {
      compatible.push('drinking');
      score += 10; // Exact match bonus
    } else if (diff === 1) {
      compatible.push('drinking');
      score += 5; // Adjacent match bonus
    } else {
      neutral.push('drinking');
      score -= diff * 3; // Penalty for larger differences
    }
  }

  // 4. Smoking compatibility
  if (profile1.smoking && profile2.smoking) {
    const diff = Math.abs(
      drinkingScale[profile1.smoking] - drinkingScale[profile2.smoking]
    );
    if (diff === 0) {
      compatible.push('smoking');
      score += 10;
    } else if (diff === 1) {
      compatible.push('smoking');
      score += 5;
    } else {
      neutral.push('smoking');
      score -= diff * 3;
    }
  }

  // 5. Marijuana compatibility
  if (profile1.marijuana && profile2.marijuana) {
    const diff = Math.abs(
      drinkingScale[profile1.marijuana] - drinkingScale[profile2.marijuana]
    );
    if (diff === 0) {
      compatible.push('marijuana');
      score += 10;
    } else if (diff === 1) {
      compatible.push('marijuana');
      score += 5;
    } else {
      neutral.push('marijuana');
      score -= diff * 3;
    }
  }

  // 6. Politics compatibility
  if (profile1.politics && profile2.politics) {
    const diff = Math.abs(
      politicsScale[profile1.politics] - politicsScale[profile2.politics]
    );
    if (diff === 0) {
      compatible.push('politics');
      score += 10;
    } else if (diff <= 1) {
      compatible.push('politics');
      score += 5;
    } else {
      neutral.push('politics');
      score -= diff * 5; // Politics can be more divisive
    }
  }

  // Clamp score to 0-100 range
  const finalScore = Math.round(Math.max(0, Math.min(100, score)));

  return {
    score: finalScore,
    compatible,
    neutral,
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 *
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles (use 6371 for km)

  // Convert degrees to radians
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
}

/**
 * Calculate overall compatibility score between two users
 *
 * @param user1 - First user's profile
 * @param user2 - Second user's profile
 * @returns Object with overall score and breakdown
 *
 * Formula: Total = (Personality × 0.50) + (Interests × 0.25) + (Lifestyle × 0.25)
 */
export function calculateOverallCompatibility(
  user1: UserProfileForMatching,
  user2: UserProfileForMatching
): {
  score: number;
  personalityScore: number;
  interestsScore: number;
  lifestyleScore: number;
  reasons: string[];
} {
  const reasons: string[] = [];

  // 1. Calculate personality compatibility (50% weight)
  let personalityScore = 50; // Default if no personality profile
  if (user1.personalityProfile && user2.personalityProfile) {
    personalityScore = calculateBigFiveDistance(
      {
        openness: user1.personalityProfile.openness,
        conscientiousness: user1.personalityProfile.conscientiousness,
        extraversion: user1.personalityProfile.extraversion,
        agreeableness: user1.personalityProfile.agreeableness,
        neuroticism: user1.personalityProfile.neuroticism,
      },
      {
        openness: user2.personalityProfile.openness,
        conscientiousness: user2.personalityProfile.conscientiousness,
        extraversion: user2.personalityProfile.extraversion,
        agreeableness: user2.personalityProfile.agreeableness,
        neuroticism: user2.personalityProfile.neuroticism,
      }
    );

    if (personalityScore >= 80) {
      reasons.push('Very similar personalities');
    } else if (personalityScore >= 70) {
      reasons.push('Compatible personalities');
    }
  }

  // 2. Calculate interests compatibility (25% weight)
  let interestsScore = 0;
  let interestsCount = 0;

  if (user1.personalityProfile && user2.personalityProfile) {
    // Interests similarity
    const interestsSimilarity = calculateJaccardSimilarity(
      user1.personalityProfile.interests || [],
      user2.personalityProfile.interests || []
    );
    interestsScore += interestsSimilarity;
    interestsCount++;

    // Values similarity
    const valuesSimilarity = calculateJaccardSimilarity(
      user1.personalityProfile.values || [],
      user2.personalityProfile.values || []
    );
    interestsScore += valuesSimilarity;
    interestsCount++;

    // Traits similarity
    const traitsSimilarity = calculateJaccardSimilarity(
      user1.personalityProfile.traits || [],
      user2.personalityProfile.traits || []
    );
    interestsScore += traitsSimilarity;
    interestsCount++;

    // Average the scores
    if (interestsCount > 0) {
      interestsScore = Math.round(interestsScore / interestsCount);
    }

    // Add reasons for shared interests
    const sharedInterests = (user1.personalityProfile.interests || []).filter(
      (interest) =>
        (user2.personalityProfile?.interests || []).includes(interest)
    );

    if (sharedInterests.length > 0) {
      const topShared = sharedInterests.slice(0, 2).join(' & ');
      reasons.push(`Both love ${topShared}`);
    }
  }

  // 3. Calculate lifestyle compatibility (25% weight)
  const lifestyleResult = getLifestyleCompatibility(
    user1.lifestyle,
    user2.lifestyle
  );
  const lifestyleScore = lifestyleResult.score;

  // Add lifestyle reasons
  if (lifestyleResult.compatible.includes('wants_kids')) {
    if (user1.lifestyle.wantsKids === 'yes') {
      reasons.push('Both want kids');
    } else if (user1.lifestyle.wantsKids === 'no') {
      reasons.push('Both child-free');
    }
  }

  if (
    lifestyleResult.compatible.includes('religion') &&
    user1.lifestyle.religion &&
    user1.lifestyle.religion.length > 0
  ) {
    reasons.push('Share religious values');
  }

  // 4. Calculate total compatibility score
  const totalScore = Math.round(
    personalityScore * 0.5 + interestsScore * 0.25 + lifestyleScore * 0.25
  );

  return {
    score: Math.max(0, Math.min(100, totalScore)),
    personalityScore,
    interestsScore,
    lifestyleScore,
    reasons: reasons.slice(0, 3), // Return top 3 reasons
  };
}

/**
 * Check if two users pass dealbreaker filters
 * Returns true if compatible, false if dealbreaker violated
 */
export function checkDealbreakers(
  user1: UserProfileForMatching,
  user2: UserProfileForMatching
): { compatible: boolean; reason?: string } {
  // Kids dealbreaker
  if (
    user1.lifestyle.wantsKids &&
    user2.lifestyle.wantsKids &&
    user1.lifestyle.wantsKids !== 'maybe' &&
    user2.lifestyle.wantsKids !== 'maybe' &&
    user1.lifestyle.wantsKids !== user2.lifestyle.wantsKids
  ) {
    return { compatible: false, reason: 'Incompatible kids preference' };
  }

  // Gender/looking_for must match
  if (!user1.lookingFor.includes(user2.gender)) {
    return { compatible: false, reason: 'Gender preference mismatch' };
  }

  if (!user2.lookingFor.includes(user1.gender)) {
    return { compatible: false, reason: 'Gender preference mismatch' };
  }

  return { compatible: true };
}
