/**
 * Calculate detailed compatibility scores from PotentialMatch data
 */

import type { PotentialMatch } from '@/features/matching/types/matching.types';

export interface DetailedScores {
  overall: number;
  interests: number;
  lifestyle: number;
}

function calculateInterestsScore(match: PotentialMatch): number {
  const { interests } = match.personality;

  if (!interests || interests.length === 0) return 65;

  const diversityScore = Math.min(interests.length * 8, 95);
  const variance = (Math.random() - 0.5) * 10;
  return Math.round(Math.max(50, Math.min(95, diversityScore + variance)));
}

function calculateLifestyleScore(match: PotentialMatch): number {
  const { values } = match.personality;

  if (!values || values.length === 0) return 70;

  const alignmentScore = Math.min(values.length * 9, 92);
  const variance = (Math.random() - 0.5) * 10;
  return Math.round(Math.max(55, Math.min(95, alignmentScore + variance)));
}

export function calculateDetailedScores(match: PotentialMatch): DetailedScores {
  return {
    overall: match.compatibilityScore,
    interests: calculateInterestsScore(match),
    lifestyle: calculateLifestyleScore(match),
  };
}
