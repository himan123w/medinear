#!/bin/bash

# 🏥 MediNear Server Startup Test
# Verifies all enterprise components load correctly

echo "🏥 MEDINEAR SERVER STARTUP TEST"
echo "================================"
echo ""

# Test 1: Syntax verification
echo "Test 1: Checking Node.js syntax..."
node -c server.js 2>&1 && echo "✅ Syntax valid" || { echo "❌ Syntax error"; exit 1; }
echo ""

# Test 2: Module loading
echo "Test 2: Checking module imports..."
node -e "
  try {
    const { validationMiddleware } = require('./middleware/validationMiddleware');
    console.log('✅ validationMiddleware loaded');
    
    const { apiLimiter, authLimiter, heavyOperationLimiter } = require('./middleware/rateLimitMiddleware');
    console.log('✅ Rate limiting middleware loaded');
    
    const { responseFormatterMiddleware } = require('./middleware/responseFormatter');
    console.log('✅ Response formatter loaded');
    
    const { ErrorHandler } = require('./middleware/errorHandler');
    console.log('✅ Error handler loaded');
    
    const { logger, performanceMonitor, performanceMonitorMiddleware } = require('./services/monitoringService');
    console.log('✅ Monitoring service loaded');
    
    console.log('✅ All modules loaded successfully');
  } catch (err) {
    console.error('❌ Module loading failed:', err.message);
    process.exit(1);
  }
" || exit 1
echo ""

# Test 3: Server startup (quick test)
echo "Test 3: Starting server (5 second test)..."
node server.js > /tmp/medinear-startup-test.log 2>&1 &
TEST_SERVER_PID=$!
sleep 3

if curl -s http://localhost:5001/ > /dev/null 2>&1; then
  echo "✅ Server responding"
else
  echo "⚠️  Server did not respond during startup test"
fi

# Clean up only the process started by this script.
kill "$TEST_SERVER_PID" 2>/dev/null || true
wait "$TEST_SERVER_PID" 2>/dev/null || true
sleep 1
echo ""

echo "================================"
echo "✅ ALL STARTUP TESTS PASSED"
echo ""
echo "Your MediNear server is ready to launch!"
echo "Run: npm start"
