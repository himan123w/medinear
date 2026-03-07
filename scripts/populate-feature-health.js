/* eslint-disable no-console */
require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001/api';
const PHARMACY_ID = process.env.PHARMACY_ID || '';

function extractToken(payload) {
  return (
    payload?.token ||
    payload?.data?.token ||
    payload?.data?.data?.token ||
    payload?.accessToken ||
    payload?.data?.accessToken ||
    null
  );
}

async function resolveAuthToken() {
  if (process.env.FEATURE_TRACK_TOKEN) {
    return process.env.FEATURE_TRACK_TOKEN;
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return null;
  }

  const loginPaths = ['/auth/login', '/auth/user/login'];
  for (const loginPath of loginPaths) {
    try {
      const response = await axios.post(`${API_BASE_URL}${loginPath}`, { email, password }, { timeout: 10000 });
      const token = extractToken(response.data);
      if (token) {
        return token;
      }
    } catch (_error) {
      // Try next auth endpoint.
    }
  }

  return null;
}

async function runRequest(testCase, token) {
  try {
    const headers = token && testCase.requiresAuth
      ? { Authorization: `Bearer ${token}` }
      : {};

    const response = await axios({
      method: testCase.method,
      url: `${API_BASE_URL}${testCase.path}`,
      data: testCase.body,
      headers,
      timeout: 15000,
      validateStatus: () => true
    });

    return {
      feature: testCase.feature,
      method: testCase.method,
      path: testCase.path,
      status: response.status,
      ok: response.status < 400
    };
  } catch (error) {
    return {
      feature: testCase.feature,
      method: testCase.method,
      path: testCase.path,
      status: 'NETWORK_ERROR',
      ok: false,
      error: error.message
    };
  }
}

async function main() {
  const token = await resolveAuthToken();

  const testCases = [
    { feature: 'pharmacy', method: 'GET', path: '/pharmacy/' },
    { feature: 'medicine', method: 'GET', path: '/medicine/best' },
    { feature: 'delivery', method: 'GET', path: '/delivery/partners/available' },
    { feature: 'reservation', method: 'GET', path: '/reservations/stats' },
    { feature: 'analytics', method: 'GET', path: '/analytics/heatmap/area' },
    { feature: 'rating', method: 'GET', path: '/rating/top-rated' },
    { feature: 'subscription', method: 'GET', path: '/subscription/disease/types' },
    { feature: 'billing', method: 'GET', path: '/billing/process' },
    { feature: 'auth', method: 'POST', path: '/auth/login', body: { email: process.env.ADMIN_EMAIL || 'demo@example.com', password: process.env.ADMIN_PASSWORD || 'invalid_password' } },
    { feature: 'prescription', method: 'GET', path: '/prescription/my-prescriptions', requiresAuth: true },
    { feature: 'admin', method: 'GET', path: '/admin/dashboard/stats', requiresAuth: true },
    { feature: 'ai_demand', method: 'GET', path: '/ai/demand/trending', requiresAuth: true }
  ];

  if (PHARMACY_ID) {
    testCases.push({ feature: 'inventory', method: 'GET', path: `/inventory/${PHARMACY_ID}` });
  } else {
    console.log('ℹ️  PHARMACY_ID not set. Skipping inventory hit.');
  }

  const runnableCases = testCases.filter((testCase) => {
    if (testCase.requiresAuth && !token) {
      return false;
    }
    return true;
  });

  if (!token) {
    console.log('⚠️  No auth token resolved. Auth-only feature checks were skipped.');
    console.log('   Set FEATURE_TRACK_TOKEN or ADMIN_EMAIL + ADMIN_PASSWORD to include protected routes.');
  }

  console.log(`\n🚀 Sending ${runnableCases.length} requests to ${API_BASE_URL}...\n`);

  const results = [];
  for (const testCase of runnableCases) {
    // Sequential calls keep logs readable and reduce backend burst load.
    const result = await runRequest(testCase, token);
    results.push(result);
    const marker = result.ok ? '✅' : '❌';
    console.log(`${marker} [${result.feature}] ${result.method} ${result.path} -> ${result.status}`);
  }

  const successCount = results.filter((result) => result.ok).length;
  const failedCount = results.length - successCount;

  console.log('\n📊 Feature traffic seed complete');
  console.log(`   Total Requests: ${results.length}`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed: ${failedCount}`);
  console.log('\nNow refresh Admin Dashboard > Dashboard tab to see updated Feature Health metrics.');
}

main().catch((error) => {
  console.error('Failed to populate feature health:', error.message);
  process.exit(1);
});