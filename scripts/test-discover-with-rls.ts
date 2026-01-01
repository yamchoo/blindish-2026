import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

// Create admin client to get auth token
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function testQueryWithRLS() {
  // Get Amy's auth user
  const { data: users } = await adminClient.auth.admin.listUsers();
  const amy = users.users.find(u => u.email === 'its.amy.chou@gmail.com');

  if (!amy) {
    console.error('Amy user not found');
    return;
  }

  console.log('Found Amy:', amy.id);

  // Create session for Amy
  const { data: sessionData, error: sessionError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: amy.email!,
  });

  if (sessionError || !sessionData) {
    console.error('Error generating session:', sessionError);
    return;
  }

  // Create client with anon key and set Amy's session
  const userClient = createClient(supabaseUrl, supabaseAnonKey);

  // Sign in as Amy
  const { data: signInData, error: signInError } = await userClient.auth.signInWithPassword({
    email: 'its.amy.chou@gmail.com',
    password: 'TestPassword123!', // Your test password
  });

  if (signInError) {
    console.error('Sign in error:', signInError);
    // Try admin approach
    console.log('Trying to create session directly...');
    const { data, error } = await adminClient.auth.admin.createUser({
      email: amy.email!,
      email_confirm: true,
    });
    console.log('Admin create result:', { data, error });
    return;
  }

  console.log('Signed in successfully as Amy');

  // Now test the discover query with RLS
  let query = userClient
    .from('profiles')
    .select('*, personality_profiles(*), photos(*)')
    .eq('onboarding_completed', true)
    .not('id', 'in', `(${amy.id})`);

  query = query.contains('looking_for', ['female']);
  query = query.in('gender', ['male']);

  console.log('\nExecuting query with RLS...');
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

  await userClient.auth.signOut();
}

testQueryWithRLS().catch(console.error);
