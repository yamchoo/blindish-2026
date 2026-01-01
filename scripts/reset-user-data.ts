/**
 * Reset User Data Script
 * Clears all user data for testing purposes
 *
 * Usage: npx ts-node scripts/reset-user-data.ts <email>
 * Example: npx ts-node scripts/reset-user-data.ts its.amy.chou@gmail.com
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create fetch with timeout for better handling on bad networks
const fetchWithTimeout = (timeoutMs: number = 8000) => {
  return async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeoutMs}ms`);
      }
      throw error;
    }
  };
};

// Create standalone Supabase client for Node.js with timeout
const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: fetchWithTimeout(8000),
    headers: {
      'Connection': 'close',
    },
  },
});

const resetUserData = async (email: string) => {
  console.log(`\n🔄 Resetting all data for: ${email}\n`);

  try {
    // 1. Get user ID (with retry on timeout)
    console.log('1. Looking up user profile...');
    let profile = null;
    let retries = 3;

    while (retries > 0 && !profile) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, onboarding_completed, onboarding_step')
          .eq('email', email)
          .maybeSingle();

        if (error) throw error;
        profile = data;
        break;
      } catch (error: any) {
        retries--;
        if (retries > 0) {
          console.log(`⚠️  Query timed out, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw error;
        }
      }
    }

    if (!profile) {
      console.log('ℹ️  No profile found - user will start fresh on next sign-in');
      return;
    }

    const userId = profile.id;
    console.log(`✅ Found user: ${userId}`);
    console.log(`   Current state: onboarding_completed=${profile.onboarding_completed}, step=${profile.onboarding_step}`);

    // 2. Reset profile to initial state FIRST (most important)
    console.log('\n2. Resetting profile to initial state...');

    let updateSuccess = false;
    retries = 3;

    while (retries > 0 && !updateSuccess) {
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            onboarding_completed: false,
            onboarding_step: 0,
            name: null,
            age: 18,
            date_of_birth: null,
            gender: 'other',
            looking_for: [],
            occupation: null,
            wants_kids: null,
            drinking: null,
            smoking: null,
            marijuana_use: null,
            religion: [],
            politics: null,
            spotify_connected: false,
            youtube_connected: false,
            consent_data_processing: false,
            consent_digital_footprint: false,
            consent_timestamp: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) throw updateError;
        updateSuccess = true;
        console.log('✅ Profile reset to initial state');
        break;
      } catch (error: any) {
        retries--;
        if (retries > 0) {
          console.log(`⚠️  Update timed out, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.error('❌ Profile reset failed after multiple attempts:', error.message);
          console.log('⚠️  CRITICAL: Your profile was not reset. Sign-in may fail.');
          return;
        }
      }
    }

    // 3. Delete personality profiles (non-critical)
    console.log('\n3. Deleting personality profiles...');
    try {
      const { error: personalityError } = await supabase
        .from('personality_profiles')
        .delete()
        .eq('user_id', userId);

      if (personalityError) {
        console.warn('⚠️  Personality profile deletion failed:', personalityError.message);
      } else {
        console.log('✅ Personality profiles cleared');
      }
    } catch (error) {
      console.warn('⚠️  Personality profile deletion timed out (non-critical)');
    }

    // 4. Delete photos (non-critical)
    console.log('\n4. Deleting photos...');
    try {
      const { data: photos } = await supabase
        .from('photos')
        .select('storage_path')
        .eq('user_id', userId);

      if (photos && photos.length > 0) {
        // Delete from storage
        const paths = photos.map(p => p.storage_path);
        await supabase.storage.from('photos').remove(paths);
        console.log(`✅ Deleted ${paths.length} photo(s) from storage`);

        // Delete from database
        const { error: photosError } = await supabase
          .from('photos')
          .delete()
          .eq('user_id', userId);

        if (photosError) {
          console.warn('⚠️  Photo deletion failed:', photosError.message);
        } else {
          console.log('✅ Photos cleared from database');
        }
      } else {
        console.log('ℹ️  No photos to delete');
      }
    } catch (error) {
      console.warn('⚠️  Photo deletion timed out (non-critical)');
    }

    // 5. Verify reset
    console.log('\n5. Verifying reset...');
    try {
      const { data: verifyProfile } = await supabase
        .from('profiles')
        .select('onboarding_completed, onboarding_step')
        .eq('id', userId)
        .single();

      if (verifyProfile) {
        console.log(`✅ Verified: onboarding_completed=${verifyProfile.onboarding_completed}, step=${verifyProfile.onboarding_step}`);
      }
    } catch (error) {
      console.log('⚠️  Verification timed out (but reset should be successful)');
    }

    console.log('\n✨ User data reset complete! You can now test the onboarding flow.\n');
  } catch (error) {
    console.error('\n❌ Error resetting user data:', error);
  }
};

// Get email from command line args
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('\nUsage: npx ts-node scripts/reset-user-data.ts <email>');
  console.log('Example: npx ts-node scripts/reset-user-data.ts its.amy.chou@gmail.com\n');
  process.exit(1);
}

resetUserData(email);
