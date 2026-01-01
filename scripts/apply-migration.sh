#!/bin/bash

# Apply height column migration via Supabase REST API

# Read environment variables
source .env

# Read the migration SQL
MIGRATION_SQL=$(cat supabase/migrations/20251224_fix_height_column.sql)

# Execute each statement
echo "Executing migration statements..."

# Statement 1: Drop column
curl -X POST "${EXPO_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "ALTER TABLE profiles DROP COLUMN IF EXISTS height_cm;"
  }'

echo ""
echo "Statement 1 complete"

# Statement 2: Add column
curl -X POST "${EXPO_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "ALTER TABLE profiles ADD COLUMN height_cm INTEGER;"
  }'

echo ""
echo "Statement 2 complete"

# Statement 3: Add constraint
curl -X POST "${EXPO_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "ALTER TABLE profiles ADD CONSTRAINT check_height_cm_range CHECK (height_cm IS NULL OR (height_cm >= 120 AND height_cm <= 250));"
  }'

echo ""
echo "Statement 3 complete"

# Statement 4: Add comment
curl -X POST "${EXPO_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"COMMENT ON COLUMN profiles.height_cm IS 'User height in centimeters (120-250cm range)';\"
  }"

echo ""
echo "Statement 4 complete"

# Statement 5: Create index
curl -X POST "${EXPO_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "CREATE INDEX IF NOT EXISTS idx_profiles_height_cm ON profiles(height_cm) WHERE height_cm IS NOT NULL;"
  }'

echo ""
echo "All statements complete!"
