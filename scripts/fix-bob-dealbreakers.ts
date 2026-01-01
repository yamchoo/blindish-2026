import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function fixBobDealbreakers() {
  // Get current user (Amy) by ID from logs
  const { data: amy } = await supabase
    .from('profiles')
    .select('id, full_name, email, kids, drinking, smoking')
    .eq('id', 'a6089c80-0d2d-4634-86f7-adaa16cf5f0b')
    .single();

  console.log('Current user (Amy):', JSON.stringify(amy, null, 2));

  // Get Bob's profile by ID from logs
  const { data: bob } = await supabase
    .from('profiles')
    .select('id, full_name, email, kids, drinking, smoking')
    .eq('id', '5883039c-b8c1-4a0e-bdad-06b7cc0c96f9')
    .single();

  console.log('\nBob:', JSON.stringify(bob, null, 2));

  // Update Bob to match Amy's preferences
  if (amy && bob) {
    const { error } = await supabase
      .from('profiles')
      .update({
        kids: amy.kids || 'want_someday',
        drinking: amy.drinking || 'socially',
        smoking: amy.smoking || 'no'
      })
      .eq('id', bob.id);

    if (error) {
      console.error('Error updating Bob:', error);
    } else {
      console.log('\n✅ Updated Bob to match Amy\'s preferences');
      console.log('Bob should now appear as a match!');
    }
  }
}

fixBobDealbreakers();
