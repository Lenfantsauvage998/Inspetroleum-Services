#!/bin/bash
# Deploy Supabase Edge Functions and re-apply verify_jwt=false.
# Run from the project root: bash deploy-functions.sh
# Requires: SUPABASE_ACCESS_TOKEN env var (or set it below).

set -e

PROJECT_REF="eyworxapwwepapntxqom"
ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-sbp_a7989101dfbad44bdbad4c08f030dc1a1e6dfe94}"

echo "Deploying edge functions..."
SUPABASE_ACCESS_TOKEN=$ACCESS_TOKEN npx supabase functions deploy create-order --project-ref $PROJECT_REF
SUPABASE_ACCESS_TOKEN=$ACCESS_TOKEN npx supabase functions deploy initiate-payment --project-ref $PROJECT_REF
SUPABASE_ACCESS_TOKEN=$ACCESS_TOKEN npx supabase functions deploy wompi-webhook --project-ref $PROJECT_REF
SUPABASE_ACCESS_TOKEN=$ACCESS_TOKEN npx supabase functions deploy check-payment --project-ref $PROJECT_REF

echo "Disabling gateway JWT verification (required after every deploy)..."
for fn in create-order initiate-payment wompi-webhook check-payment; do
  result=$(curl -s -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/functions/$fn" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"verify_jwt": false}')
  version=$(echo $result | python -c "import sys,json;print(json.load(sys.stdin).get('version','?'))" 2>/dev/null || echo "?")
  echo "  $fn -> version $version, verify_jwt: false"
done

echo "Done."
