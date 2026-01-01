import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

/**
 * Edge Function: Calculate Compatibility
 * Calculates compatibility score and breakdown between two users
 * Prevents client-side manipulation of scores
 */

// =====================================================
// TYPE DEFINITIONS
// =====================================================

interface BigFiveScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface CompatibilityRequest {
  user1_id: string;
  user2_id: string;
}

interface CompatibilityResponse {
  overallScore: number;
  personality: {
    score: number;
    details: Record<string, { user1: number; user2: number; difference: number }>;
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
    compatible: string[];
    neutral: string[];
  };
}

// =====================================================
// HELPER FUNCTIONS (mirrored from client-side)
// =====================================================

function calculateBigFiveDistance(
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

  const sumSquaredDifferences = traits.reduce((sum, trait) => {
    const diff = profile1[trait] - profile2[trait];
    return sum + diff * diff;
  }, 0);

  const distance = Math.sqrt(sumSquaredDifferences / traits.length);
  const normalizedDistance = distance / 100;

  return Math.round((1 - normalizedDistance) * 100);
}

function calculateJaccardSimilarity(set1: string[], set2: string[]): number {
  if (!set1 || !set2 || (set1.length === 0 && set2.length === 0)) {
    return 0;
  }

  const s1 = new Set(set1.map((s) => s.toLowerCase().trim()));
  const s2 = new Set(set2.map((s) => s.toLowerCase().trim()));

  const intersection = new Set([...s1].filter((x) => s2.has(x)));
  const union = new Set([...s1, ...s2]);

  if (union.size === 0) {
    return 0;
  }

  return Math.round((intersection.size / union.size) * 100);
}

function getLifestyleCompatibility(profile1: any, profile2: any) {
  let score = 100;
  const compatible: string[] = [];
  const neutral: string[] = [];

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
    apolitical: 2,
  };

  // Kids preference
  if (profile1.wants_kids && profile2.wants_kids) {
    if (profile1.wants_kids === profile2.wants_kids) {
      compatible.push('wants_kids');
      score += 10;
    } else if (
      profile1.wants_kids === 'maybe' ||
      profile2.wants_kids === 'maybe'
    ) {
      neutral.push('wants_kids');
    } else {
      score -= 30;
      neutral.push('wants_kids');
    }
  }

  // Religion
  if (
    profile1.religion &&
    profile2.religion &&
    profile1.religion.length > 0 &&
    profile2.religion.length > 0
  ) {
    const religionOverlap = calculateJaccardSimilarity(
      profile1.religion,
      profile2.religion
    );
    if (religionOverlap > 50) {
      compatible.push('religion');
      score += Math.round(religionOverlap * 0.2);
    } else if (religionOverlap > 0) {
      neutral.push('religion');
    }
  }

  // Drinking
  if (profile1.drinking && profile2.drinking) {
    const diff = Math.abs(
      drinkingScale[profile1.drinking] - drinkingScale[profile2.drinking]
    );
    if (diff === 0) {
      compatible.push('drinking');
      score += 10;
    } else if (diff === 1) {
      compatible.push('drinking');
      score += 5;
    } else {
      neutral.push('drinking');
      score -= diff * 3;
    }
  }

  // Smoking
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

  // Marijuana
  if (profile1.marijuana_use && profile2.marijuana_use) {
    const diff = Math.abs(
      drinkingScale[profile1.marijuana_use] - drinkingScale[profile2.marijuana_use]
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

  // Politics
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
      score -= diff * 5;
    }
  }

  return {
    score: Math.round(Math.max(0, Math.min(100, score))),
    compatible,
    neutral,
  };
}

// =====================================================
// MAIN HANDLER
// =====================================================

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers':
          'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { user1_id, user2_id }: CompatibilityRequest = await req.json();

    if (!user1_id || !user2_id) {
      return new Response(
        JSON.stringify({ error: 'Missing user1_id or user2_id' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    console.log(`Calculating compatibility for ${user1_id} and ${user2_id}`);

    // Fetch both user profiles with personality data
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*, personality_profiles(*)')
      .in('id', [user1_id, user2_id]);

    if (error || !users || users.length !== 2) {
      console.error('Error fetching user profiles:', error);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch user profiles',
          details: error?.message,
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

    const [user1, user2] = users;

    // Check if both users have personality profiles
    if (!user1.personality_profiles || !user2.personality_profiles) {
      return new Response(
        JSON.stringify({
          error: 'One or both users missing personality profile',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // 1. Calculate personality compatibility (50% weight)
    const personalityScore = calculateBigFiveDistance(
      user1.personality_profiles,
      user2.personality_profiles
    );

    const personalityDetails: Record<
      string,
      { user1: number; user2: number; difference: number }
    > = {};

    const traits: (keyof BigFiveScores)[] = [
      'openness',
      'conscientiousness',
      'extraversion',
      'agreeableness',
      'neuroticism',
    ];

    traits.forEach((trait) => {
      personalityDetails[trait] = {
        user1: user1.personality_profiles[trait],
        user2: user2.personality_profiles[trait],
        difference: Math.abs(
          user1.personality_profiles[trait] - user2.personality_profiles[trait]
        ),
      };
    });

    // 2. Calculate interests compatibility
    const interestsScore = calculateJaccardSimilarity(
      user1.personality_profiles.interests || [],
      user2.personality_profiles.interests || []
    );

    const sharedInterests = (user1.personality_profiles.interests || []).filter(
      (i: string) => (user2.personality_profiles.interests || []).includes(i)
    );

    const uniqueUser1Interests = (user1.personality_profiles.interests || []).filter(
      (i: string) => !(user2.personality_profiles.interests || []).includes(i)
    );

    const uniqueUser2Interests = (user2.personality_profiles.interests || []).filter(
      (i: string) => !(user1.personality_profiles.interests || []).includes(i)
    );

    // 3. Calculate values compatibility
    const valuesScore = calculateJaccardSimilarity(
      user1.personality_profiles.values || [],
      user2.personality_profiles.values || []
    );

    const sharedValues = (user1.personality_profiles.values || []).filter(
      (v: string) => (user2.personality_profiles.values || []).includes(v)
    );

    const uniqueUser1Values = (user1.personality_profiles.values || []).filter(
      (v: string) => !(user2.personality_profiles.values || []).includes(v)
    );

    const uniqueUser2Values = (user2.personality_profiles.values || []).filter(
      (v: string) => !(user1.personality_profiles.values || []).includes(v)
    );

    // Average interests and values for combined score
    const combinedInterestsScore = Math.round((interestsScore + valuesScore) / 2);

    // 4. Calculate lifestyle compatibility (25% weight)
    const lifestyleResult = getLifestyleCompatibility(user1, user2);

    // 5. Calculate overall compatibility
    const overallScore = Math.round(
      personalityScore * 0.5 +
        combinedInterestsScore * 0.25 +
        lifestyleResult.score * 0.25
    );

    // Build response
    const response: CompatibilityResponse = {
      overallScore,
      personality: {
        score: personalityScore,
        details: personalityDetails,
      },
      interests: {
        score: interestsScore,
        shared: sharedInterests,
        unique: {
          user1: uniqueUser1Interests,
          user2: uniqueUser2Interests,
        },
      },
      values: {
        score: valuesScore,
        shared: sharedValues,
        unique: {
          user1: uniqueUser1Values,
          user2: uniqueUser2Values,
        },
      },
      lifestyle: {
        score: lifestyleResult.score,
        compatible: lifestyleResult.compatible,
        neutral: lifestyleResult.neutral,
      },
    };

    console.log(`Compatibility calculated: ${overallScore}`);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error in calculate-compatibility:', error);
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
