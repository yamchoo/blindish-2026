import { supabase } from '@/lib/supabase';
import type { SpotifyData } from '@/features/personality/services/spotifyDataService';
import type { YouTubeData } from '@/features/personality/services/youtubeDataService';

export interface PersonalityAnalysisInput {
  profile: {
    age: number;
    gender: string;
    occupation?: string | null;
  };
  spotify?: SpotifyData | null;
  youtube?: YouTubeData | null;
  lifestyle: {
    wants_kids?: string | null;
    drinking?: string | null;
    smoking?: string | null;
    marijuana_use?: string | null;
    religion?: string | null;
    politics?: string | null;
  };
}

export interface PersonalityProfile {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  traits: string[];
  interests: string[];
  values: string[];
  summary: string;
  confidence: number;
}

export class AIProvider {
  /**
   * Analyze user personality from digital footprints
   */
  async analyzePersonality(
    data: PersonalityAnalysisInput
  ): Promise<PersonalityProfile> {
    console.log('Calling Edge Function for personality analysis...');

    try {
      const { data: personality, error } = await supabase.functions.invoke<PersonalityProfile>(
        'analyze-personality',
        {
          body: data,
        }
      );

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(`Personality analysis failed: ${error.message}`);
      }

      if (!personality) {
        throw new Error('No personality data returned');
      }

      // Validate scores are within range
      this.validatePersonalityProfile(personality);

      console.log('Personality analysis complete');
      return personality;
    } catch (error) {
      console.error('Failed to analyze personality:', error);
      throw error;
    }
  }

  /**
   * Validate personality profile values
   */
  private validatePersonalityProfile(profile: PersonalityProfile): void {
    const scores = [
      profile.openness,
      profile.conscientiousness,
      profile.extraversion,
      profile.agreeableness,
      profile.neuroticism,
    ];

    scores.forEach((score, index) => {
      if (score < 0 || score > 100) {
        throw new Error(
          `Invalid personality score at index ${index}: ${score}`
        );
      }
    });

    if (profile.confidence < 0 || profile.confidence > 100) {
      throw new Error(`Invalid confidence score: ${profile.confidence}`);
    }

    if (!Array.isArray(profile.traits) || profile.traits.length === 0) {
      throw new Error('Traits array is invalid or empty');
    }

    if (!Array.isArray(profile.interests) || profile.interests.length === 0) {
      throw new Error('Interests array is invalid or empty');
    }

    if (!Array.isArray(profile.values) || profile.values.length === 0) {
      throw new Error('Values array is invalid or empty');
    }

    if (!profile.summary || profile.summary.length < 10) {
      throw new Error('Summary is invalid or too short');
    }
  }
}

export const aiProvider = new AIProvider();
