/**
 * Clear Likes Script
 * Removes all likes for a user so they can see matches again
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearLikes(email: string) {
  console.log(`\n🔄 Clearing likes for: ${email}\n`);

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (profileError) {
    console.error('❌ Error fetching profile:', profileError);
    return;
  }

  if (!profile) {
    console.error('❌ Profile not found');
    return;
  }

  console.log(`Found user: ${profile.id}`);

  // Delete all likes by this user
  const { error: deleteError } = await supabase
    .from('likes')
    .delete()
    .eq('liker_id', profile.id);

  if (deleteError) {
    console.error('❌ Error deleting likes:', deleteError);
    return;
  }

  console.log('✅ All likes cleared!\n');
}

const email = process.argv[2];

if (!email) {
  console.error('Usage: npx tsx scripts/clear-likes.ts <email>');
  process.exit(1);
}

clearLikes(email)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
