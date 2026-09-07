#!/usr/bin/env node

const http = require('http');

const BASE_URL = `http://localhost:${process.env.PORT || 5001}/api`;

let passed = 0;
let failed = 0;

function test_endpoint(name, url, expected_status = 200) {
    return new Promise((resolve) => {
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            if (res.statusCode === expected_status) {
                console.log(`✅ ${name}: PASS (HTTP ${res.statusCode})`);
                passed++;
            } else {
                console.log(`❌ ${name}: FAIL (HTTP ${res.statusCode}, expected ${expected_status})`);
                failed++;
            }
            resolve();
        });

        req.on('error', (e) => {
            console.log(`❌ ${name}: FAIL (Connection error: ${e.message})`);
            failed++;
            resolve();
        });

        req.end();
    });
}

async function runTests() {
    console.log('\n======================================================');
    console.log('🏥 MediNear - Comprehensive Feature Test');
    console.log('======================================================\n');

    console.log('1️⃣  Testing Health & Status Endpoints');
    console.log('------------------------------------------------------');
    await test_endpoint('Health Check', `${BASE_URL}/health`);
    await test_endpoint('Root Endpoint', `http://localhost:${process.env.PORT || 5001}/`);

    console.log('\n2️⃣  Testing Pharmacy Endpoints');
    console.log('------------------------------------------------------');
    await test_endpoint('Get All Pharmacies', `${BASE_URL}/pharmacy`);
    await test_endpoint('Nearby Pharmacies', `${BASE_URL}/pharmacy/nearby?latitude=28.6139&longitude=77.2090&maxDistance=10000`);
    await test_endpoint('Emergency Pharmacies', `${BASE_URL}/pharmacy/emergency?latitude=28.6139&longitude=77.2090&radius=10`);
    await test_endpoint('Pharmacies with Status', `${BASE_URL}/pharmacy/with-status`);

    console.log('\n3️⃣  Testing Medicine Endpoints');
    console.log('------------------------------------------------------');
    await test_endpoint('Medicine Search', `${BASE_URL}/medicine/search?query=paracetamol`);
    await test_endpoint('Best Medicines', `${BASE_URL}/medicine/best`);
    await test_endpoint('Medicine Recommendations', `${BASE_URL}/medicine/recommendations`);
    await test_endpoint('Nearby Medicines', `${BASE_URL}/medicine/nearby?latitude=28.6139&longitude=77.2090&radius=10`);

    console.log('\n4️⃣  Testing Category Endpoints');
    console.log('------------------------------------------------------');
    await test_endpoint('Antibiotics Category', `${BASE_URL}/medicine/category/Antibiotics`);
    await test_endpoint('Pain Relief Category', `${BASE_URL}/medicine/category/Pain%20Relief`);
    await test_endpoint('Vitamins Category', `${BASE_URL}/medicine/category/Vitamins`);

    console.log('\n5️⃣  Testing Reservation System');
    console.log('------------------------------------------------------');
    await test_endpoint('Reservation Stats', `${BASE_URL}/reservations/stats`);

    console.log('\n6️⃣  Testing Analytics');
    console.log('------------------------------------------------------');
    await test_endpoint('Area Heatmap Analytics', `${BASE_URL}/analytics/heatmap/area`);

    console.log('\n======================================================');
    console.log('📊 Test Results');
    console.log('======================================================');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${passed + failed}\n`);

    if (failed > 0) {
        console.log('⚠️  Some tests failed. Please check the endpoints above.');
    } else {
        console.log('✅ All tests passed!');
    }
}

runTests();
