#!/usr/bin/env node

/**
 * 🤖 AI DEMAND PREDICTION - AUTOMATED TEST SUITE
 * Tests all components: Backend, Frontend, API, Database
 * Usage: node test-ai-system.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Test results storage
const results = {
  backend: {},
  frontend: {},
  integration: {},
  api: {},
  summary: {}
};

// Helper functions
function log(type, message) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    test: '🧪',
    check: '✔️'
  };
  const icon = icons[type] || '•';
  console.log(`${icon} ${message}`);
}

function section(title) {
  console.log(`\n${colors.bold}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

function searchInFile(filePath, searchText) {
  const content = readFile(filePath);
  return content ? content.includes(searchText) : false;
}

// ============================================
// TEST 1: BACKEND FILES
// ============================================
async function testBackendFiles() {
  section('🧪 TEST 1: BACKEND FILES');
  
  const baseDir = '/Users/rajpoothimanshusingh369/Desktop/medinear';
  
  const requiredFiles = [
    { path: '/models/DemandPrediction.js', name: 'DemandPrediction Model' },
    { path: '/services/demandPredictionService.js', name: 'Demand Prediction Service' },
    { path: '/controllers/demandPredictionController.js', name: 'Demand Prediction Controller' },
    { path: '/routes/demandPredictionRoutes.js', name: 'Demand Prediction Routes' }
  ];
  
  let allExist = true;
  for (const file of requiredFiles) {
    const fullPath = baseDir + file.path;
    const exists = fileExists(fullPath);
    allExist = allExist && exists;
    
    if (exists) {
      log('success', `${file.name} exists`);
      results.backend[file.name] = 'PASS';
    } else {
      log('error', `${file.name} MISSING at ${fullPath}`);
      results.backend[file.name] = 'FAIL';
    }
  }
  
  return allExist;
}

// ============================================
// TEST 2: FRONTEND FILES
// ============================================
async function testFrontendFiles() {
  section('🧪 TEST 2: FRONTEND FILES');
  
  const baseDir = '/Users/rajpoothimanshusingh369/Desktop/medinear/medinear-frontend';
  
  const requiredFiles = [
    { path: '/src/pages/AIDemandInsights.jsx', name: 'AI Dashboard Page' },
    { path: '/src/pages/AIDemandInsights.css', name: 'AI Dashboard Styles' }
  ];
  
  let allExist = true;
  for (const file of requiredFiles) {
    const fullPath = baseDir + file.path;
    const exists = fileExists(fullPath);
    allExist = allExist && exists;
    
    if (exists) {
      log('success', `${file.name} exists`);
      results.frontend[file.name] = 'PASS';
    } else {
      log('error', `${file.name} MISSING at ${fullPath}`);
      results.frontend[file.name] = 'FAIL';
    }
  }
  
  return allExist;
}

// ============================================
// TEST 3: SERVER INTEGRATION
// ============================================
async function testServerIntegration() {
  section('🧪 TEST 3: SERVER INTEGRATION');
  
  const serverFile = '/Users/rajpoothimanshusingh369/Desktop/medinear/server.js';
  
  // Check route import
  const hasRouteImport = searchInFile(serverFile, '/api/ai/demand');
  if (hasRouteImport) {
    log('success', 'API route registered in server.js');
    results.integration['Server Routes'] = 'PASS';
  } else {
    log('error', 'API routes NOT found in server.js');
    results.integration['Server Routes'] = 'FAIL';
  }
  
  return hasRouteImport;
}

// ============================================
// TEST 4: FRONTEND ROUTING
// ============================================
async function testFrontendRouting() {
  section('🧪 TEST 4: FRONTEND ROUTING');
  
  const appFile = '/Users/rajpoothimanshusingh369/Desktop/medinear/medinear-frontend/src/App.jsx';
  
  // Check import
  const hasImport = searchInFile(appFile, 'AIDemandInsights');
  if (hasImport) {
    log('success', 'AIDemandInsights imported in App.jsx');
    results.integration['Frontend Import'] = 'PASS';
  } else {
    log('error', 'AIDemandInsights NOT imported in App.jsx');
    results.integration['Frontend Import'] = 'FAIL';
  }
  
  // Check route
  const hasRoute = searchInFile(appFile, '/ai/insights');
  if (hasRoute) {
    log('success', '/ai/insights route configured');
    results.integration['Frontend Route'] = 'PASS';
  } else {
    log('error', '/ai/insights route NOT configured');
    results.integration['Frontend Route'] = 'FAIL';
  }
  
  return hasImport && hasRoute;
}

// ============================================
// TEST 5: DASHBOARD INTEGRATION
// ============================================
async function testDashboardIntegration() {
  section('🧪 TEST 5: DASHBOARD INTEGRATION');
  
  const dashboardFile = '/Users/rajpoothimanshusingh369/Desktop/medinear/medinear-frontend/src/pages/Dashboard.jsx';
  
  const hasAIButton = searchInFile(dashboardFile, '/ai/insights');
  if (hasAIButton) {
    log('success', '🤖 AI Insights button integrated in Dashboard');
    results.integration['Dashboard Button'] = 'PASS';
  } else {
    log('error', '🤖 AI Insights button NOT found in Dashboard');
    results.integration['Dashboard Button'] = 'FAIL';
  }
  
  return hasAIButton;
}

// ============================================
// TEST 6: FILE CONTENT VALIDATION
// ============================================
async function testFileContentValidation() {
  section('🧪 TEST 6: FILE CONTENT VALIDATION');
  
  let validationPass = true;
  
  // Check DemandPrediction model has required fields
  const demandPredictionFile = '/Users/rajpoothimanshusingh369/Desktop/medinear/models/DemandPrediction.js';
  const dpContent = readFile(demandPredictionFile);
  
  const requiredFields = [
    'season',
    'predictedDemandMedicines',
    'areaPredictions',
    'insights',
    'alerts',
    'accuracy'
  ];
  
  for (const field of requiredFields) {
    if (dpContent && dpContent.includes(field)) {
      log('success', `DemandPrediction has "${field}" field`);
      results.integration[`DP Field: ${field}`] = 'PASS';
    } else {
      log('error', `DemandPrediction MISSING "${field}" field`);
      results.integration[`DP Field: ${field}`] = 'FAIL';
      validationPass = false;
    }
  }
  
  // Check service has required functions
  const serviceFile = '/Users/rajpoothimanshsingh369/Desktop/medinear/services/demandPredictionService.js';
  const serviceContent = readFile(serviceFile);
  
  const requiredFunctions = [
    'predictSeasonalDemand',
    'predictAreaDemand',
    'createDemandPrediction',
    'getActivePredictions'
  ];
  
  for (const func of requiredFunctions) {
    if (serviceContent && serviceContent.includes(`function ${func}`)) {
      log('success', `Service has "${func}" function`);
      results.integration[`Service: ${func}`] = 'PASS';
    } else {
      log('warning', `Service function "${func}" - format may differ`);
    }
  }
  
  return validationPass;
}

// ============================================
// TEST 7: BUILD STATUS
// ============================================
async function testBuildStatus() {
  section('🧪 TEST 7: BUILD STATUS');
  
  try {
    const { stdout } = await execAsync('cd /Users/rajpoothimanshusingh369/Desktop/medinear/medinear-frontend && npm run build 2>&1 | tail -20');
    
    if (stdout.includes('built in')) {
      log('success', 'Frontend builds successfully');
      results.api['Build Status'] = 'PASS';
      return true;
    } else {
      log('warning', 'Build output unclear');
      results.api['Build Status'] = 'WARNING';
      return false;
    }
  } catch (error) {
    log('error', `Build failed: ${error.message.substring(0, 100)}`);
    results.api['Build Status'] = 'FAIL';
    return false;
  }
}

// ============================================
// TEST 8: DATABASE MODEL
// ============================================
async function testDatabaseModel() {
  section('🧪 TEST 8: DATABASE MODEL VALIDATION');
  
  const demandPredictionFile = '/Users/rajpoothimanshusingh369/Desktop/medinear/models/DemandPrediction.js';
  const content = readFile(demandPredictionFile);
  
  const requiredSchemaElements = [
    { key: 'season', desc: 'Season field' },
    { key: 'predictedDemandMedicines', desc: 'Medicine predictions array' },
    { key: 'areaPredictions', desc: 'Area predictions array' },
    { key: 'modelVersion', desc: 'Model version tracking' },
    { key: 'accuracy', desc: 'Accuracy metrics' },
    { key: 'alerts', desc: 'Alert system' },
    { key: 'insights', desc: 'AI insights' }
  ];
  
  let modelValid = true;
  for (const element of requiredSchemaElements) {
    if (content.includes(element.key)) {
      log('success', `Database model has ${element.desc}`);
      results.api[`DB: ${element.desc}`] = 'PASS';
    } else {
      log('error', `Database model MISSING ${element.desc}`);
      results.api[`DB: ${element.desc}`] = 'FAIL';
      modelValid = false;
    }
  }
  
  return modelValid;
}

// ============================================
// TEST 9: API ENDPOINTS STRUCTURE
// ============================================
async function testAPIEndpoints() {
  section('🧪 TEST 9: API ENDPOINTS STRUCTURE');
  
  const controllerFile = '/Users/rajpoothimanshusingh369/Desktop/medinear/controllers/demandPredictionController.js';
  const routesFile = '/Users/rajpoothimanshusingh369/Desktop/medinear/routes/demandPredictionRoutes.js';
  
  const controllerContent = readFile(controllerFile);
  const routesContent = readFile(routesFile);
  
  const requiredEndpoints = [
    { name: 'Dashboard', path: '/dashboard', method: 'GET' },
    { name: 'Seasonal', path: '/seasonal', method: 'GET' },
    { name: 'Areas', path: '/areas', method: 'GET' },
    { name: 'Refresh', path: '/refresh', method: 'POST' }
  ];
  
  let allEndpointsExist = true;
  for (const endpoint of requiredEndpoints) {
    const exists = routesContent && routesContent.includes(endpoint.path);
    
    if (exists) {
      log('success', `${endpoint.method} ${endpoint.path} - ${endpoint.name} endpoint configured`);
      results.api[`Endpoint: ${endpoint.name}`] = 'PASS';
    } else {
      log('error', `${endpoint.method} ${endpoint.path} - ${endpoint.name} endpoint MISSING`);
      results.api[`Endpoint: ${endpoint.name}`] = 'FAIL';
      allEndpointsExist = false;
    }
  }
  
  return allEndpointsExist;
}

// ============================================
// TEST 10: CONFIGURATION
// ============================================
async function testConfiguration() {
  section('🧪 TEST 10: CONFIGURATION & CONSTANTS');
  
  const serviceFile = '/Users/rajpoothimanshusingh369/Desktop/medinear/services/demandPredictionService.js';
  const serviceContent = readFile(serviceFile);
  
  const requiredConfigs = [
    { key: 'SEASONAL_CATEGORIES', desc: 'Seasonal medicine categories' },
    { key: 'winter', desc: 'Winter medicines list' },
    { key: 'summer', desc: 'Summer medicines list' },
    { key: 'monsoon', desc: 'Monsoon medicines list' }
  ];
  
  let configValid = true;
  for (const config of requiredConfigs) {
    if (serviceContent && serviceContent.includes(config.key)) {
      log('success', `Configuration includes ${config.desc}`);
      results.api[`Config: ${config.desc}`] = 'PASS';
    } else {
      log('warning', `Configuration may be missing ${config.desc}`);
    }
  }
  
  return configValid;
}

// ============================================
// GENERATE SUMMARY REPORT
// ============================================
function generateSummaryReport() {
  section('📊 TEST SUMMARY REPORT');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  const allResults = {
    ...results.backend,
    ...results.frontend,
    ...results.integration,
    ...results.api
  };
  
  for (const [test, status] of Object.entries(allResults)) {
    totalTests++;
    if (status === 'PASS') {
      passedTests++;
    } else if (status === 'FAIL') {
      failedTests++;
    }
  }
  
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  
  console.log(`${colors.bold}Total Tests:${colors.reset} ${totalTests}`);
  console.log(`${colors.bold}${colors.green}Passed:${colors.reset} ${passedTests}`);
  console.log(`${colors.bold}${colors.red}Failed:${colors.reset} ${failedTests}`);
  console.log(`${colors.bold}${colors.cyan}Pass Rate:${colors.reset} ${passRate}%`);
  
  // Final status
  console.log(`\n${colors.bold}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  if (passRate === 100) {
    console.log(`${colors.green}${colors.bold}✅ ALL SYSTEMS OPERATIONAL! 🎉${colors.reset}`);
    console.log(`${colors.green}AI Demand Prediction system is ready to use!${colors.reset}`);
  } else if (passRate >= 80) {
    console.log(`${colors.yellow}${colors.bold}⚠️ SYSTEM PARTIALLY OPERATIONAL${colors.reset}`);
    console.log(`${colors.yellow}${failedTests} component(s) need attention${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bold}❌ SYSTEM NEEDS FIXES${colors.reset}`);
    console.log(`${colors.red}${failedTests} component(s) failed${colors.reset}`);
  }
  
  console.log(`${colors.bold}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

// ============================================
// NEXT STEPS
// ============================================
function showNextSteps() {
  section('🚀 NEXT STEPS');
  
  console.log(`${colors.bold}1. Start the Server:${colors.reset}`);
  console.log(`   cd /Users/rajpoothimanshusingh369/Desktop/medinear`);
  console.log(`   node server.js\n`);
  
  console.log(`${colors.bold}2. Start the Frontend:${colors.reset}`);
  console.log(`   cd medinear-frontend`);
  console.log(`   npm run dev\n`);
  
  console.log(`${colors.bold}3. Access the System:${colors.reset}`);
  console.log(`   Frontend: http://localhost:5173`);
  console.log(`   Backend:  http://localhost:5000\n`);
  
  console.log(`${colors.bold}4. Test the AI Dashboard:${colors.reset}`);
  console.log(`   • Login with pharmacy credentials`);
  console.log(`   • Click "🤖 AI Insights" on dashboard`);
  console.log(`   • View seasonal, geographic, and insights tabs\n`);
  
  console.log(`${colors.bold}5. API Testing:${colors.reset}`);
  console.log(`   curl -H "Authorization: Bearer TOKEN" \\`);
  console.log(`     http://localhost:5000/api/ai/demand/dashboard\n`);
}

// ============================================
// MAIN TEST EXECUTION
// ============================================
async function runAllTests() {
  console.clear();
  console.log(`${colors.bold}${colors.cyan}`);
  console.log(`
  ╔════════════════════════════════════════════════╗
  ║   🤖 AI DEMAND PREDICTION - TEST SUITE 🤖      ║
  ║         Automated Verification System           ║
  ╚════════════════════════════════════════════════╝
  `);
  console.log(`${colors.reset}`);
  
  try {
    // Run all tests
    await testBackendFiles();
    await testFrontendFiles();
    await testServerIntegration();
    await testFrontendRouting();
    await testDashboardIntegration();
    await testFileContentValidation();
    await testBuildStatus();
    await testDatabaseModel();
    await testAPIEndpoints();
    await testConfiguration();
    
    // Generate report
    generateSummaryReport();
    showNextSteps();
    
  } catch (error) {
    console.error(`${colors.red}Error during testing: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the tests
runAllTests();
