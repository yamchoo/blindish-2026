import { supabase, withRetryAndFallback, directUpsert, directSelect } from '@/lib/supabase';
import { getAuthToken } from '@/lib/supabase/session-helper';
import { aiProvider } from '@/lib/ai/provider';
import { spotifyDataService } from './spotifyDataService';
import { youtubeDataService } from './youtubeDataService';

export const personalityService = {
  /**
   * Analyze user personality from digital footprints and lifestyle data
   */
  async analyzeUserPersonality(userId: string): Promise<boolean> {
    try {
      console.log('Starting personality analysis for user:', userId);

      // 1. Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error('Failed to fetch profile:', profileError);
        throw new Error('Profile not found');
      }

      // 2. Check consent
      if (!profile.consent_digital_footprint) {
        console.log(
          'User has not consented to digital footprint analysis, using survey-only'
        );
      }

      // 3. Fetch digital footprint data (if consented and connected)
      const dataSources: string[] = ['survey']; // Always include survey

      let spotifyData = null;
      if (profile.spotify_connected && profile.consent_digital_footprint) {
        console.log('Fetching Spotify data...');
        spotifyData = await spotifyDataService.fetchUserData();
        if (spotifyData) {
          console.log('Spotify:', spotifyDataService.getSummary(spotifyData));
          dataSources.push('spotify');
        }
      }

      let youtubeData = null;
      if (profile.youtube_connected && profile.consent_digital_footprint) {
        console.log('Fetching YouTube data...');
        youtubeData = await youtubeDataService.fetchUserData();
        if (youtubeData) {
          console.log('YouTube:', youtubeDataService.getSummary(youtubeData));
          dataSources.push('youtube');
        }
      }

      // 5. Build analysis input
      const analysisInput = {
        profile: {
          age: profile.age,
          gender: profile.gender,
          occupation: profile.occupation,
        },
        spotify: spotifyData,
        youtube: youtubeData,
        lifestyle: {
          wants_kids: profile.wants_kids,
          drinking: profile.drinking,
          smoking: profile.smoking,
          marijuana_use: profile.marijuana_use,
          religion: profile.religion,
          politics: profile.politics,
        },
      };

      console.log('Analysis input prepared, calling AI...');
      console.log('Data sources:', dataSources.join(', '));

      // 6. Call AI for personality analysis
      const personality = await aiProvider.analyzePersonality(analysisInput);

      console.log('AI analysis complete:');
      console.log(
        `Big Five - O:${personality.openness} C:${personality.conscientiousness} E:${personality.extraversion} A:${personality.agreeableness} N:${personality.neuroticism}`
      );
      console.log(`Confidence: ${personality.confidence}`);
      console.log(`Traits: ${personality.traits.join(', ')}`);

      // 7. Upsert to personality_profiles table with retry/fallback pattern
      const personalityData = {
        user_id: userId,
        // Big Five scores
        openness: personality.openness,
        conscientiousness: personality.conscientiousness,
        extraversion: personality.extraversion,
        agreeableness: personality.agreeableness,
        neuroticism: personality.neuroticism,
        // Analysis details
        traits: personality.traits,
        interests: personality.interests,
        values: personality.values,
        summary: personality.summary,
        confidence_score: personality.confidence,
        data_sources: dataSources,
        updated_at: new Date().toISOString(),
      };

      // Get auth token for fallback operations (from in-memory auth store, no network call)
      const authToken = getAuthToken();

      const { error: upsertError } = await withRetryAndFallback(
        () =>
          supabase
            .from('personality_profiles')
            .upsert(personalityData, { onConflict: 'user_id' }),
        (token) => directUpsert('personality_profiles', personalityData, { onConflict: 'user_id' }, token),
        undefined,
        authToken
      );

      if (upsertError) {
        console.error('Failed to upsert personality profile:', upsertError);
        throw upsertError;
      }

      console.log('Personality profile saved successfully!');
      return true;
    } catch (error) {
      console.error('Personality analysis failed:', error);
      return false;
    }
  },

  /**
   * Get personality profile for a user
   */
  async getPersonalityProfile(userId: string) {
    // Get auth token for fallback operations (from in-memory auth store, no network call)
    const authToken = getAuthToken();

    const { data, error } = await withRetryAndFallback(
      () =>
        supabase
          .from('personality_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
      (token) =>
        directSelect('personality_profiles', {
          select: '*',
          filters: [{ column: 'user_id', operator: 'eq', value: userId }],
          single: false, // maybeSingle returns null if not found, not an error
        }, token),
      undefined,
      authToken
    );

    // maybeSingle() returns null if no rows found (not an error)
    if (error) {
      console.error('Failed to fetch personality profile:', error);
      return null;
    }

    return data;
  },
};
