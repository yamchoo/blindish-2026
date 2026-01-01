/**
 * Find Amy's Account Script
 * Search for Amy's profile by email or name
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

async function findAmyAccount() {
  console.log('\n🔍 Searching for Amy\'s account...\n');

  try {
    // Search by email or name containing "amy"
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, name, onboarding_completed, onboarding_step, created_at')
      .or('email.ilike.%amy%,name.ilike.%amy%')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error searching profiles:', error);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('❌ No profiles found matching "amy"');
      console.log('\n💡 Try signing in to the app first to create your profile.\n');
      return;
    }

    console.log(`Found ${profiles.length} profile(s):\n`);

    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.name || 'No name'} (${profile.email})`);
      console.log(`   ID: ${profile.id}`);
      console.log(`   Onboarding: ${profile.onboarding_completed ? 'Complete' : 'Incomplete'} (step ${profile.onboarding_step})`);
      console.log(`   Created: ${new Date(profile.created_at).toLocaleString()}`);
      console.log();
    });

    // If there's exactly one, offer to reset it
    if (profiles.length === 1) {
      console.log(`\n💡 To reset this account, run:`);
      console.log(`   npm run reset-user ${profiles[0].email}\n`);
    } else {
      console.log(`\n💡 To reset any of these accounts, run:`);
      console.log(`   npm run reset-user <email>\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findAmyAccount();
