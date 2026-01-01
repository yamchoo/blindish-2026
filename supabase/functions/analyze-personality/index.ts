import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface PersonalityAnalysisInput {
  profile: {
    age: number;
    gender: string;
    occupation?: string | null;
  };
  spotify?: any | null;
  youtube?: any | null;
  lifestyle: {
    wants_kids?: string | null;
    drinking?: string | null;
    smoking?: string | null;
    marijuana_use?: string | null;
    religion?: string | null;
    politics?: string | null;
  };
}

interface CommunicationStyleInference {
  likely: string;
  confidence: number;
  reasoning: string;
}

interface RelationshipInsights {
  communication_style_inference: string;
  compatibility_strengths: string[];
  what_to_know: string[];
  research_backed_note: string;
}

interface PersonalityProfile {
  bigFiveScores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  traits: string[];
  interests: string[];
  values: string[];
  summary: string;
  confidence: number;
  relationshipInsights: RelationshipInsights;
  conversationStarters: string[];
  communication_style_inference?: {
    conflict_resolution?: CommunicationStyleInference;
    affection_expression?: CommunicationStyleInference;
    emotional_depth?: CommunicationStyleInference;
  };
}

function buildPrompt(data: PersonalityAnalysisInput): string {
  let prompt = `Analyze this user's personality using the Big Five model.\n\n`;

  // User profile
  prompt += `User Profile:\n`;
  prompt += `- Age: ${data.profile.age}\n`;
  prompt += `- Gender: ${data.profile.gender}\n`;
  if (data.profile.occupation) {
    prompt += `- Occupation: ${data.profile.occupation}\n`;
  }

  // Spotify listening data
  if (data.spotify) {
    prompt += `\nSpotify Listening:\n`;

    if (data.spotify.topArtists?.length > 0) {
      const artistNames = data.spotify.topArtists
        .map((a: any) => a.name)
        .slice(0, 15)
        .join(', ');
      prompt += `- Top Artists: ${artistNames}\n`;
    }

    if (data.spotify.topArtists?.length > 0) {
      const allGenres = new Set<string>();
      data.spotify.topArtists.forEach((a: any) =>
        a.genres?.forEach((g: string) => allGenres.add(g))
      );
      const genres = Array.from(allGenres).slice(0, 15).join(', ');
      prompt += `- Music Genres: ${genres}\n`;
    }

    if (data.spotify.topTracks?.length > 0) {
      const trackNames = data.spotify.topTracks
        .map((t: any) => `"${t.name}" by ${t.artist}`)
        .slice(0, 10)
        .join(', ');
      prompt += `- Favorite Tracks: ${trackNames}\n`;
    }

    if (data.spotify.playlists?.length > 0) {
      const playlistInfo = data.spotify.playlists
        .map((p: any) => `${p.name} (${p.trackCount} tracks)`)
        .slice(0, 5)
        .join(', ');
      prompt += `- Playlists: ${playlistInfo}\n`;
    }
  }

  // YouTube consumption data
  if (data.youtube) {
    prompt += `\nYouTube Consumption:\n`;

    if (data.youtube.subscriptions?.length > 0) {
      const channelNames = data.youtube.subscriptions
        .map((s: any) => s.title)
        .slice(0, 20)
        .join(', ');
      prompt += `- Subscribed Channels: ${channelNames}\n`;
    }

    if (data.youtube.likedVideos?.length > 0) {
      const videoTitles = data.youtube.likedVideos
        .map((v: any) => v.title)
        .slice(0, 10)
        .join(', ');
      prompt += `- Liked Videos: ${videoTitles}\n`;
    }

    if (data.youtube.playlists?.length > 0) {
      const playlistInfo = data.youtube.playlists
        .map((p: any) => `${p.title} (${p.videoCount} videos)`)
        .slice(0, 5)
        .join(', ');
      prompt += `- Playlists: ${playlistInfo}\n`;
    }
  }

  // Lifestyle answers
  prompt += `\nLifestyle Answers:\n`;
  if (data.lifestyle.wants_kids)
    prompt += `- Wants kids: ${data.lifestyle.wants_kids}\n`;
  if (data.lifestyle.drinking)
    prompt += `- Drinking: ${data.lifestyle.drinking}\n`;
  if (data.lifestyle.smoking)
    prompt += `- Smoking: ${data.lifestyle.smoking}\n`;
  if (data.lifestyle.marijuana_use)
    prompt += `- Cannabis use: ${data.lifestyle.marijuana_use}\n`;
  if (data.lifestyle.religion)
    prompt += `- Religion: ${data.lifestyle.religion}\n`;
  if (data.lifestyle.politics)
    prompt += `- Politics: ${data.lifestyle.politics}\n`;

  // Instructions
  prompt += `\nProvide a comprehensive personality analysis including:\n\n`;

  prompt += `1. BIG FIVE SCORES (0-100):\n`;
  prompt += `   - Openness: curiosity, creativity, openness to experience\n`;
  prompt += `   - Conscientiousness: organization, discipline, goal-oriented\n`;
  prompt += `   - Extraversion: sociability, assertiveness, energy level\n`;
  prompt += `   - Agreeableness: compassion, cooperation, trust\n`;
  prompt += `   - Neuroticism: emotional stability, anxiety, moodiness\n\n`;

  prompt += `2. RELATIONSHIP INSIGHTS:\n`;
  prompt += `   - Infer communication style from music taste and content consumption\n`;
  prompt += `   - Identify 3 compatibility strengths based on personality scores (with specific score references)\n`;
  prompt += `   - Note 2-3 things future partners should know (explain what scores mean in relationships)\n`;
  prompt += `   - Include a research-backed note citing actual Big Five studies when possible\n\n`;

  prompt += `3. COMMUNICATION STYLE INFERENCE:\n`;
  prompt += `   - Conflict resolution style: "talk_immediately" | "need_space" | "avoid_conflict" | "seek_compromise"\n`;
  prompt += `   - Affection expression: "words" | "quality_time" | "gifts" | "acts_of_service" | "physical_touch"\n`;
  prompt += `   - Emotional depth preference: "deep_vulnerable" | "light_fun" | "practical" | "balanced"\n`;
  prompt += `   - For each, provide confidence (0-1) and reasoning based on data\n\n`;

  prompt += `4. CONVERSATION STARTERS:\n`;
  prompt += `   - Suggest 2-3 conversation starters based on specific artists, channels, or interests\n\n`;

  prompt += `5. STANDARD FIELDS:\n`;
  prompt += `   - 5-10 key personality traits\n`;
  prompt += `   - 5-15 specific interests (not generic)\n`;
  prompt += `   - 3-7 core values\n`;
  prompt += `   - 2-3 sentence personality summary\n`;
  prompt += `   - Confidence score (0-100)\n\n`;

  prompt += `GUIDELINES:\n`;
  prompt += `- Ground all insights in actual data (cite specific artists/channels)\n`;
  prompt += `- When mentioning research, cite approximate findings (e.g., "Big Five research suggests...")\n`;
  prompt += `- Be specific, not generic ("loves introspective indie folk" not "likes music")\n`;
  prompt += `- Focus on relationship-relevant interpretations\n`;
  prompt += `- Explain what scores MEAN for compatibility, not just the score itself\n\n`;

  prompt += `Respond in this exact JSON format:\n`;
  prompt += `{\n`;
  prompt += `  "bigFiveScores": {\n`;
  prompt += `    "openness": number,\n`;
  prompt += `    "conscientiousness": number,\n`;
  prompt += `    "extraversion": number,\n`;
  prompt += `    "agreeableness": number,\n`;
  prompt += `    "neuroticism": number\n`;
  prompt += `  },\n`;
  prompt += `  "relationshipInsights": {\n`;
  prompt += `    "communication_style_inference": "One sentence about likely communication style",\n`;
  prompt += `    "compatibility_strengths": [\n`;
  prompt += `      "High Openness (75) suggests creative, intellectually curious partner who values growth",\n`;
  prompt += `      "High Agreeableness (80) indicates compassionate, cooperative nature - excellent for conflict resolution",\n`;
  prompt += `      "Moderate Neuroticism (35) suggests emotional stability - research shows scores 30-40 predict relationship satisfaction"\n`;
  prompt += `    ],\n`;
  prompt += `    "what_to_know": [\n`;
  prompt += `      "Introversion (Extraversion: 45) means may need alone time to recharge - not a lack of interest",\n`;
  prompt += `      "High Openness + Low Extraversion combination often indicates 'quiet creativity'"\n`;
  prompt += `    ],\n`;
  prompt += `    "research_backed_note": "Based on Big Five research (e.g., Botwin et al., 1997), this personality profile predicts..."\n`;
  prompt += `  },\n`;
  prompt += `  "conversationStarters": [\n`;
  prompt += `    "Ask about their favorite [specific artist] lyric - their introspective music taste suggests thoughtful answers",\n`;
  prompt += `    "Discuss [specific topic] - they follow [specific channel] which shows [specific interest]"\n`;
  prompt += `  ],\n`;
  prompt += `  "communication_style_inference": {\n`;
  prompt += `    "conflict_resolution": {\n`;
  prompt += `      "likely": "talk_immediately",\n`;
  prompt += `      "confidence": 0.7,\n`;
  prompt += `      "reasoning": "Follows relationship advice channels, listens to emotionally direct artists"\n`;
  prompt += `    },\n`;
  prompt += `    "affection_expression": {\n`;
  prompt += `      "likely": "quality_time",\n`;
  prompt += `      "confidence": 0.6,\n`;
  prompt += `      "reasoning": "Subscribes to slow living content; music suggests valuing presence"\n`;
  prompt += `    },\n`;
  prompt += `    "emotional_depth": {\n`;
  prompt += `      "likely": "deep_vulnerable",\n`;
  prompt += `      "confidence": 0.8,\n`;
  prompt += `      "reasoning": "Music heavily skewed toward introspective indie folk and emotional lyrics"\n`;
  prompt += `    }\n`;
  prompt += `  },\n`;
  prompt += `  "traits": string[],\n`;
  prompt += `  "interests": string[],\n`;
  prompt += `  "values": string[],\n`;
  prompt += `  "summary": string,\n`;
  prompt += `  "confidence": number\n`;
  prompt += `}`;

  return prompt;
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Verify API key is set
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Parse request body
    const data: PersonalityAnalysisInput = await req.json();

    // Build prompt
    const prompt = buildPrompt(data);

    console.log('Calling OpenAI for personality analysis...');

    // Call OpenAI API
    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content:
                'You are a psychologist analyzing personality from digital footprints using the Big Five personality model. Respond only with valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;

    console.log('OpenAI response received, parsing...');

    const personality: PersonalityProfile = JSON.parse(content);

    console.log('Personality analysis complete');

    return new Response(JSON.stringify(personality), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Failed to analyze personality:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
