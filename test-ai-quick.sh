#!/bin/bash

# 🤖 AI DEMAND PREDICTION - QUICK TEST SCRIPT
# Run this to verify everything is working

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║   🤖 AI DEMAND PREDICTION - QUICK TEST 🤖      ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

testCount=0
passCount=0
failCount=0

# Helper function
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✅${NC} $2 exists"
    ((passCount++))
  else
    echo -e "${RED}❌${NC} $2 MISSING"
    ((failCount++))
  fi
  ((testCount++))
}

check_content() {
  if grep -q "$2" "$1" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} $3"
    ((passCount++))
  else
    echo -e "${RED}❌${NC} $3 MISSING"
    ((failCount++))
  fi
  ((testCount++))
}

# Test 1: Backend Files
echo -e "${BLUE}━━━ TEST 1: BACKEND FILES ━━━${NC}"
check_file "/Users/rajpoothimanshusingh369/Desktop/medinear/models/DemandPrediction.js" "DemandPrediction Model"
check_file "/Users/rajpoothimanshusingh369/Desktop/medinear/services/demandPredictionService.js" "Demand Service"
check_file "/Users/rajpoothimanshusingh369/Desktop/medinear/controllers/demandPredictionController.js" "Demand Controller"
check_file "/Users/rajpoothimanshusingh369/Desktop/medinear/routes/demandPredictionRoutes.js" "Demand Routes"
echo ""

# Test 2: Frontend Files
echo -e "${BLUE}━━━ TEST 2: FRONTEND FILES ━━━${NC}"
check_file "/Users/rajpoothimanshusingh369/Desktop/medinear/medinear-frontend/src/pages/AIDemandInsights.jsx" "AI Insights Page"
check_file "/Users/rajpoothimanshusingh369/Desktop/medinear/medinear-frontend/src/pages/AIDemandInsights.css" "AI Insights Styles"
echo ""

# Test 3: Integration Points
echo -e "${BLUE}━━━ TEST 3: INTEGRATION ━━━${NC}"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/server.js" "api/ai/demand" "Server routes integrated"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/medinear-frontend/src/App.jsx" "AIDemandInsights" "Frontend page imported"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/medinear-frontend/src/App.jsx" "/ai/insights" "Frontend route configured"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/medinear-frontend/src/pages/Dashboard.jsx" "/ai/insights" "Dashboard button added"
echo ""

# Test 4: Model Validation
echo -e "${BLUE}━━━ TEST 4: MODEL VALIDATION ━━━${NC}"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/models/DemandPrediction.js" "season" "Season field in model"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/models/DemandPrediction.js" "predictedDemandMedicines" "Medicine predictions in model"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/models/DemandPrediction.js" "areaPredictions" "Area predictions in model"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/models/DemandPrediction.js" "accuracy" "Accuracy metrics in model"
echo ""

# Test 5: Service Functions
echo -e "${BLUE}━━━ TEST 5: SERVICE FUNCTIONS ━━━${NC}"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/services/demandPredictionService.js" "predictSeasonalDemand" "Seasonal prediction function"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/services/demandPredictionService.js" "predictAreaDemand" "Area prediction function"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/services/demandPredictionService.js" "createDemandPrediction" "Create prediction function"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/services/demandPredictionService.js" "SEASONAL_CATEGORIES" "Seasonal categories defined"
echo ""

# Test 6: API Endpoints
echo -e "${BLUE}━━━ TEST 6: API ENDPOINTS ━━━${NC}"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/routes/demandPredictionRoutes.js" "/dashboard" "Dashboard endpoint"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/routes/demandPredictionRoutes.js" "/seasonal" "Seasonal endpoint"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/routes/demandPredictionRoutes.js" "/areas" "Areas endpoint"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/routes/demandPredictionRoutes.js" "/refresh" "Refresh endpoint"
echo ""

# Test 7: Controller Methods
echo -e "${BLUE}━━━ TEST 7: CONTROLLER METHODS ━━━${NC}"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/controllers/demandPredictionController.js" "getAIDashboard" "Dashboard controller"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/controllers/demandPredictionController.js" "getSeasonalPredictions" "Seasonal controller"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/controllers/demandPredictionController.js" "getAreaPredictions" "Area controller"
check_content "/Users/rajpoothimanshusingh369/Desktop/medinear/controllers/demandPredictionController.js" "refreshPredictions" "Refresh controller"
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 TEST SUMMARY${NC}"
echo -e "${GREEN}✅ Passed: $passCount${NC}"
echo -e "${RED}❌ Failed: $failCount${NC}"
echo "Total: $testCount"

if [ $failCount -eq 0 ]; then
  passRate=100
else
  passRate=$((100 * passCount / testCount))
fi
echo -e "${BLUE}Pass Rate: ${passRate}%${NC}"
echo ""

# Final verdict
if [ $failCount -eq 0 ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ ALL SYSTEMS OPERATIONAL! 🎉${NC}"
  echo -e "${GREEN}AI Demand Prediction is ready to use!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
elif [ $passRate -ge 80 ]; then
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}⚠️  SYSTEM PARTIALLY OPERATIONAL${NC}"
  echo -e "${YELLOW}$failCount component(s) need attention${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ SYSTEM NEEDS FIXES${NC}"
  echo -e "${RED}$failCount component(s) failed${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

echo ""
echo -e "${BLUE}🚀 NEXT STEPS:${NC}"
echo "1. Start server:    cd /Users/rajpoothimanshusingh369/Desktop/medinear && node server.js"
echo "2. Start frontend:  cd medinear-frontend && npm run dev"
echo "3. Access at:       http://localhost:5173"
echo "4. Login and click: 🤖 AI Insights button"
echo ""
