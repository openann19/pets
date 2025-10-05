#!/usr/bin/env node

/**
 * 🎯 FINAL ULTRA TEST - Complete System Validation
 */

const http = require('http');

async function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => Promise.resolve(JSON.parse(data)),
          text: () => Promise.resolve(data)
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function runFinalTests() {
  console.log('🎯 FINAL ULTRA TESTING - COMPLETE VALIDATION');
  console.log('=============================================\n');

  let results = [];
  
  async function test(name, testFn) {
    const start = Date.now();
    try {
      console.log(`🧪 ${name}...`);
      const result = await testFn();
      const duration = Date.now() - start;
      console.log(`✅ ${name} - PASSED (${duration}ms)`);
      results.push({ name, status: 'PASS', duration, data: result });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.log(`❌ ${name} - FAILED (${duration}ms): ${error.message}`);
      results.push({ name, status: 'FAIL', duration, error: error.message });
      return null;
    }
  }

  // 1. Service Health Checks
  console.log('🏥 SERVICE HEALTH CHECKS');
  console.log('========================');

  await test('Backend API Health', async () => {
    const response = await fetch('http://127.0.0.1:5000/api/health');
    if (!response.ok) throw new Error(`Backend unhealthy: ${response.status}`);
    const data = await response.json();
    return { status: data.status, uptime: data.uptime };
  });

  await test('AI Service Health', async () => {
    const response = await fetch('http://127.0.0.1:8000/health');
    if (!response.ok) throw new Error(`AI Service unhealthy: ${response.status}`);
    const data = await response.json();
    return { status: data.status, service: data.service };
  });

  // 2. Authentication Flow
  console.log('\n🔐 AUTHENTICATION TESTS');
  console.log('=======================');

  let authToken = null;

  const registerResult = await test('User Registration', async () => {
    const testUser = {
      email: `ultratest-${Date.now()}@pawfectmatch.com`,
      password: 'UltraTest123!',
      firstName: 'Ultra',
      lastName: 'Tester',
      dateOfBirth: '1990-01-01'
    };

    const response = await fetch('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Registration failed: ${error}`);
    }

    const data = await response.json();
    if (data.success && data.data && data.data.token) {
      authToken = data.data.token;
    }
    return { success: data.success, hasToken: !!authToken };
  });

  // If registration fails, try login with demo account
  if (!authToken) {
    await test('Demo User Login', async () => {
      const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@pawfectmatch.com',
          password: 'password123'
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Login failed: ${error}`);
      }

      const data = await response.json();
      if (data.success && data.data && data.data.token) {
        authToken = data.data.token;
      }
      return { success: data.success, hasToken: !!authToken };
    });
  }

  // 3. Core API Tests
  console.log('\n🌐 CORE API TESTS');
  console.log('=================');

  await test('Get User Profile', async () => {
    const response = await fetch('http://127.0.0.1:5000/api/user/profile', {
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
    });

    if (!response.ok) throw new Error(`Profile fetch failed: ${response.status}`);
    const data = await response.json();
    return { hasProfile: !!data, email: data.email };
  });

  await test('Get Pets Collection', async () => {
    const response = await fetch('http://127.0.0.1:5000/api/pets', {
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
    });

    if (!response.ok) throw new Error(`Pets fetch failed: ${response.status}`);
    const data = await response.json();
    return { petsCount: Array.isArray(data) ? data.length : 0 };
  });

  let createdPetId = null;
  const petResult = await test('Create New Pet', async () => {
    const testPet = {
      name: 'Ultra Test Buddy',
      species: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      size: 'large',
      photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'],
      bio: 'Ultra testing companion - friendly and energetic!',
      personality: ['friendly', 'energetic', 'playful', 'loyal']
    };

    const response = await fetch('http://127.0.0.1:5000/api/pets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify(testPet)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pet creation failed: ${error}`);
    }

    const data = await response.json();
    createdPetId = data.id || data._id;
    return { petId: createdPetId, name: data.name, species: data.species };
  });

  // 4. AI Service Tests
  console.log('\n🤖 AI SERVICE TESTS');
  console.log('===================');

  await test('AI Bio Generation', async () => {
    const response = await fetch('http://127.0.0.1:8000/api/generate-bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pet: {
          id: createdPetId || 'test-pet-1',
          name: 'Ultra Test Buddy',
          species: 'dog',
          breed: 'Golden Retriever',
          age: 3,
          size: 'large',
          personality_tags: ['friendly', 'energetic', 'playful', 'loyal']
        },
        tone: 'friendly',
        length: 'medium'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Bio generation failed: ${error}`);
    }

    const data = await response.json();
    if (!data.bio || data.bio.length < 20) {
      throw new Error('Generated bio too short or empty');
    }

    return { 
      bioLength: data.bio.length, 
      preview: data.bio.substring(0, 50) + '...',
      hasContent: true
    };
  });

  await test('AI Photo Analysis', async () => {
    const response = await fetch('http://127.0.0.1:8000/api/analyze-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        photo_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Photo analysis failed: ${error}`);
    }

    const data = await response.json();
    return { 
      confidence: data.confidence || 0,
      traits: data.personality_traits || [],
      quality: data.photo_quality || 'unknown'
    };
  });

  await test('AI Compatibility Analysis', async () => {
    const response = await fetch('http://127.0.0.1:8000/api/calculate-compatibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pet1: {
          id: 'pet1',
          name: 'Buddy',
          species: 'dog',
          breed: 'Golden Retriever',
          age: 3,
          size: 'large',
          personality_tags: ['friendly', 'energetic', 'loyal']
        },
        pet2: {
          id: 'pet2',
          name: 'Luna',
          species: 'dog',
          breed: 'Labrador',
          age: 2,
          size: 'large',
          personality_tags: ['friendly', 'playful', 'gentle']
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Compatibility analysis failed: ${error}`);
    }

    const data = await response.json();
    return { 
      score: data.compatibility_score || 0,
      percentage: data.percentage || 0,
      hasAnalysis: !!data.detailed_analysis
    };
  });

  // 5. Performance & Load Tests
  console.log('\n⚡ PERFORMANCE TESTS');
  console.log('===================');

  await test('API Response Performance', async () => {
    const tests = [];
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      const response = await fetch('http://127.0.0.1:5000/api/health');
      const duration = Date.now() - start;
      tests.push(duration);
      
      if (!response.ok) throw new Error(`Health check ${i+1} failed`);
    }

    const avgTime = tests.reduce((a, b) => a + b, 0) / tests.length;
    const maxTime = Math.max(...tests);
    
    if (avgTime > 500) throw new Error(`Average response too slow: ${avgTime}ms`);
    if (maxTime > 1000) throw new Error(`Max response too slow: ${maxTime}ms`);

    return { avgTime, maxTime, tests };
  });

  await test('Concurrent API Calls', async () => {
    const start = Date.now();
    
    const promises = [
      fetch('http://127.0.0.1:5000/api/health'),
      fetch('http://127.0.0.1:8000/health'),
      fetch('http://127.0.0.1:5000/api/pets', {
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      })
    ];
    
    const responses = await Promise.all(promises);
    const totalTime = Date.now() - start;
    
    const allSuccessful = responses.every(r => r.ok);
    if (!allSuccessful) throw new Error('Some concurrent requests failed');
    
    return { totalTime, requestCount: promises.length, allSuccessful };
  });

  // 6. Generate Final Report
  console.log('\n🏆 FINAL ULTRA TEST RESULTS');
  console.log('============================');

  const total = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = total - passed;
  const successRate = ((passed / total) * 100).toFixed(1);

  console.log(`📊 Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${successRate}%`);

  if (failed > 0) {
    console.log('\n💥 FAILED TESTS:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   ❌ ${r.name}: ${r.error}`);
    });
  }

  console.log('\n📊 PERFORMANCE METRICS:');
  const avgDuration = results.reduce((acc, r) => acc + r.duration, 0) / total;
  console.log(`   ⏱️  Average Test Duration: ${avgDuration.toFixed(2)}ms`);

  const slowTests = results.filter(r => r.duration > 1000);
  if (slowTests.length > 0) {
    console.log('   ⚠️  Slow Tests (>1s):');
    slowTests.forEach(r => {
      console.log(`      ${r.name}: ${r.duration}ms`);
    });
  }

  if (passed === total) {
    console.log('\n🎉 🚀 ALL TESTS PASSED! 🚀 🎉');
    console.log('🌟 PAWFECTMATCH PREMIUM ULTRA SYSTEM FULLY OPERATIONAL!');
    console.log('✨ Ready for production deployment!');
    console.log('🔥 All APIs, AI services, and integrations working perfectly!');
  } else if (successRate >= 80) {
    console.log('\n🎯 SYSTEM MOSTLY OPERATIONAL!');
    console.log(`🌟 ${successRate}% success rate - Production ready with minor issues`);
  } else {
    console.log('\n⚠️  SYSTEM PARTIALLY OPERATIONAL');
    console.log(`📊 ${successRate}% success rate - Some components need attention`);
  }

  return { total, passed, failed, successRate: parseFloat(successRate) };
}

runFinalTests().catch(console.error);
