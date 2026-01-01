import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  // Amy's user ID from the logs
  const amyId = 'ef8e107e-42af-48a2-93c0-a7670d31ed95';

  // Get Amy's profile
  const { data: amy } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', amyId)
    .single();

  console.log('Amy profile:', {
    name: amy?.name,
    gender: amy?.gender,
    looking_for: amy?.looking_for,
    age: amy?.age,
    onboarding_completed: amy?.onboarding_completed
  });

  // Test the query exactly as the app would build it
  let query = supabase
    .from('profiles')
    .select('*, personality_profiles(*), photos(*)')
    .eq('onboarding_completed', true)
    .not('id', 'in', `(${amyId})`);

  if (amy?.gender) {
    console.log('\nFiltering: looking_for must contain', amy.gender);
    query = query.contains('looking_for', [amy.gender]);
  }

  if (amy?.looking_for && amy.looking_for.length > 0) {
    console.log('Filtering: gender must be IN', amy.looking_for);
    query = query.in('gender', amy.looking_for);
  }

  const { data: matches, error } = await query;

  if (error) {
    console.error('\nError:', error);
  } else {
    console.log(`\nFound ${matches?.length || 0} potential matches:`);
    matches?.forEach(m => {
      const hasPersonality = m.personality_profiles ? 'yes' : 'no';
      const photoCount = m.photos?.length || 0;
      console.log(`- ${m.name}: gender=${m.gender}, looking_for=${JSON.stringify(m.looking_for)}, has_personality=${hasPersonality}, photos=${photoCount}`);
    });
  }
}

testQuery().catch(console.error);
