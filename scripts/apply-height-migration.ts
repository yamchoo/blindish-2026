/**
 * Apply Height Column Migration
 * Fixes the broken height_cm column migration
 *
 * Usage: npx tsx scripts/apply-height-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('\n🔧 Applying height column migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251224_fix_height_column.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Migration SQL:');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));
    console.log('\nExecuting migration...');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL,
    });

    if (error) {
      // Try direct execution if RPC fails
      console.log('\n⚠️  RPC failed, trying direct SQL execution...\n');

      // Split into individual statements and execute
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error: execError } = await supabase.rpc('exec_sql', { sql: statement });

        if (execError) {
          console.error(`❌ Error: ${execError.message}`);
          // Continue with other statements
        } else {
          console.log('✅ Success');
        }
      }
    } else {
      console.log('✅ Migration applied successfully');
    }

    // Verify the column exists
    console.log('\n🔍 Verifying height_cm column...');
    const { data: columnData, error: columnError } = await supabase
      .from('profiles')
      .select('height_cm')
      .limit(1);

    if (columnError) {
      console.error('❌ Verification failed:', columnError.message);
      console.log('\n⚠️  The column may need to be created manually via Supabase Dashboard.');
      console.log('Go to: https://supabase.com/dashboard/project/asscyyhapitrouffejqx/editor');
      console.log('\nRun this SQL in the SQL Editor:');
      console.log('─'.repeat(60));
      console.log(migrationSQL);
      console.log('─'.repeat(60));
      return;
    }

    console.log('✅ height_cm column exists and is accessible!');
    console.log('\n✨ Migration complete! Height saving should now work.\n');

  } catch (error: any) {
    console.error('\n❌ Error applying migration:', error.message);
    console.log('\n📝 Manual Steps:');
    console.log('1. Go to Supabase Dashboard SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/asscyyhapitrouffejqx/editor');
    console.log('2. Run the SQL from: supabase/migrations/20251224_fix_height_column.sql');
    process.exit(1);
  }
}

applyMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
