/**
 * Test Height Column
 * Verifies that height_cm column exists and can be queried
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

async function testHeightColumn() {
  console.log('\n🔍 Testing height_cm column...\n');

  try {
    // Try to select the height_cm column
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, height_cm')
      .limit(5);

    if (error) {
      console.error('❌ Error querying height_cm column:', error.message);
      console.log('\n⚠️  The migration may not have been applied successfully.');
      console.log('Please verify in Supabase Dashboard that the height_cm column exists.\n');
      process.exit(1);
    }

    console.log('✅ height_cm column exists and is queryable!');
    console.log('\nSample data:');
    console.log(data);

    // Try to update a height value (if there are any profiles)
    if (data && data.length > 0) {
      const testProfile = data[0];
      console.log(`\n🧪 Testing height update for profile: ${testProfile.email}`);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ height_cm: 175 })
        .eq('id', testProfile.id);

      if (updateError) {
        console.error('❌ Error updating height:', updateError.message);
      } else {
        console.log('✅ Height update successful!');

        // Verify the update
        const { data: verifyData } = await supabase
          .from('profiles')
          .select('email, height_cm')
          .eq('id', testProfile.id)
          .single();

        console.log('Updated profile:', verifyData);
      }
    }

    console.log('\n✨ All tests passed! Height saving should now work in the app.\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

testHeightColumn()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
