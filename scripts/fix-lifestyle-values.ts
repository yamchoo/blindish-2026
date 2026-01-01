/**
 * Fix Lifestyle Values Migration
 * Updates existing profiles with incorrect marijuana/politics values to match compatibility algorithm
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

// Mapping functions (same as in lifestyleStore.ts)
function mapMarijuanaValue(value: string | null): string | null {
  if (!value) return null;
  const mapping: Record<string, string> = {
    'no': 'never',
    'sometimes': 'socially',
    'yes': 'regularly',
    'prefer_not_to_say': 'rarely',
  };
  return mapping[value] || value;
}

function mapPoliticsValue(value: string | null): string | null {
  if (!value) return null;
  const mapping: Record<string, string> = {
    'Liberal': 'liberal',
    'Moderate': 'moderate',
    'Conservative': 'conservative',
    'Not Political': 'apolitical',
    'Other': 'moderate',
    'Prefer not to say': 'moderate',
  };
  return mapping[value] || value.toLowerCase();
}

async function fixLifestyleValues() {
  console.log('\n🔧 Fixing lifestyle values in profiles...\n');

  // Get all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, marijuana_use, politics');

  if (error) {
    console.error('❌ Error fetching profiles:', error);
    return;
  }

  console.log(`Found ${profiles?.length || 0} profiles to check\n`);

  let updatedCount = 0;

  for (const profile of profiles || []) {
    const updates: any = {};
    let needsUpdate = false;

    // Check marijuana value
    if (profile.marijuana_use) {
      const mappedValue = mapMarijuanaValue(profile.marijuana_use);
      if (mappedValue !== profile.marijuana_use) {
        updates.marijuana_use = mappedValue;
        needsUpdate = true;
        console.log(`  📝 ${profile.email}: marijuana_use "${profile.marijuana_use}" → "${mappedValue}"`);
      }
    }

    // Check politics value
    if (profile.politics) {
      const mappedValue = mapPoliticsValue(profile.politics);
      if (mappedValue !== profile.politics) {
        updates.politics = mappedValue;
        needsUpdate = true;
        console.log(`  📝 ${profile.email}: politics "${profile.politics}" → "${mappedValue}"`);
      }
    }

    // Update if needed
    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (updateError) {
        console.error(`  ❌ Error updating ${profile.email}:`, updateError.message);
      } else {
        console.log(`  ✅ Updated ${profile.email}`);
        updatedCount++;
      }
    }
  }

  console.log(`\n✨ Migration complete! Updated ${updatedCount} profile(s)\n`);
}

fixLifestyleValues()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
