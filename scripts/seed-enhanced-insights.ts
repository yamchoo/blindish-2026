/**
 * Seed Enhanced Personality Insights Script
 * Adds relationship insights and communication style data to existing profiles
 *
 * Usage: npx tsx scripts/seed-enhanced-insights.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Enhanced personality analysis samples with relationship insights
const enhancedAnalysisSamples = {
  alice: {
    bigFiveScores: {
      openness: 85,
      conscientiousness: 70,
      extraversion: 60,
      agreeableness: 80,
      neuroticism: 40,
    },
    traits: ['Creative', 'Thoughtful', 'Adventurous', 'Introspective', 'Curious'],
    interests: ['indie music', 'philosophy', 'sustainable living', 'creative writing', 'hiking'],
    values: ['authenticity', 'growth', 'kindness', 'emotional depth'],
    summary: 'Creative and thoughtful software engineer who loves exploring new places and ideas. Values deep conversations and genuine connections.',
    confidence: 0.85,
    relationshipInsights: {
      communication_style_inference: 'Likely values deep, emotionally vulnerable communication based on introspective music taste and philosophical content consumption. High Openness (85) suggests comfort with complex emotional discussions.',
      compatibility_strengths: [
        'High Openness (85) suggests creative, intellectually curious partner who values personal growth and new experiences',
        'High Agreeableness (80) indicates compassionate, cooperative nature - excellent for healthy conflict resolution and emotional support',
        'Moderate Extraversion (60) creates balanced social needs - comfortable in social settings but also values meaningful one-on-one time',
        'Moderate Neuroticism (40) suggests emotional stability and resilience - research shows scores between 30-50 predict strong relationship satisfaction'
      ],
      what_to_know: [
        'High Openness + Moderate Extraversion combination indicates "quiet creativity" - values deep one-on-one intellectual connections over large social gatherings',
        'Moderate Conscientiousness (70) means organized but flexible - plans ahead but can adapt when needed, which research shows creates healthy relationship balance',
        'Strong introspective nature based on music taste (indie folk, ambient) may mean processing emotions internally before sharing - not distance, but thoughtfulness'
      ],
      research_backed_note: 'Based on Big Five research (Botwin et al., 1997), this personality profile predicts strong relationship satisfaction when paired with partners who value emotional intimacy and intellectual connection. The combination of High Openness (85) with High Agreeableness (80) is associated with 72% long-term compatibility in longitudinal studies.'
    },
    conversationStarters: [
      'Ask about their favorite indie artist lyric - their music taste suggests thoughtful, meaningful answers',
      'Discuss a philosophical question or ethical dilemma - their Openness score indicates they\'ll enjoy deep intellectual conversations',
      'Share a documentary or book recommendation - their content consumption shows curiosity about ideas'
    ],
    communication_style_inference: {
      conflict_resolution: {
        likely: 'talk_immediately',
        confidence: 0.7,
        reasoning: 'High Agreeableness (80) suggests cooperative approach to conflict; introspective nature indicates thoughtfulness in discussions'
      },
      affection_expression: {
        likely: 'quality_time',
        confidence: 0.75,
        reasoning: 'Moderate Extraversion (60) + High Openness (85) suggests valuing deep, meaningful one-on-one interactions over surface-level gestures'
      },
      emotional_depth: {
        likely: 'deep_vulnerable',
        confidence: 0.85,
        reasoning: 'High Openness (85), introspective music taste (indie folk, ambient), and philosophical interests strongly indicate preference for emotional depth'
      }
    }
  },
  bob: {
    bigFiveScores: {
      openness: 75,
      conscientiousness: 78,
      extraversion: 70,
      agreeableness: 75,
      neuroticism: 35,
    },
    traits: ['Empathetic', 'Social', 'Artistic', 'Organized', 'Warm'],
    interests: ['design', 'jazz music', 'specialty coffee', 'film photography', 'cooking'],
    values: ['creativity', 'empathy', 'balance', 'community'],
    summary: 'Social and empathetic designer who finds inspiration in everyday moments. Loves hosting dinner parties and exploring new coffee shops.',
    confidence: 0.82,
    relationshipInsights: {
      communication_style_inference: 'Balanced communicator who enjoys both lighthearted fun and deeper conversations. High Conscientiousness (78) suggests reliability in maintaining emotional connections.',
      compatibility_strengths: [
        'High Conscientiousness (78) indicates reliability, thoughtfulness, and follow-through - research shows this trait strongly predicts relationship commitment and satisfaction',
        'Balanced Extraversion (70) suggests social energy that enhances relationships - enjoys both going out and quality home time',
        'High Agreeableness (75) combined with empathy creates strong emotional attunement - naturally picks up on partner\'s needs and responds supportively',
        'Low Neuroticism (35) provides emotional stability - able to stay calm during challenges and provide grounding presence'
      ],
      what_to_know: [
        'High Conscientiousness (78) + Low Neuroticism (35) combination creates dependable, steady partner - research shows this pairing predicts long-term relationship success in 80% of cases',
        'Social nature (Extraversion: 70) means values shared experiences with friends and community - ideal partner appreciates social activities and hosting',
        'Creative interests (design, photography, cooking) indicate expressive personality who shows love through thoughtful actions and aesthetic gestures'
      ],
      research_backed_note: 'Research by Karney & Bradbury (1995) shows that High Conscientiousness paired with Low Neuroticism creates the most stable relationship foundation. Partners with this profile demonstrate consistent emotional availability and are 40% more likely to effectively navigate relationship challenges.'
    },
    conversationStarters: [
      'Ask about their favorite design project or creative work - they\'ll light up discussing their craft',
      'Bond over coffee culture - suggest trying a new cafe together',
      'Discuss a recent film or photography exhibit - their artistic side will enjoy aesthetic conversations'
    ],
    communication_style_inference: {
      conflict_resolution: {
        likely: 'seek_compromise',
        confidence: 0.8,
        reasoning: 'High Conscientiousness (78) + High Agreeableness (75) strongly suggests collaborative, solution-oriented approach to disagreements'
      },
      affection_expression: {
        likely: 'acts_of_service',
        confidence: 0.7,
        reasoning: 'Creative interests (cooking, hosting) combined with Conscientiousness suggests showing love through thoughtful actions and creating experiences'
      },
      emotional_depth: {
        likely: 'light_fun',
        confidence: 0.65,
        reasoning: 'Higher Extraversion (70) + social interests suggest preference for keeping things lighthearted while being capable of depth when needed'
      }
    }
  },
  charlie: {
    bigFiveScores: {
      openness: 90,
      conscientiousness: 60,
      extraversion: 45,
      agreeableness: 85,
      neuroticism: 50,
    },
    traits: ['Introspective', 'Compassionate', 'Spiritual', 'Sensitive', 'Artistic'],
    interests: ['poetry', 'mindfulness', 'nature', 'creative writing', 'social justice'],
    values: ['authenticity', 'compassion', 'mindfulness', 'justice'],
    summary: 'Introspective writer with deep empathy and spiritual awareness. Seeks meaningful connections and values emotional authenticity.',
    confidence: 0.88,
    relationshipInsights: {
      communication_style_inference: 'Deeply values emotional vulnerability and authentic expression. Very High Openness (90) indicates comfort with complex feelings and philosophical discussions about relationships.',
      compatibility_strengths: [
        'Exceptional Openness (90) creates rare depth of emotional intelligence and philosophical curiosity - top 5% of population in this trait',
        'Very High Agreeableness (85) indicates exceptional compassion and understanding - naturally attuned to partner\'s emotional needs',
        'Moderate Neuroticism (50) provides emotional sensitivity that enhances empathy without overwhelming - research shows this "Goldilocks zone" creates deep emotional connections',
        'Spiritual and mindfulness practices suggest intentional approach to relationships and strong self-awareness'
      ],
      what_to_know: [
        'Introversion (Extraversion: 45) combined with High Sensitivity means needs regular alone time to recharge - this is self-care, not withdrawal',
        'Very High Openness (90) + Moderate Neuroticism (50) creates "deeply feeling" personality - experiences emotions intensely, which can be gift in intimate relationships',
        'Moderate Conscientiousness (60) suggests flexible, adaptable nature - may not be extremely scheduled but is reliable in what matters emotionally'
      ],
      research_backed_note: 'Research by Aron & Aron (1997) on highly sensitive persons shows that individuals with Very High Openness (90+) and Moderate Neuroticism (45-55) form exceptionally deep emotional bonds when paired with understanding partners who respect their need for emotional processing time.'
    },
    conversationStarters: [
      'Share a meaningful poem or piece of writing - their literary soul will appreciate the depth',
      'Discuss a mindfulness practice or spiritual concept - they\'ll enjoy the philosophical exploration',
      'Ask about their perspective on a social issue - their values suggest thoughtful, compassionate views'
    ],
    communication_style_inference: {
      conflict_resolution: {
        likely: 'need_space',
        confidence: 0.75,
        reasoning: 'Introversion (45) + High Sensitivity (Neuroticism: 50) suggests needing processing time before discussing difficult emotions'
      },
      affection_expression: {
        likely: 'words',
        confidence: 0.8,
        reasoning: 'Writer identity + Very High Openness (90) strongly indicates expressing love through meaningful words and verbal affirmation'
      },
      emotional_depth: {
        likely: 'deep_vulnerable',
        confidence: 0.9,
        reasoning: 'Very High Openness (90), spiritual interests, and creative writing background overwhelmingly indicate preference for deep emotional vulnerability'
      }
    }
  }
};

// Communication style samples
const communicationStyleSamples = {
  alice: {
    conflict_resolution: 'talk_immediately',
    affection_expression: 'quality_time',
    communication_preference: 'deep_vulnerable'
  },
  bob: {
    conflict_resolution: 'seek_compromise',
    affection_expression: 'acts_of_service',
    communication_preference: 'light_fun'
  },
  charlie: {
    conflict_resolution: 'need_space',
    affection_expression: 'words',
    communication_preference: 'deep_vulnerable'
  }
};

async function seedEnhancedInsights() {
  console.log('\n🌱 Seeding enhanced personality insights and communication data...\n');

  try {
    // Get all test profiles
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .in('email', ['alice.test@blindish.app', 'bob.test@blindish.app', 'charlie.test@blindish.app']);

    if (fetchError) {
      console.error('❌ Error fetching profiles:', fetchError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('⚠️  No test profiles found. Run seed-test-profiles.ts first.');
      return;
    }

    console.log(`Found ${profiles.length} test profiles to update\n`);

    // Update each profile
    for (const profile of profiles) {
      const key = profile.name?.toLowerCase() as 'alice' | 'bob' | 'charlie';
      if (!key || !enhancedAnalysisSamples[key]) continue;

      console.log(`📝 Updating ${profile.name} (${profile.email})...`);

      // 1. Update personality_profiles with enhanced analysis
      const { error: ppError } = await supabase
        .from('personality_profiles')
        .update({
          ai_analysis: enhancedAnalysisSamples[key],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.id);

      if (ppError) {
        console.error(`   ❌ Failed to update personality_profiles:`, ppError.message);
      } else {
        console.log(`   ✅ Added enhanced personality insights`);
      }

      // 2. Update profiles with communication style
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          communication_style: communicationStyleSamples[key],
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (profileError) {
        console.error(`   ❌ Failed to update communication_style:`, profileError.message);
      } else {
        console.log(`   ✅ Added communication style data`);
      }

      console.log();
    }

    console.log('✨ Enhanced insights seeding complete!\n');
    console.log('📊 What was added:');
    console.log('   - Relationship insights (compatibility_strengths, what_to_know, research notes)');
    console.log('   - Communication style inferences (conflict resolution, love languages)');
    console.log('   - Conversation starters based on interests');
    console.log('   - Explicit communication preferences\n');

  } catch (error) {
    console.error('\n❌ Error seeding enhanced insights:', error);
  }
}

seedEnhancedInsights();
