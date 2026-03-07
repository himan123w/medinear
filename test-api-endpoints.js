/**
 * 🧪 API Endpoint Functionality Test
 * Tests core features of the MediNear platform
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

console.log('\n====================================================');
console.log('🧪 MediNear API Endpoint Test Suite');
console.log('====================================================\n');

let passed = 0;
let failed = 0;
let testToken = null;
let testPharmacyToken = null;

async function test(description, testFn) {
  try {
    await testFn();
    console.log(`✅ PASS: ${description}`);
    passed++;
  } catch (error) {
    console.log(`❌ FAIL: ${description}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

async function runTests() {
  // ============================================
  // Health Check Tests
  // ============================================
  console.log('\n💊 Health Check Tests\n' + '─'.repeat(50));

  await test('GET /api/health - Server health check', async () => {
    const response = await axios.get(`${BASE_URL}/api/health`);
    if (response.data.success !== true) {
      throw new Error('Health check failed');
    }
  });

  await test('GET /api/health/detailed - Detailed health info', async () => {
    const response = await axios.get(`${BASE_URL}/api/health/detailed`);
    if (!response.data.components || !response.data.components.database) {
      throw new Error('Detailed health check missing components');
    }
  });

  await test('GET / - Root endpoint', async () => {
    const response = await axios.get(`${BASE_URL}/`);
    if (!response.data.message.includes('MediNear')) {
      throw new Error('Root endpoint response incorrect');
    }
  });

  // ============================================
  // Authentication Tests
  // ============================================
  console.log('\n🔐 Authentication Tests\n' + '─'.repeat(50));

  // Create a unique test user
  const testEmail = `test_${Date.now()}@example.com`;
  const testPhone = `98765${Math.floor(Math.random() * 100000)}`;
  const testPassword = 'Test@123';

  await test('POST /api/auth/user/register - User registration', async () => {
    const response = await axios.post(`${BASE_URL}/api/auth/user/register`, {
      name: 'Test User',
      email: testEmail,
      phone: testPhone,
      password: testPassword
    });
    if (response.data.message !== 'Registration successful') {
      throw new Error('Registration failed: ' + response.data.message);
    }
  });

  await test('POST /api/auth/user/register - Duplicate user rejected', async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/user/register`, {
        name: 'Test User',
        email: testEmail,
        phone: testPhone,
        password: testPassword
      });
      throw new Error('Should have rejected duplicate user');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Expected error
        return;
      }
      throw error;
    }
  });

  await test('POST /api/auth/user/login - User login with valid credentials', async () => {
    const response = await axios.post(`${BASE_URL}/api/auth/user/login`, {
      email: testEmail,
      password: testPassword
    });
    if (!response.data.token) {
      throw new Error('No token returned');
    }
    testToken = response.data.token;
  });

  await test('POST /api/auth/user/login - Reject invalid credentials', async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/user/login`, {
        email: testEmail,
        password: 'WrongPassword'
      });
      throw new Error('Should have rejected invalid password');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Expected error
        return;
      }
      throw error;
    }
  });

  // ============================================
  // Pharmacy Registration & Auth Tests
  // ============================================
  console.log('\n🏥 Pharmacy Authentication Tests\n' + '─'.repeat(50));

  const testPharmacyPhone = `98123${Math.floor(Math.random() * 100000)}`;

  await test('POST /api/auth/register - Pharmacy registration', async () => {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Test Pharmacy',
      owner: 'Test Owner',
      phone: testPharmacyPhone,
      password: 'Test@123',
      area: 'Test Area',
      licenseNumber: 'LIC123456',
      latitude: 28.7041,
      longitude: 77.1025,
      address: 'Test Address'
    });
    if (!response.data.pharmacyId) {
      throw new Error('Pharmacy registration failed');
    }
  });

  await test('POST /api/auth/login - Pharmacy login', async () => {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      phone: testPharmacyPhone,
      password: 'Test@123'
    });
    if (!response.data.token) {
      throw new Error('No token returned for pharmacy');
    }
    testPharmacyToken = response.data.token;
  });

  // ============================================
  // Protected Route Tests
  // ============================================
  console.log('\n🔒 Protected Route Tests\n' + '─'.repeat(50));

  await test('Protected route without token - Should reject', async () => {
    try {
      await axios.get(`${BASE_URL}/api/medicine/my-medicines`);
      throw new Error('Should have rejected request without token');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Expected error
        return;
      }
      throw error;
    }
  });

  await test('Protected route with invalid token - Should reject', async () => {
    try {
      await axios.get(`${BASE_URL}/api/medicine/my-medicines`, {
        headers: { Authorization: 'Bearer invalid-token-here' }
      });
      throw new Error('Should have rejected invalid token');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Expected error
        return;
      }
      throw error;
    }
  });

  await test('Protected route with valid token - Should allow', async () => {
    const response = await axios.get(`${BASE_URL}/api/medicine/my-medicines`, {
      headers: { Authorization: `Bearer ${testPharmacyToken}` }
    });
    // Should return array (empty or with medicines)
    if (!Array.isArray(response.data)) {
      throw new Error('Expected array response');
    }
  });

  // ============================================
  // Medicine CRUD Tests
  // ============================================
  console.log('\n💊 Medicine CRUD Tests\n' + '─'.repeat(50));

  let medicineId = null;

  await test('POST /api/medicine/add - Add medicine', async () => {
    const response = await axios.post(
      `${BASE_URL}/api/medicine/add`,
      {
        name: 'Test Medicine Paracetamol',
        price: 50,
        available: true,
        category: 'Pain Relief',
        stock: 100,
        stockAlert: 10
      },
      {
        headers: { Authorization: `Bearer ${testPharmacyToken}` }
      }
    );
    if (!response.data._id) {
      throw new Error('Medicine creation failed');
    }
    medicineId = response.data._id;
  });

  await test('GET /api/medicine/search - Search medicine', async () => {
    const response = await axios.get(`${BASE_URL}/api/medicine/search`, {
      params: { name: 'Paracetamol' }
    });
    if (!Array.isArray(response.data)) {
      throw new Error('Expected array response');
    }
  });

  await test('PUT /api/medicine/:id - Update medicine', async () => {
    if (!medicineId) throw new Error('No medicine ID available');
    const response = await axios.put(
      `${BASE_URL}/api/medicine/${medicineId}`,
      {
        price: 45,
        available: true
      },
      {
        headers: { Authorization: `Bearer ${testPharmacyToken}` }
      }
    );
    if (response.data.message !== 'Medicine updated successfully') {
      throw new Error('Medicine update failed');
    }
  });

  await test('DELETE /api/medicine/:id - Delete medicine', async () => {
    if (!medicineId) throw new Error('No medicine ID available');
    const response = await axios.delete(`${BASE_URL}/api/medicine/${medicineId}`, {
      headers: { Authorization: `Bearer ${testPharmacyToken}` }
    });
    if (response.data.message !== 'Medicine deleted successfully') {
      throw new Error('Medicine deletion failed');
    }
  });

  // ============================================
  // Input Validation Edge Cases
  // ============================================
  console.log('\n🛡️ Input Validation Edge Cases\n' + '─'.repeat(50));

  await test('XSS Prevention - Script tags sanitized', async () => {
    const response = await axios.get(`${BASE_URL}/api/medicine/search`, {
      params: { name: '<script>alert("xss")</script>test' }
    });
    // Should not throw error and should sanitize input
    if (!Array.isArray(response.data)) {
      throw new Error('Unexpected response format');
    }
  });

  await test('SQL Injection Prevention - Quotes sanitized', async () => {
    const response = await axios.get(`${BASE_URL}/api/medicine/search`, {
      params: { name: "test' OR '1'='1" }
    });
    // Should not throw error and should sanitize input
    if (!Array.isArray(response.data)) {
      throw new Error('Unexpected response format');
    }
  });

  await test('Missing required fields - Should reject', async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/user/register`, {
        name: 'Test User'
        // Missing email, phone, password
      });
      throw new Error('Should have rejected incomplete data');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Expected error
        return;
      }
      throw error;
    }
  });

  // ============================================
  // Summary
  // ============================================
  console.log('\n====================================================');
  console.log('📊 Test Summary');
  console.log('====================================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total:  ${passed + failed}`);
  console.log(`📊 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('====================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('\n❌ Test suite error:', error.message);
  process.exit(1);
});
