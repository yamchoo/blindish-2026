/**
 * Vision Provider
 * Service layer for photo analysis using OpenAI Vision API
 * Follows the same pattern as personalityProvider.ts
 */

import { supabase } from '@/lib/supabase/client';

export interface PhotoAnalysisResult {
  estimatedHeightCm: number | null;
  heightConfidence: number; // 0-100
  styleTags: string[]; // e.g., ['casual', 'athletic', 'outdoorsy']
  vibeDescription: string; // 1-2 sentences
  settingTags: string[]; // e.g., ['outdoor', 'urban', 'nature']
  visualCompatibilityFactors: string[]; // e.g., ['warm smile', 'approachable energy']
  analysisNotes: string;
}

export interface AnalyzePhotoRequest {
  imageUrl: string;
  userGender: 'male' | 'female' | 'non-binary' | 'other';
  userId: string;
}

export interface AnalyzePhotoResponse {
  success: boolean;
  analysis?: PhotoAnalysisResult;
  error?: string;
}

/**
 * Analyze a photo using OpenAI Vision API
 * This function calls the Supabase Edge Function which handles the OpenAI API call
 */
export async function analyzePhoto(
  request: AnalyzePhotoRequest
): Promise<PhotoAnalysisResult> {
  try {
    console.log('[VisionProvider] Analyzing photo:', request.imageUrl);

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke<AnalyzePhotoResponse>(
      'analyze-photo',
      {
        body: request,
      }
    );

    if (error) {
      console.error('[VisionProvider] Edge Function error:', error);
      throw new Error(`Failed to analyze photo: ${error.message}`);
    }

    if (!data?.success || !data.analysis) {
      console.error('[VisionProvider] Invalid response:', data);
      throw new Error(data?.error || 'Invalid response from photo analysis');
    }

    console.log('[VisionProvider] Analysis complete:', data.analysis);

    return data.analysis;
  } catch (error) {
    console.error('[VisionProvider] Error analyzing photo:', error);
    throw error;
  }
}

/**
 * Fetch stored photo analysis from database
 * Used to retrieve analysis results without re-analyzing
 */
export async function getPhotoAnalysis(
  photoUrl: string
): Promise<PhotoAnalysisResult | null> {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('ai_analysis, analyzed_at')
      .eq('storage_url', photoUrl)
      .single();

    if (error) {
      console.error('[VisionProvider] Error fetching analysis:', error);
      return null;
    }

    if (!data?.ai_analysis) {
      return null;
    }

    return data.ai_analysis as PhotoAnalysisResult;
  } catch (error) {
    console.error('[VisionProvider] Error fetching photo analysis:', error);
    return null;
  }
}

/**
 * Check if a photo has been analyzed
 */
export async function isPhotoAnalyzed(photoUrl: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('analyzed_at')
      .eq('storage_url', photoUrl)
      .single();

    if (error || !data) {
      return false;
    }

    return !!data.analyzed_at;
  } catch (error) {
    console.error('[VisionProvider] Error checking analysis status:', error);
    return false;
  }
}

export const visionProvider = {
  analyzePhoto,
  getPhotoAnalysis,
  isPhotoAnalyzed,
};
