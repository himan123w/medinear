#!/bin/bash

# 🏥 MediNear Enterprise Startup Verification
# Validates all enterprise features are properly integrated

echo "╔════════════════════════════════════════════════════╗"
echo "║  🏥 MediNear Enterprise Startup Verification     ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

# Function to check if file exists
check_file() {
  local file=$1
  local name=$2
  
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $name"
    ((PASS_COUNT++))
  else
    echo -e "${RED}✗${NC} $name (NOT FOUND: $file)"
    ((FAIL_COUNT++))
  fi
}

# Function to check if text exists in file
check_content() {
  local file=$1
  local pattern=$2
  local name=$3
  
  if grep -q "$pattern" "$file" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $name"
    ((PASS_COUNT++))
  else
    echo -e "${RED}✗${NC} $name"
    ((FAIL_COUNT++))
  fi
}

echo "📋 Checking Enterprise Middleware Files..."
check_file "middleware/validationMiddleware.js" "Input Validation Middleware"
check_file "middleware/rateLimitMiddleware.js" "Rate Limiting Middleware"
check_file "middleware/responseFormatter.js" "Response Formatter Middleware"
check_file "middleware/errorHandler.js" "Error Handler Middleware"
echo ""

echo "📋 Checking Enterprise Services..."
check_file "services/cacheService.js" "Cache Service"
check_file "services/monitoringService.js" "Monitoring & Logging Service"
echo ""

echo "📋 Checking Health Check System..."
check_file "controllers/healthController.js" "Health Check Controller"
check_file "routes/healthRoutes.js" "Health Check Routes"
echo ""

echo "📋 Checking Server Integration..."
check_content "server.js" "validationMiddleware" "Validation Middleware Imported"
check_content "server.js" "rateLimitMiddleware" "Rate Limiting Middleware Imported"
check_content "server.js" "responseFormatterMiddleware" "Response Formatter Imported"
check_content "server.js" "ErrorHandler" "Error Handler Imported"
check_content "server.js" "performanceMonitorMiddleware" "Performance Monitor Middleware"
check_content "server.js" "healthRoutes" "Health Routes Registered"
check_content "server.js" "authLimiter" "Auth Limiter Applied"
check_content "server.js" "heavyOperationLimiter" "Heavy Operation Limiter Applied"
echo ""

echo "📋 Checking B2B SaaS Integration..."
check_file "routes/saasDashboardRoutes.js" "SaaS Routes"
check_file "controllers/saasDashboardController.js" "SaaS Controller"
echo ""

echo "📋 Checking AI Prediction Integration..."
check_file "routes/demandPredictionRoutes.js" "AI Demand Routes"
check_file "controllers/demandPredictionController.js" "AI Demand Controller"
check_file "services/demandPredictionService.js" "AI Demand Service"
echo ""

echo "📋 Checking Frontend Integration..."
check_file "medinear-frontend/src/pages/AIDemandInsights.jsx" "AI Dashboard Page"
check_file "medinear-frontend/src/pages/Dashboard.jsx" "Main Dashboard"
echo ""

echo "📋 Checking Test Infrastructure..."
check_file "test-ai-quick.sh" "Quick Test Script"
check_file "test-ai-system.js" "AI System Test Suite"
echo ""

# Summary
echo "╔════════════════════════════════════════════════════╗"
echo "║  📊 Verification Summary                          ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${GREEN}✓ Passed: $PASS_COUNT${NC}"
echo -e "${RED}✗ Failed: $FAIL_COUNT${NC}"
TOTAL=$((PASS_COUNT + FAIL_COUNT))
PERCENTAGE=$((PASS_COUNT * 100 / TOTAL))
echo "Pass Rate: $PERCENTAGE%"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}✅ All enterprise features properly integrated!${NC}"
  echo ""
  echo "🚀 Next Steps:"
  echo "  1. npm install       # Install dependencies"
  echo "  2. npm run build     # Build frontend"
  echo "  3. npm start         # Start server"
  echo "  4. curl http://localhost:5001/api/health"
  echo ""
else
  echo -e "${YELLOW}⚠️  Some files are missing. Please check and create them.${NC}"
fi
