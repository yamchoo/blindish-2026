/**
 * Delete a specific test profile by email
 * Usage: npx tsx scripts/delete-test-profile.ts <email>
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

async function deleteProfile(email: string) {
  console.log(`\n🗑️  Deleting profile: ${email}\n`);

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('email', email)
    .maybeSingle();

  if (!profile) {
    console.log('❌ Profile not found');
    return;
  }

  console.log(`Found: ${profile.name} (${profile.id})`);

  // Delete auth user (cascade will delete profile, personality_profiles, photos)
  const { error } = await supabase.auth.admin.deleteUser(profile.id);

  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Profile deleted successfully\n');
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: npx tsx scripts/delete-test-profile.ts <email>');
  process.exit(1);
}

deleteProfile(email);
