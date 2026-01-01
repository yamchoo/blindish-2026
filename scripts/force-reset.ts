/**
 * Force Reset - Resets profile by user ID from logs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for admin access

const supabase = createClient(supabaseUrl, supabaseKey);

const forceReset = async () => {
  // User ID from logs: a6089c80-0d2d-4634-86f7-adaa16cf5f0b
  const userId = 'a6089c80-0d2d-4634-86f7-adaa16cf5f0b';

  console.log(`🔄 Force resetting profile: ${userId}\n`);

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: false,
        onboarding_step: 0,
        name: 'User', // Placeholder name (NOT NULL constraint)
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
      .eq('id', userId)
      .select();

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Profile reset successfully!');
    console.log('Updated:', data);
    console.log('\n✨ Reload the app to start onboarding fresh!\n');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

forceReset();
