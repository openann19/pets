#!/usr/bin/env node

/**
 * 🚀 QUICK ULTRA TEST - All Services Live Test
 */

const https = require('https');
const http = require('http');

async function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 5000
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
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function runQuickTests() {
  console.log('🚀 QUICK ULTRA TESTING - ALL SERVICES');
  console.log('=====================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, testFn) {
    total++;
    try {
      console.log(`🧪 ${name}...`);
      const result = await testFn();
      console.log(`✅ ${name} - PASSED`);
      if (result && typeof result === 'object') {
        console.log(`   📊 ${JSON.stringify(result).substring(0, 100)}...`);
      }
      passed++;
    } catch (error) {
      console.log(`❌ ${name} - FAILED: ${error.message}`);
    }
  }

  // 1. Health Checks
  await test('Backend Health Check', async () => {
    const response = await fetch('http://localhost:5000/api/health');
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    return await response.json();
  });

  await test('AI Service Health Check', async () => {
    const response = await fetch('http://localhost:8000/health');
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    return await response.json();
  });

  await test('Frontend Accessibility', async () => {
    const response = await fetch('http://localhost:3000');
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    return { accessible: true };
  });

  // 2. Authentication Tests
  let authToken = null;

  await test('User Registration', async () => {
    const testUser = {
      email: `test-${Date.now()}@pawfectmatch.com`,
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1990-01-01'
    };

    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Registration failed: ${error}`);
    }

    const data = await response.json();
    if (data.token) authToken = data.token;
    return { registered: true, hasToken: !!data.token };
  });

  await test('User Login', async () => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
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
    if (data.token) authToken = data.token;
    return { loggedIn: true, hasToken: !!data.token };
  });

  // 3. API Endpoint Tests
  await test('Get Pets Endpoint', async () => {
    const response = await fetch('http://localhost:5000/api/pets', {
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
    });

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    return { petsCount: data.length || 0 };
  });

  await test('Create Pet', async () => {
    const testPet = {
      name: 'Ultra Test Pet',
      species: 'dog',
      breed: 'Test Breed',
      age: 3,
      size: 'medium',
      photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'],
      bio: 'Ultra testing pet for comprehensive validation',
      personality: ['friendly', 'playful', 'energetic']
    };

    const response = await fetch('http://localhost:5000/api/pets', {
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
    return { petId: data.id || data._id, name: data.name };
  });

  // 4. AI Service Tests
  await test('AI Bio Generation', async () => {
    const response = await fetch('http://localhost:8000/api/generate-bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pet: {
          id: 'test-pet-1',
          name: 'Buddy',
          species: 'dog',
          breed: 'Golden Retriever',
          age: 3,
          size: 'large',
          personality_tags: ['friendly', 'energetic', 'playful']
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
    return { bioLength: data.bio?.length || 0, hasContent: !!data.bio };
  });

  await test('AI Photo Analysis', async () => {
    const response = await fetch('http://localhost:8000/api/analyze-photo', {
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
      hasTraits: !!(data.personality_traits && data.personality_traits.length > 0)
    };
  });

  await test('AI Compatibility Score', async () => {
    const response = await fetch('http://localhost:8000/api/calculate-compatibility', {
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
          personality_tags: ['friendly', 'energetic']
        },
        pet2: {
          id: 'pet2',
          name: 'Luna',
          species: 'dog',
          breed: 'Labrador',
          age: 2,
          size: 'large',
          personality_tags: ['friendly', 'playful']
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Compatibility calculation failed: ${error}`);
    }

    const data = await response.json();
    return { 
      score: data.compatibility_score || 0,
      percentage: data.percentage || 0
    };
  });

  // 5. Performance Test
  await test('API Response Time', async () => {
    const start = Date.now();
    const response = await fetch('http://localhost:5000/api/health');
    const duration = Date.now() - start;
    
    if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
    if (duration > 1000) throw new Error(`Too slow: ${duration}ms`);
    
    return { responseTime: duration };
  });

  // Results
  console.log('\n🏆 QUICK ULTRA TEST RESULTS');
  console.log('===========================');
  console.log(`📊 Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${total - passed}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED! ULTRA SYSTEM FULLY OPERATIONAL! 🚀');
    console.log('🌟 PawfectMatch Premium is ready for production!');
  } else {
    console.log('\n⚠️  Some tests failed. System partially operational.');
  }

  return { passed, total, successRate: (passed / total) * 100 };
}

runQuickTests().catch(console.error);
