/**
 * Update Test User Photos
 * Replaces Lorem Picsum URLs with realistic portrait photos
 *
 * Usage: npx tsx scripts/update-test-photos.ts
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

// High-quality portrait photos from Unsplash
// These are real portrait photos that look like dating app profiles
const portraitPhotos: Record<string, string> = {
  // Male portraits
  'bob.test@blindish.app': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop',
  'ethan.test@blindish.app': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1200&fit=crop',
  'henry.test@blindish.app': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1200&fit=crop',
  'jake.test@blindish.app': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=1200&fit=crop',
  'leo.test@blindish.app': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=1200&fit=crop',
  'nathan.test@blindish.app': 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=800&h=1200&fit=crop',
  'charlie.test@blindish.app': 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=800&h=1200&fit=crop',

  // Female portraits
  'alice.test@blindish.app': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1200&fit=crop',
  'diana.test@blindish.app': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop',
  'fiona.test@blindish.app': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1200&fit=crop',
  'grace.test@blindish.app': 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&h=1200&fit=crop',
  'ivy.test@blindish.app': 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=1200&fit=crop',
  'kate.test@blindish.app': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1200&fit=crop',
  'maya.test@blindish.app': 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&h=1200&fit=crop',
};

async function updateTestPhotos() {
  console.log('\n📸 Updating test user photos...\n');

  try {
    // Get all test users
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .like('email', '%test@blindish.app%');

    if (profileError) {
      throw new Error(`Failed to fetch profiles: ${profileError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      console.log('⚠️  No test profiles found.');
      return;
    }

    console.log(`✅ Found ${profiles.length} test profiles\n`);

    // Update photos for each user
    for (const profile of profiles) {
      const newPhotoUrl = portraitPhotos[profile.email];

      if (!newPhotoUrl) {
        console.log(`⚠️  No portrait photo defined for ${profile.name} (${profile.email})`);
        continue;
      }

      console.log(`📝 Updating photo for ${profile.name} (${profile.email})...`);

      // Update the photo URL
      const { error: updateError } = await supabase
        .from('photos')
        .update({
          storage_url: newPhotoUrl,
        })
        .eq('user_id', profile.id)
        .eq('is_primary', true);

      if (updateError) {
        console.error(`   ❌ Failed to update photo for ${profile.name}:`, updateError.message);
      } else {
        console.log(`   ✅ Updated to portrait photo`);
      }
    }

    console.log('\n✨ Photo update complete!\n');

  } catch (error) {
    console.error('\n❌ Error updating photos:', error);
    process.exit(1);
  }
}

// Run the update function
updateTestPhotos();
