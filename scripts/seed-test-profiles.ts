/**
 * Seed Test Profiles Script
 * Creates dummy user profiles with personality data for testing matching system
 *
 * Usage: npx tsx scripts/seed-test-profiles.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
// Try Secret API key first, fallback to service role key
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Please set either SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log(`🔑 Using ${process.env.SUPABASE_SECRET_KEY ? 'Secret API key' : 'Service Role key'}`);

const supabase = createClient(supabaseUrl, supabaseKey);

// Test profiles data
const testProfiles = [
  {
    email: 'alice.test@blindish.app',
    name: 'Alice',
    age: 28,
    gender: 'female',
    looking_for: ['male'],
    location_lat: 37.7749, // San Francisco
    location_lng: -122.4194,
    occupation: 'Software Engineer',
    drinking: 'socially',
    smoking: 'never',
    marijuana_use: 'rarely',
    religion: ['spiritual'],
    politics: 'liberal',
    wants_kids: 'maybe',
    personality: {
      openness: 85,
      conscientiousness: 70,
      extraversion: 60,
      agreeableness: 80,
      neuroticism: 40,
      traits: ['Creative', 'Thoughtful', 'Adventurous'],
      interests: ['travel', 'music', 'technology', 'reading', 'hiking'],
      values: ['authenticity', 'growth', 'kindness'],
      summary: 'Creative and thoughtful software engineer who loves exploring new places and ideas. Values deep conversations and genuine connections.',
    },
  },
  {
    email: 'bob.test@blindish.app',
    name: 'Bob',
    age: 30,
    gender: 'male',
    looking_for: ['female'],
    location_lat: 37.7849,
    location_lng: -122.4094,
    occupation: 'Product Designer',
    drinking: 'regularly',
    smoking: 'never',
    marijuana_use: 'socially',
    religion: ['atheist'],
    politics: 'moderate',
    wants_kids: 'no',
    personality: {
      openness: 75,
      conscientiousness: 65,
      extraversion: 70,
      agreeableness: 75,
      neuroticism: 35,
      traits: ['Empathetic', 'Social', 'Artistic'],
      interests: ['design', 'music', 'coffee', 'photography', 'cooking'],
      values: ['creativity', 'empathy', 'balance'],
      summary: 'Social and empathetic designer who finds inspiration in everyday moments. Loves hosting dinner parties and exploring new coffee shops.',
    },
  },
  {
    email: 'charlie.test@blindish.app',
    name: 'Charlie',
    age: 26,
    gender: 'non-binary',
    looking_for: ['male', 'female', 'non-binary'],
    location_lat: 37.7649,
    location_lng: -122.4294,
    occupation: 'Writer',
    drinking: 'rarely',
    smoking: 'never',
    marijuana_use: 'never',
    religion: ['buddhist'],
    politics: 'very_liberal',
    wants_kids: 'yes',
    personality: {
      openness: 90,
      conscientiousness: 75,
      extraversion: 45,
      agreeableness: 85,
      neuroticism: 50,
      traits: ['Introspective', 'Compassionate', 'Curious'],
      interests: ['writing', 'meditation', 'nature', 'philosophy', 'yoga'],
      values: ['mindfulness', 'compassion', 'authenticity'],
      summary: 'Introspective writer and mindfulness practitioner. Finds peace in nature and meaningful conversations about life and philosophy.',
    },
  },
  {
    email: 'diana.test@blindish.app',
    name: 'Diana',
    age: 32,
    gender: 'female',
    looking_for: ['male', 'female'],
    location_lat: 37.7549,
    location_lng: -122.4394,
    occupation: 'Data Scientist',
    drinking: 'socially',
    smoking: 'never',
    marijuana_use: 'never',
    religion: ['christian'],
    politics: 'conservative',
    wants_kids: 'yes',
    personality: {
      openness: 70,
      conscientiousness: 90,
      extraversion: 55,
      agreeableness: 70,
      neuroticism: 30,
      traits: ['Analytical', 'Reliable', 'Ambitious'],
      interests: ['data science', 'fitness', 'volunteering', 'travel', 'reading'],
      values: ['family', 'integrity', 'achievement'],
      summary: 'Analytical and driven data scientist with a passion for making a positive impact. Values family and is looking for someone to build a life with.',
    },
  },
  {
    email: 'ethan.test@blindish.app',
    name: 'Ethan',
    age: 29,
    gender: 'male',
    looking_for: ['female'],
    location_lat: 37.7949,
    location_lng: -122.3994,
    occupation: 'Teacher',
    drinking: 'socially',
    smoking: 'never',
    marijuana_use: 'rarely',
    religion: ['agnostic'],
    politics: 'liberal',
    wants_kids: 'yes',
    personality: {
      openness: 80,
      conscientiousness: 80,
      extraversion: 75,
      agreeableness: 90,
      neuroticism: 25,
      traits: ['Patient', 'Warm', 'Optimistic'],
      interests: ['education', 'sports', 'music', 'board games', 'cooking'],
      values: ['kindness', 'growth', 'community'],
      summary: 'Patient and warm-hearted teacher who loves working with kids. Looking for a partner who shares his optimism and desire to make a difference.',
    },
  },
  {
    email: 'fiona.test@blindish.app',
    name: 'Fiona',
    age: 27,
    gender: 'female',
    looking_for: ['male'],
    location_lat: 37.8049,
    location_lng: -122.4094,
    occupation: 'Marketing Manager',
    drinking: 'socially',
    smoking: 'never',
    marijuana_use: 'socially',
    religion: ['spiritual'],
    politics: 'liberal',
    wants_kids: 'maybe',
    personality: {
      openness: 85,
      conscientiousness: 65,
      extraversion: 85,
      agreeableness: 75,
      neuroticism: 45,
      traits: ['Outgoing', 'Creative', 'Spontaneous'],
      interests: ['travel', 'music festivals', 'yoga', 'social media', 'fashion'],
      values: ['fun', 'authenticity', 'adventure'],
      summary: 'Outgoing marketing manager who lives for spontaneous adventures and music festivals. Looking for someone to explore the world with.',
    },
  },
];

async function seedTestProfiles() {
  console.log('\n🌱 Seeding test profiles...\n');

  for (const profile of testProfiles) {
    try {
      console.log(`Creating profile for ${profile.name}...`);

      // 1. Check if profile already exists (by email)
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', profile.email)
        .maybeSingle();

      if (existing) {
        console.log(`  ⚠️  Profile already exists (${profile.email}), skipping...`);
        continue;
      }

      // 2. Create auth user first (required for foreign key constraint)
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: profile.email,
        password: 'TestPassword123!', // Default password for test accounts
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: profile.name,
        },
      });

      if (authError) {
        console.error(`  ❌ Error creating auth user:`, authError.message);
        continue;
      }

      // Use the auth user's ID for the profile
      const userId = authUser.user.id;

      console.log(`  ✅ Created auth user: ${userId}`);

      // 3. Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId, // Use auth user ID
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

      // 4. Create personality profile
      const { error: personalityError } = await supabase
        .from('personality_profiles')
        .insert({
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
          data_sources: ['survey'], // Simulated data
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (personalityError) {
        console.error(`  ❌ Error creating personality profile:`, personalityError.message);
        continue;
      }

      // 5. Add a placeholder photo
      const { error: photoError } = await supabase
        .from('photos')
        .insert({
          user_id: userId,
          storage_path: `test-photos/${userId}/1.jpg`,
          storage_url: `https://picsum.photos/seed/${userId}/800/1200`, // Random placeholder
          position: 0,
          is_primary: true,
          blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH', // Generic blurhash
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

  console.log('\n✨ Test profile seeding complete!\n');
  console.log('📊 Summary:');
  console.log(`  - ${testProfiles.length} test profiles created`);
  console.log('  - All profiles have personality data for matching');
  console.log('  - All profiles have placeholder photos');
  console.log('\n💡 You can now test the matching system!\n');
}

// Run the seeding
seedTestProfiles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
