#!/bin/bash

# MediNear - Comprehensive Feature Test Script
# Tests all major features of the platform

echo "======================================================"
echo "🏥 MediNear - Comprehensive Feature Test"
echo "======================================================"

BASE_URL="http://localhost:5001/api"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing: $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $response, expected $expected_status)"
        ((FAILED++))
    fi
}

echo -e "\n${YELLOW}1️⃣  Testing Health & Status Endpoints${NC}"
echo "------------------------------------------------------"
test_endpoint "Health Check" "$BASE_URL/health"
test_endpoint "Root Endpoint" "http://localhost:5001/"

echo -e "\n${YELLOW}2️⃣  Testing Pharmacy Endpoints${NC}"
echo "------------------------------------------------------"
test_endpoint "Get All Pharmacies" "$BASE_URL/pharmacy"
test_endpoint "Nearby Pharmacies" "$BASE_URL/pharmacy/nearby?lat=28.6139&lng=77.2090&radius=10"
test_endpoint "Emergency Pharmacies" "$BASE_URL/pharmacy/emergency"
test_endpoint "Pharmacies with Status" "$BASE_URL/pharmacy/with-status"

echo -e "\n${YELLOW}3️⃣  Testing Medicine Endpoints${NC}"
echo "------------------------------------------------------"
test_endpoint "Medicine Search" "$BASE_URL/medicine/search?query=paracetamol"
test_endpoint "Best Medicines" "$BASE_URL/medicine/best"
test_endpoint "Medicine Recommendations" "$BASE_URL/medicine/recommendations"
test_endpoint "Nearby Medicines" "$BASE_URL/medicine/nearby?lat=28.6139&lng=77.2090&radius=10"

echo -e "\n${YELLOW}4️⃣  Testing Category Endpoints${NC}"
echo "------------------------------------------------------"
test_endpoint "Antibiotics Category" "$BASE_URL/medicine/category/Antibiotics"
test_endpoint "Pain Relief Category" "$BASE_URL/medicine/category/Pain%20Relief"
test_endpoint "Vitamins Category" "$BASE_URL/medicine/category/Vitamins"

echo -e "\n${YELLOW}5️⃣  Testing Authentication${NC}"
echo "------------------------------------------------------"
# Test Login
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"user123"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "User Login: ${GREEN}✅ PASS${NC}"
    ((PASSED++))
    
    # Extract token for authenticated requests
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "  Token obtained: ${TOKEN:0:20}..."
else
    echo -e "User Login: ${RED}❌ FAIL${NC}"
    ((FAILED++))
fi

echo -e "\n${YELLOW}6️⃣  Testing Authenticated Endpoints${NC}"
echo "------------------------------------------------------"
if [ ! -z "$TOKEN" ]; then
    # Test authenticated endpoints
    MY_MEDS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Authorization: Bearer $TOKEN" \
      "$BASE_URL/medicine/my-medicines")
    
    if [ "$MY_MEDS_RESPONSE" -eq "200" ]; then
        echo -e "Get My Medicines: ${GREEN}✅ PASS${NC} (HTTP $MY_MEDS_RESPONSE)"
        ((PASSED++))
    else
        echo -e "Get My Medicines: ${RED}❌ FAIL${NC} (HTTP $MY_MEDS_RESPONSE)"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠️  Skipping authenticated tests (no token)${NC}"
fi

echo -e "\n${YELLOW}7️⃣  Testing Reservation System${NC}"
echo "------------------------------------------------------"
test_endpoint "Reservation Stats" "$BASE_URL/reservations/stats"

echo -e "\n${YELLOW}8️⃣  Testing Analytics${NC}"
echo "------------------------------------------------------"
test_endpoint "Inventory Analytics" "$BASE_URL/analytics/inventory"

echo -e "\n======================================================"
echo "📊 Test Results"
echo "======================================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
TOTAL=$((PASSED + FAILED))
echo "Total: $TOTAL"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Your MediNear platform is fully functional!${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  Some tests failed. Please check the endpoints above.${NC}"
    exit 1
fi
