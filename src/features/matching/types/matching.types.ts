/**
 * Type definitions for the matching system
 * Includes interfaces for potential matches, compatibility scores, and swipe actions
 */

/**
 * Big Five personality scores (0-100 for each trait)
 */
export interface BigFiveScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

/**
 * AI-generated photo analysis from OpenAI Vision API
 */
export interface PhotoAIAnalysis {
  estimatedHeightCm: number | null;
  heightConfidence: number; // 0-100
  styleTags: string[]; // e.g., ['casual', 'athletic', 'outdoorsy']
  vibeDescription: string; // 1-2 sentences
  settingTags: string[]; // e.g., ['outdoor', 'urban', 'nature']
  visualCompatibilityFactors: string[]; // e.g., ['warm smile', 'approachable energy']
  analysisNotes: string;
}

/**
 * Communication style inference with confidence
 */
export interface CommunicationStyleInference {
  likely: string;
  confidence: number; // 0-1
  reasoning: string;
}

/**
 * Relationship insights from enhanced personality analysis
 */
export interface RelationshipInsights {
  communication_style_inference: string;
  compatibility_strengths: string[];
  what_to_know: string[];
  research_backed_note: string;
}

/**
 * Enhanced AI personality analysis including relationship insights
 */
export interface PersonalityAIAnalysis {
  bigFiveScores: BigFiveScores;
  traits: string[];
  interests: string[];
  values: string[];
  summary: string;
  confidence: number;
  relationshipInsights?: RelationshipInsights;
  conversationStarters?: string[];
  communication_style_inference?: {
    conflict_resolution?: CommunicationStyleInference;
    affection_expression?: CommunicationStyleInference;
    emotional_depth?: CommunicationStyleInference;
  };
}

/**
 * Communication style preferences from onboarding
 */
export interface CommunicationStyle {
  conflict_resolution?: string;
  affection_expression?: string;
  communication_preference?: string;
}

/**
 * Potential match data for display in discover feed
 */
export interface PotentialMatch {
  id: string; // Added for consistency with backend
  userId: string;
  name: string;
  age: number;
  distance: number; // in miles
  location?: string; // city/state
  occupation?: string;
  primaryPhoto: {
    url: string;
    blurhash?: string;
    aiAnalysis?: PhotoAIAnalysis; // AI-generated visual insights
  };
  personality: {
    summary: string;
    traits: string[]; // Top personality traits
    highlights?: string[]; // Top 3-5 highlights for display
    type?: string; // e.g., 'thoughtful', 'adventurous'
    interests: string[];
    values: string[];
    scores: BigFiveScores;
  };
  compatibilityScore: number; // 0-100
  previewReasons: string[]; // Top 3 reasons for compatibility
  ai_analysis?: PersonalityAIAnalysis; // Enhanced personality analysis with relationship insights
  communication_style?: CommunicationStyle; // User's communication preferences from onboarding
}

/**
 * Detailed breakdown of compatibility calculation
 */
export interface CompatibilityBreakdown {
  overallScore: number;
  personality: {
    score: number;
    details: {
      [key in keyof BigFiveScores]: {
        user1: number;
        user2: number;
        difference: number;
      };
    };
  };
  interests: {
    score: number;
    shared: string[];
    unique: {
      user1: string[];
      user2: string[];
    };
  };
  values: {
    score: number;
    shared: string[];
    unique: {
      user1: string[];
      user2: string[];
    };
  };
  lifestyle: {
    score: number;
    compatible: string[]; // Lifestyle factors that match well
    neutral: string[]; // Lifestyle factors that are neutral
  };
}

/**
 * User swipe action types
 */
export type SwipeActionType = 'like' | 'pass';

/**
 * Record of a swipe action
 */
export interface SwipeAction {
  type: SwipeActionType;
  targetUserId: string;
  timestamp: Date;
}

/**
 * Result of a successful match creation
 */
export interface MatchResult {
  matchId: string;
  matchedUser: {
    userId: string;
    name: string;
    age: number;
    primaryPhoto: {
      url: string;
      blurhash?: string;
    };
    personality: {
      summary: string;
      traits: string[];
    };
  };
  compatibilityScore: number;
  breakdown: CompatibilityBreakdown;
  matchedAt: Date;
}

/**
 * Discover feed filters and preferences
 */
export interface DiscoverFilters {
  minAge?: number;
  maxAge?: number;
  maxDistance?: number; // in miles
  genders?: string[]; // Gender preferences
  minCompatibility?: number; // Minimum compatibility score (0-100)
}

/**
 * Discover feed pagination
 */
export interface DiscoverPagination {
  offset: number;
  limit: number;
}

/**
 * Discover feed response
 */
export interface DiscoverFeedResponse {
  matches: PotentialMatch[];
  hasMore: boolean;
  total: number;
}

/**
 * Like/pass action result
 */
export interface SwipeResult {
  success: boolean;
  isMatch: boolean; // True if this action created a match
  matchResult?: MatchResult; // Only present if isMatch is true
  error?: string;
}

/**
 * Lifestyle preferences for compatibility scoring
 */
export interface LifestylePreferences {
  drinking?: 'never' | 'rarely' | 'socially' | 'regularly';
  smoking?: 'never' | 'rarely' | 'socially' | 'regularly';
  marijuana?: 'never' | 'rarely' | 'socially' | 'regularly';
  religion?: string[];
  politics?: 'very_liberal' | 'liberal' | 'moderate' | 'conservative' | 'very_conservative' | 'apolitical';
  wantsKids?: 'yes' | 'no' | 'maybe';
}

/**
 * User profile data for compatibility calculation
 */
export interface UserProfileForMatching {
  id: string;
  name: string;
  age: number;
  gender: string;
  lookingFor: string[];
  location: {
    lat: number | null;
    lng: number | null;
    city?: string;
    state?: string;
  };
  lifestyle: LifestylePreferences;
  personalityProfile?: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    traits: string[];
    interests: string[];
    values: string[];
    summary: string;
  };
  photos: Array<{
    url: string;
    blurhash?: string;
    isPrimary: boolean;
  }>;
  lastActiveAt?: Date;
}

/**
 * Match status for UI display
 */
export type MatchStatus = 'unmatched' | 'matched' | 'chatting' | 'unblurred';

/**
 * Error types for matching operations
 */
export enum MatchingError {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA', // User missing personality profile
  NO_MATCHES_AVAILABLE = 'NO_MATCHES_AVAILABLE',
  ALREADY_LIKED = 'ALREADY_LIKED',
  ALREADY_PASSED = 'ALREADY_PASSED',
  INVALID_USER = 'INVALID_USER',
  COMPATIBILITY_CALCULATION_FAILED = 'COMPATIBILITY_CALCULATION_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
