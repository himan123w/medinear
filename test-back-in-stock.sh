#!/bin/bash

# Back-In-Stock Notification Feature - Testing Guide
# This script helps test all back-in-stock notification endpoints

echo "🔔 Back-In-Stock Notification Testing Suite"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:5001/api"
TEST_RESULTS=()
PASSED=0
FAILED=0

# Helper function to make API calls
make_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  local token=$4

  echo -e "${BLUE}→ $method $endpoint${NC}"

  if [ -n "$token" ]; then
    curl -s -X $method "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "$data"
  else
    curl -s -X $method "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data"
  fi
}

# Helper to validate response
validate_response() {
  local response=$1
  local test_name=$2
  local expected_field=$3

  if echo "$response" | grep -q "\"success\":true"; then
    if [ -z "$expected_field" ] || echo "$response" | grep -q "$expected_field"; then
      echo -e "${GREEN}✓ PASS${NC}: $test_name"
      PASSED=$((PASSED + 1))
      return 0
    fi
  fi

  echo -e "${RED}✗ FAIL${NC}: $test_name"
  echo "Response: $response"
  FAILED=$((FAILED + 1))
  return 1
}

echo -e "${YELLOW}Prerequisites:${NC}"
echo "1. Server running on port 5001"
echo "2. MongoDB connected"
echo "3. Medicine & Pharmacy data exists"
echo ""

# Test IDs (Update these with real IDs from your database)
MEDICINE_ID="642f1234567890abcdef1234"  # Replace with real ID
PHARMACY_ID="642f5678567890abcdef5678"  # Replace with real ID
TEST_EMAIL="test-notification-$(date +%s)@medinear.com"
SUBSCRIPTION_ID=""
JWT_TOKEN=""  # Replace with real token for auth tests

echo -e "${YELLOW}Step 1: Check API Health${NC}"
health_response=$(curl -s "$BASE_URL/health/services")
if echo "$health_response" | grep -q "ok"; then
  echo -e "${GREEN}✓${NC} API is healthy"
else
  echo -e "${RED}✗${NC} API health check failed"
  exit 1
fi
echo ""

echo -e "${YELLOW}Step 2: Test Anonymous Subscription${NC}"
subscribe_request="{
  \"medicineId\": \"$MEDICINE_ID\",
  \"medicineName\": \"Test Medicine\",
  \"dosage\": \"500mg\",
  \"pharmacyId\": \"$PHARMACY_ID\",
  \"email\": \"$TEST_EMAIL\",
  \"maxPriceLimit\": 200,
  \"notificationMethod\": \"email\"
}"

response=$(make_request "POST" "/stock-notifications/subscribe" "$subscribe_request")
validate_response "$response" "Subscribe to back-in-stock notification" "Subscribed"

# Extract subscription ID from response
SUBSCRIPTION_ID=$(echo "$response" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$SUBSCRIPTION_ID" ]; then
  echo "Subscription ID: $SUBSCRIPTION_ID"
fi
echo ""

echo -e "${YELLOW}Step 3: Test Get Subscriptions by Email${NC}"
response=$(make_request "GET" "/stock-notifications/my?email=$TEST_EMAIL" "")
validate_response "$response" "Fetch subscriptions by email" "subscriptions"
echo ""

echo -e "${YELLOW}Step 4: Test Check Subscription Status${NC}"
status_request="{}"
response=$(curl -s -X GET "$BASE_URL/stock-notifications/status?medicineId=$MEDICINE_ID&pharmacyId=$PHARMACY_ID&email=$TEST_EMAIL" \
  -H "Content-Type: application/json")
validate_response "$response" "Check subscription status" "isSubscribed"
echo ""

echo -e "${YELLOW}Step 5: Test Duplicate Subscription Prevention${NC}"
response=$(make_request "POST" "/stock-notifications/subscribe" "$subscribe_request")
if echo "$response" | grep -q "Already subscribed"; then
  echo -e "${GREEN}✓ PASS${NC}: Duplicate prevention works"
  PASSED=$((PASSED + 1))
else
  echo -e "${YELLOW}⚠ WARNING${NC}: Duplicate check may not be working"
fi
echo ""

echo -e "${YELLOW}Step 6: Test Cancel Subscription${NC}"
if [ -n "$SUBSCRIPTION_ID" ]; then
  response=$(make_request "DELETE" "/stock-notifications/$SUBSCRIPTION_ID/unsubscribe" "")
  validate_response "$response" "Cancel subscription" "Unsubscribed"
else
  echo -e "${RED}⚠ SKIP${NC}: No subscription ID to cancel"
fi
echo ""

echo -e "${YELLOW}Step 7: Test Price Limit Validation${NC}"
price_request="{
  \"medicineId\": \"$MEDICINE_ID\",
  \"medicineName\": \"Test Medicine\",
  \"dosage\": \"500mg\",
  \"pharmacyId\": \"$PHARMACY_ID\",
  \"email\": \"test-price-$(date +%s)@medinear.com\",
  \"maxPriceLimit\": 50,
  \"notificationMethod\": \"email\"
}"
response=$(make_request "POST" "/stock-notifications/subscribe" "$price_request")
validate_response "$response" "Subscribe with price limit" "maxPriceLimit"
echo ""

