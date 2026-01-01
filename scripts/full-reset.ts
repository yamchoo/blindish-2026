/**
 * Full Reset Script
 * Resets onboarding state AND clears all likes/passes
 *
 * Usage: npx tsx scripts/full-reset.ts <email>
 * Example: npx tsx scripts/full-reset.ts its.amy.chou@gmail.com
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fullReset(email: string) {
  console.log(`\n🔄 Full reset for: ${email}\n`);

  try {
    // 1. Get user profile
    console.log('1. Looking up user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, onboarding_completed')
      .eq('email', email)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profile) {
      console.error('❌ Profile not found');
      return;
    }

    const userId = profile.id;
    console.log(`✅ Found user: ${userId}`);
    console.log(`   Current onboarding state: ${profile.onboarding_completed}`);

    // 2. Reset onboarding state
    console.log('\n2. Resetting onboarding state to false...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: false,
        onboarding_step: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) throw updateError;
    console.log('✅ Onboarding state reset to false');

    // 3. Clear all likes
    console.log('\n3. Clearing all likes...');
    const { data: deletedLikes, error: likesError } = await supabase
      .from('likes')
      .delete()
      .eq('liker_id', userId)
      .select();

    if (likesError) throw likesError;
    console.log(`✅ Cleared ${deletedLikes?.length || 0} like(s)`);

    // 4. Clear all passes (from passes table)
    console.log('\n4. Clearing all passes...');
    const { data: deletedPasses, error: passesError } = await supabase
      .from('passes')
      .delete()
      .eq('passer_id', userId)
      .select();

    if (passesError) throw passesError;
    console.log(`✅ Cleared ${deletedPasses?.length || 0} pass(es)`);

    // 5. Verify reset
    console.log('\n5. Verifying reset...');
    const { data: verifyProfile } = await supabase
      .from('profiles')
      .select('onboarding_completed, onboarding_step')
      .eq('id', userId)
      .single();

    const { count: likesCount } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('liker_id', userId);

    const { count: passesCount } = await supabase
      .from('passes')
      .select('*', { count: 'exact', head: true })
      .eq('passer_id', userId);

    if (verifyProfile) {
      console.log(`✅ Verified onboarding: ${verifyProfile.onboarding_completed} (step: ${verifyProfile.onboarding_step})`);
      console.log(`✅ Verified likes: ${likesCount || 0}`);
      console.log(`✅ Verified passes: ${passesCount || 0}`);
    }

    console.log('\n✨ Full reset complete! You can now test from the beginning.\n');
  } catch (error: any) {
    console.error('\n❌ Error during full reset:', error.message);
    process.exit(1);
  }
}

const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('\nUsage: npx tsx scripts/full-reset.ts <email>');
  console.log('Example: npx tsx scripts/full-reset.ts its.amy.chou@gmail.com\n');
  process.exit(1);
}

fullReset(email)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
