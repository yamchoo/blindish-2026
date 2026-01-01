/**
 * Force Reset Amy's Account
 * Directly reset the profile using service role key
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceResetAmy() {
  console.log('\n🔄 Force resetting Amy\'s account...\n');

  const userId = 'a6089c80-0d2d-4634-86f7-adaa16cf5f0b';

  try {
    // 1. Reset profile to initial state
    console.log('1. Resetting profile to initial state...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: false,
        onboarding_step: 0,
        name: 'Amy',  // Keep name to satisfy NOT NULL constraint
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
        communication_style: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Error updating profile:', updateError);
      return;
    }
    console.log('✅ Profile reset to initial state');

    // 2. Delete personality profiles
    console.log('\n2. Deleting personality profiles...');
    const { error: personalityError } = await supabase
      .from('personality_profiles')
      .delete()
      .eq('user_id', userId);

    if (personalityError) {
      console.warn('⚠️  Personality profile deletion failed:', personalityError.message);
    } else {
      console.log('✅ Personality profiles cleared');
    }

    // 3. Delete photos
    console.log('\n3. Deleting photos...');
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

    // 4. Delete Spotify data
    console.log('\n4. Deleting Spotify data...');
    const { error: spotifyError } = await supabase
      .from('spotify_data')
      .delete()
      .eq('user_id', userId);

    if (spotifyError) {
      console.warn('⚠️  Spotify data deletion failed:', spotifyError.message);
    } else {
      console.log('✅ Spotify data cleared');
    }

    // 5. Delete YouTube data
    console.log('\n5. Deleting YouTube data...');
    const { error: youtubeError } = await supabase
      .from('youtube_data')
      .delete()
      .eq('user_id', userId);

    if (youtubeError) {
      console.warn('⚠️  YouTube data deletion failed:', youtubeError.message);
    } else {
      console.log('✅ YouTube data cleared');
    }

    // 6. Delete likes/swipes
    console.log('\n6. Deleting likes and swipes...');
    const { error: likesError } = await supabase
      .from('likes')
      .delete()
      .or(`liker_id.eq.${userId},liked_id.eq.${userId}`);

    if (likesError) {
      console.warn('⚠️  Likes deletion failed:', likesError.message);
    } else {
      console.log('✅ Likes cleared');
    }

    // 7. Verify reset
    console.log('\n7. Verifying reset...');
    const { data: verifyProfile } = await supabase
      .from('profiles')
      .select('onboarding_completed, onboarding_step, name')
      .eq('id', userId)
      .single();

    if (verifyProfile) {
      console.log(`✅ Verified: onboarding_completed=${verifyProfile.onboarding_completed}, step=${verifyProfile.onboarding_step}, name=${verifyProfile.name}`);
    }

    console.log('\n✨ Amy\'s account has been reset! You can now test the onboarding flow.\n');

  } catch (error) {
    console.error('\n❌ Error resetting account:', error);
  }
}

forceResetAmy();
