/**
 * Analyze Photo Edge Function
 * Uses OpenAI Vision API to analyze uploaded photos for:
 * - Height estimation
 * - Style tags (casual, athletic, professional, etc.)
 * - Vibe description
 * - Setting tags (outdoor, urban, nature, etc.)
 * - Visual compatibility factors
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PhotoAnalysisRequest {
  imageUrl: string;
  userGender: 'male' | 'female' | 'non-binary' | 'other';
  userId: string;
}

interface PhotoAnalysisResponse {
  estimatedHeightCm: number | null;
  heightConfidence: number; // 0-100
  styleTags: string[]; // e.g., ['casual', 'athletic', 'outdoorsy']
  vibeDescription: string; // 1-2 sentences
  settingTags: string[]; // e.g., ['outdoor', 'urban', 'nature']
  visualCompatibilityFactors: string[]; // e.g., ['warm smile', 'approachable energy', 'active lifestyle']
  analysisNotes: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { imageUrl, userGender, userId }: PhotoAnalysisRequest = await req.json();

    if (!imageUrl || !userGender || !userId) {
      throw new Error('Missing required fields: imageUrl, userGender, userId');
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Construct analysis prompt
    const prompt = `Analyze this dating profile photo and provide detailed insights. The person identifies as ${userGender}.

Please analyze:
1. **Estimated Height**: Based on body proportions, surroundings, and visual context, estimate their height in centimeters (cm). Provide a confidence score (0-100). If you cannot estimate reliably, set height to null and confidence to 0.

2. **Style Tags**: List 3-5 descriptive style tags (e.g., casual, athletic, professional, bohemian, minimalist, edgy, preppy, outdoorsy, artistic).

3. **Vibe Description**: Write 1-2 sentences describing their overall energy and presence (e.g., "Warm and approachable with a creative, free-spirited energy").

4. **Setting Tags**: List 2-4 tags describing the photo setting (e.g., outdoor, urban, nature, beach, city, home, mountains, cafe).

5. **Visual Compatibility Factors**: List 3-5 positive visual traits that might create good chemistry with a match (e.g., "warm smile", "approachable energy", "active lifestyle", "adventurous spirit", "genuine expression").

6. **Analysis Notes**: Any additional observations about photo quality, authenticity, or context.

Return your analysis as a JSON object with this exact structure:
{
  "estimatedHeightCm": number | null,
  "heightConfidence": number,
  "styleTags": string[],
  "vibeDescription": string,
  "settingTags": string[],
  "visualCompatibilityFactors": string[],
  "analysisNotes": string
}`;

    // Call OpenAI Vision API
    console.log('Calling OpenAI Vision API...');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Parse JSON response
    let analysis: PhotoAnalysisResponse;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error(`Failed to parse analysis: ${parseError.message}`);
    }

    // Validate response structure
    if (typeof analysis.heightConfidence !== 'number' ||
        !Array.isArray(analysis.styleTags) ||
        !Array.isArray(analysis.settingTags) ||
        !Array.isArray(analysis.visualCompatibilityFactors)) {
      throw new Error('Invalid analysis structure from OpenAI');
    }

    // Store analysis in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabase
      .from('photos')
      .update({
        ai_analysis: analysis,
        analyzed_at: new Date().toISOString(),
      })
      .eq('storage_url', imageUrl)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to store analysis in database:', updateError);
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    // Optionally: Auto-populate height if confidence is high and user hasn't set height manually
    if (analysis.estimatedHeightCm && analysis.heightConfidence >= 70) {
      // Check if user has manually set height
      const { data: profile } = await supabase
        .from('profiles')
        .select('height_cm')
        .eq('id', userId)
        .single();

      // Only set height if user hasn't set it manually
      if (profile && profile.height_cm === null) {
        await supabase
          .from('profiles')
          .update({ height_cm: analysis.estimatedHeightCm })
          .eq('id', userId);

        console.log(`Auto-populated height: ${analysis.estimatedHeightCm}cm (confidence: ${analysis.heightConfidence}%)`);
      }
    }

    console.log('Photo analysis complete:', analysis);

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error analyzing photo:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
