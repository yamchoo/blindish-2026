/**
 * Seed More Test Profiles
 * Creates additional diverse profiles for better matching variety
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newProfiles = [
  {
    email: 'grace.test@blindish.app',
    name: 'Grace',
    age: 26,
    gender: 'female',
    looking_for: ['male'],
    location_lat: 37.7749,
    location_lng: -122.4194,
    occupation: 'Graphic Designer',
    drinking: 'socially',
    smoking: 'never',
    marijuana_use: 'socially',
    religion: ['agnostic'],
    politics: 'liberal',
    wants_kids: 'maybe',
    personality: {
      openness: 90,
      conscientiousness: 65,
      extraversion: 70,
      agreeableness: 85,
      neuroticism: 45,
      traits: ['Creative', 'Open-minded', 'Energetic'],
      interests: ['art', 'design', 'photography', 'coffee', 'indie music'],
      values: ['creativity', 'authenticity', 'kindness'],
      summary: 'Creative designer who finds beauty in everyday moments. Love exploring art galleries and trying new coffee shops.',
    },
  },
  {
    email: 'henry.test@blindish.app',
    name: 'Henry',
    age: 31,
    gender: 'male',
    looking_for: ['female'],
    location_lat: 37.7849,
    location_lng: -122.4094,
    occupation: 'Architect',
    drinking: 'socially',
    smoking: 'never',
    marijuana_use: 'never',
    religion: ['christian'],
    politics: 'moderate',
    wants_kids: 'yes',
    personality: {
      openness: 80,
      conscientiousness: 85,
      extraversion: 60,
      agreeableness: 80,
      neuroticism: 30,
      traits: ['Thoughtful', 'Analytical', 'Reliable'],
      interests: ['architecture', 'design', 'travel', 'hiking', 'photography'],
      values: ['integrity', 'family', 'growth'],
      summary: 'Thoughtful architect who loves creating spaces that inspire. Looking for someone to explore the world with.',
    },
  },
  {
    email: 'ivy.test@blindish.app',
    name: 'Ivy',
    age: 24,
    gender: 'female',
    looking_for: ['male'],
    location_lat: 37.7649,
    location_lng: -122.4294,
    occupation: 'Yoga Instructor',
    drinking: 'rarely',
    smoking: 'never',
    marijuana_use: 'socially',
    religion: ['spiritual'],
    politics: 'very_liberal',
    wants_kids: 'no',
    personality: {
      openness: 95,
      conscientiousness: 70,
      extraversion: 75,
      agreeableness: 90,
      neuroticism: 35,
      traits: ['Mindful', 'Energetic', 'Compassionate'],
      interests: ['yoga', 'meditation', 'wellness', 'nature', 'cooking'],
      values: ['mindfulness', 'health', 'compassion'],
      summary: 'Yoga instructor passionate about wellness and mindful living. Love connecting with nature and positive energy.',
    },
  },
  {
    email: 'jake.test@blindish.app',
    name: 'Jake',
    age: 28,
    gender: 'male',
    looking_for: ['female'],
    location_lat: 37.7949,
    location_lng: -122.3994,
    occupation: 'Musician',
    drinking: 'socially',
    smoking: 'never',
    marijuana_use: 'socially',
    religion: ['agnostic'],
    politics: 'liberal',
    wants_kids: 'maybe',
    personality: {
      openness: 95,
      conscientiousness: 60,
      extraversion: 80,
      agreeableness: 75,
      neuroticism: 50,
      traits: ['Creative', 'Passionate', 'Spontaneous'],
      interests: ['music', 'concerts', 'guitar', 'songwriting', 'coffee'],
      values: ['creativity', 'authenticity', 'passion'],
      summary: 'Musician and songwriter who lives for the moment when a melody just clicks. Looking for someone to jam with.',
    },
  },
  {
    email: 'kate.test@blindish.app',
    name: 'Kate',
    age: 30,
    gender: 'female',
    looking_for: ['male', 'female'],
    location_lat: 37.8049,
    location_lng: -122.4094,
    occupation: 'Entrepreneur',
    drinking: 'socially',
    smoking: 'never',
    marijuana_use: 'rarely',
    religion: ['atheist'],
    politics: 'moderate',
    wants_kids: 'yes',
    personality: {
      openness: 85,
      conscientiousness: 90,
      extraversion: 85,
      agreeableness: 70,
      neuroticism: 25,
      traits: ['Ambitious', 'Confident', 'Strategic'],
      interests: ['startups', 'business', 'fitness', 'travel', 'networking'],
      values: ['ambition', 'growth', 'impact'],
      summary: 'Entrepreneur building the future. Looking for someone ambitious who shares my drive and passion for making an impact.',
    },
  },
  {
    email: 'leo.test@blindish.app',
    name: 'Leo',
    age: 27,
    gender: 'male',
    looking_for: ['female'],
    location_lat: 37.7549,
    location_lng: -122.4394,
    occupation: 'Chef',
    drinking: 'socially',
    smoking: 'never',
    marijuana_use: 'socially',
    religion: ['spiritual'],
    politics: 'liberal',
    wants_kids: 'maybe',
    personality: {
      openness: 90,
      conscientiousness: 75,
      extraversion: 70,
      agreeableness: 85,
      neuroticism: 40,
      traits: ['Passionate', 'Creative', 'Warm'],
      interests: ['cooking', 'food', 'wine', 'travel', 'art'],
      values: ['passion', 'creativity', 'connection'],
      summary: 'Chef who believes food is love. Looking for someone to share culinary adventures and late-night conversations.',
    },
  },
  {
    email: 'maya.test@blindish.app',
    name: 'Maya',
    age: 25,
    gender: 'female',
    looking_for: ['male'],
    location_lat: 37.7749,
    location_lng: -122.4194,
    occupation: 'Journalist',
    drinking: 'socially',
    smoking: 'never',
    marijuana_use: 'rarely',
    religion: ['agnostic'],
    politics: 'liberal',
    wants_kids: 'yes',
    personality: {
      openness: 85,
      conscientiousness: 80,
      extraversion: 75,
      agreeableness: 80,
      neuroticism: 45,
      traits: ['Curious', 'Articulate', 'Empathetic'],
      interests: ['writing', 'journalism', 'books', 'podcasts', 'travel'],
      values: ['truth', 'empathy', 'growth'],
      summary: 'Journalist who loves telling stories that matter. Looking for someone to explore the world and share deep conversations.',
    },
  },
  {
    email: 'nathan.test@blindish.app',
    name: 'Nathan',
    age: 32,
    gender: 'male',
    looking_for: ['female'],
    location_lat: 37.7849,
    location_lng: -122.4094,
    occupation: 'Therapist',
    drinking: 'rarely',
    smoking: 'never',
    marijuana_use: 'never',
    religion: ['spiritual'],
    politics: 'liberal',
    wants_kids: 'yes',
    personality: {
      openness: 85,
      conscientiousness: 85,
      extraversion: 55,
      agreeableness: 95,
      neuroticism: 30,
      traits: ['Empathetic', 'Patient', 'Thoughtful'],
      interests: ['psychology', 'meditation', 'reading', 'hiking', 'podcasts'],
      values: ['compassion', 'growth', 'connection'],
      summary: 'Therapist passionate about helping others grow. Looking for someone emotionally intelligent who values deep connection.',
    },
  },
];

async function seedMoreProfiles() {
  console.log('\n🌱 Seeding additional test profiles...\n');

  for (const profile of newProfiles) {
    try {
      console.log(`Creating profile for ${profile.name}...`);

      // Check if already exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', profile.email)
        .maybeSingle();

      if (existing) {
        console.log(`  ⚠️  Profile already exists, skipping...`);
        continue;
      }

      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: profile.email,
        password: 'TestPassword123!',
        email_confirm: true,
        user_metadata: { name: profile.name },
      });

      if (authError) {
        console.error(`  ❌ Error creating auth user:`, authError.message);
        continue;
      }

      const userId = authUser.user.id;

      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        email: profile.email,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        looking_for: profile.looking_for,
        location_lat: profile.location_lat,
        location_lng: profile.location_lng,
        occupation: profile.occupation,
        drinking: profile.drinking,
        smoking: profile.smoking,
        marijuana_use: profile.marijuana_use,
        religion: profile.religion,
        politics: profile.politics,
        wants_kids: profile.wants_kids,
        onboarding_completed: true,
        onboarding_step: 7,
        consent_data_processing: true,
        consent_digital_footprint: true,
        last_active_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error(`  ❌ Error creating profile:`, profileError.message);
        continue;
      }

      // Create personality profile
      const { error: personalityError } = await supabase.from('personality_profiles').insert({
        user_id: userId,
        openness: profile.personality.openness,
        conscientiousness: profile.personality.conscientiousness,
        extraversion: profile.personality.extraversion,
        agreeableness: profile.personality.agreeableness,
        neuroticism: profile.personality.neuroticism,
        traits: profile.personality.traits,
        interests: profile.personality.interests,
        values: profile.personality.values,
        summary: profile.personality.summary,
        confidence_score: 85,
        data_sources: ['survey'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (personalityError) {
        console.error(`  ❌ Error creating personality:`, personalityError.message);
        continue;
      }

      // Add placeholder photo
      const { error: photoError } = await supabase.from('photos').insert({
        user_id: userId,
        storage_path: `test-photos/${userId}/1.jpg`,
        storage_url: `https://picsum.photos/seed/${userId}/800/1200`,
        position: 0,
        is_primary: true,
        blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH',
        created_at: new Date().toISOString(),
      });

      if (photoError) {
        console.error(`  ❌ Error creating photo:`, photoError.message);
        continue;
      }

      console.log(`  ✅ Created ${profile.name} (${profile.age}, ${profile.occupation})`);
    } catch (error) {
      console.error(`  ❌ Unexpected error for ${profile.name}:`, error);
    }
  }

  console.log('\n✨ Additional profiles created!\n');
  console.log('📊 Summary:');
  console.log(`  - ${newProfiles.length} new profiles`);
  console.log('  - Total should now be 13 profiles + yours');
  console.log('\n💡 Ready to test matching!\n');
}

seedMoreProfiles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