if [ -n "$JWT_TOKEN" ]; then
  echo -e "${YELLOW}Step 8: Test Authenticated User Subscription${NC}"
  auth_request="{
    \"medicineId\": \"$MEDICINE_ID\",
    \"medicineName\": \"Test Medicine\",
    \"dosage\": \"500mg\",
    \"pharmacyId\": \"$PHARMACY_ID\",
    \"notificationMethod\": \"email\"
  }"
  response=$(make_request "POST" "/stock-notifications/subscribe" "$auth_request" "$JWT_TOKEN")
  validate_response "$response" "Authenticated user subscription" "Subscribed"
  echo ""

  echo -e "${YELLOW}Step 9: Test Get User Statistics${NC}"
  response=$(make_request "GET" "/stock-notifications/stats" "" "$JWT_TOKEN")
  validate_response "$response" "Get notification statistics" "stats"
  echo ""

  echo -e "${YELLOW}Step 10: Test Get My Subscriptions (Auth)${NC}"
  response=$(make_request "GET" "/stock-notifications/my" "" "$JWT_TOKEN")
  validate_response "$response" "Get authenticated user subscriptions" "subscriptions"
  echo ""
else
  echo -e "${YELLOW}⚠ SKIP${NC}: Authentication tests (JWT_TOKEN not set)"
  echo "To test authenticated endpoints, set JWT_TOKEN in this script"
  echo ""
fi

echo -e "${YELLOW}Step 11: Test Invalid Inputs${NC}"
invalid_request="{
  \"medicineId\": \"invalid-id\",
  \"medicineName\": \"Test\",
  \"pharmacyId\": \"invalid-id\",
  \"email\": \"not-an-email\"
}"
response=$(make_request "POST" "/stock-notifications/subscribe" "$invalid_request")
if echo "$response" | grep -q "error\|Error\|not found\|invalid"; then
  echo -e "${GREEN}✓ PASS${NC}: Invalid input validation works"
  PASSED=$((PASSED + 1))
else
  echo -e "${YELLOW}⚠ WARNING${NC}: Error handling may need review"
fi
echo ""

echo -e "${YELLOW}Step 12: Test Notification Service (if running)${NC}"
echo "To manually trigger notification check:"
echo "  Node.js REPL: const job = require('./jobs/backInStockNotificationJob');"
echo "               job.runImmediateCheck();"
echo ""

echo -e "${YELLOW}Step 13: Test Email Template${NC}"
echo "Check your email: $TEST_EMAIL"
echo "Subject should be: ✅ Test Medicine is back in stock"
echo "Verify template includes:"
echo "  - Medicine name & dosage"
echo "  - Pharmacy details & phone"
echo "  - Available stock count"
echo "  - Price information"
echo "  - 90-day expiration notice"
echo ""

# Summary
echo "==========================================="
echo -e "${BLUE}Test Summary${NC}"
echo "==========================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
total=$((PASSED + FAILED))
if [ $total -gt 0 ]; then
  percentage=$((PASSED * 100 / total))
  echo -e "Success Rate: ${BLUE}$percentage%${NC}"
fi
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
else
  echo -e "${RED}✗ Some tests failed. Review the output above.${NC}"
fi

echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update MEDICINE_ID and PHARMACY_ID with real IDs"
echo "2. Set JWT_TOKEN for authenticated tests"
echo "3. Check email at: $TEST_EMAIL"
echo "4. Review server logs for any errors"
echo "5. Test cron job execution (check logs every 4 hours)"
echo ""
