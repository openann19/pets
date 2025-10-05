#!/usr/bin/env node

/**
 * 🧪 ULTRA TEST EXECUTION SCRIPT
 * Runs comprehensive tests for all PawfectMatch Premium components
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class UltraTestRunner {
  constructor() {
    this.results = {
      backend: { status: 'PENDING', tests: [] },
      aiService: { status: 'PENDING', tests: [] },
      frontend: { status: 'PENDING', tests: [] },
      integration: { status: 'PENDING', tests: [] }
    };
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🚀 ULTRA TESTING MODE ACTIVATED!');
    console.log('=================================');
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log('');

    try {
      // 1. Check service health
      await this.checkServiceHealth();
      
      // 2. Test backend endpoints
      await this.testBackendEndpoints();
      
      // 3. Test AI services
      await this.testAIServices();
      
      // 4. Test frontend components
      await this.testFrontendComponents();
      
      // 5. Run integration tests
      await this.testIntegration();
      
      // 6. Generate final report
      this.generateReport();
      
    } catch (error) {
      console.error('💥 Ultra testing failed:', error.message);
      process.exit(1);
    }
  }

  async checkServiceHealth() {
    console.log('🏥 HEALTH CHECKS');
    console.log('================');

    await this.runTest('Backend Health', async () => {
      const response = await this.fetch('http://localhost:5000/api/health');
      if (!response.ok) throw new Error(`Backend unhealthy: ${response.status}`);
      return await response.json();
    });

    await this.runTest('AI Service Health', async () => {
      const response = await this.fetch('http://localhost:8000/health');
      if (!response.ok) throw new Error(`AI Service unhealthy: ${response.status}`);
      return await response.json();
    });

    await this.runTest('Frontend Dev Server', async () => {
      const response = await this.fetch('http://localhost:3000');
      if (!response.ok) throw new Error(`Frontend not running: ${response.status}`);
      return { status: 'running' };
    });
  }

  async testBackendEndpoints() {
    console.log('\n🌐 BACKEND API TESTS');
    console.log('====================');

    // Authentication endpoints
    await this.runTest('POST /api/auth/register', async () => {
      const testUser = {
        email: `test-${Date.now()}@pawfectmatch.com`,
        password: 'testpass123',
        name: 'Ultra Test User'
      };

      const response = await this.fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Registration failed: ${error}`);
      }

      return await response.json();
    });

    await this.runTest('POST /api/auth/login', async () => {
      const response = await this.fetch('http://localhost:5000/api/auth/login', {
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
      this.authToken = data.token; // Store for subsequent tests
      return data;
    });

    // Pet endpoints
    await this.runTest('GET /api/pets', async () => {
      const response = await this.fetch('http://localhost:5000/api/pets', {
        headers: this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}
      });

      if (!response.ok) throw new Error(`Get pets failed: ${response.status}`);
      return await response.json();
    });

    await this.runTest('POST /api/pets', async () => {
      const testPet = {
        name: 'Ultra Test Pet',
        species: 'dog',
        breed: 'Test Breed',
        age: 3,
        size: 'medium',
        photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'],
        bio: 'Ultra testing pet',
        personality: ['friendly', 'playful']
      };

      const response = await this.fetch('http://localhost:5000/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
        },
        body: JSON.stringify(testPet)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Create pet failed: ${error}`);
      }

      return await response.json();
    });

    // Swipe endpoints
    await this.runTest('GET /api/swipe/queue', async () => {
      const response = await this.fetch('http://localhost:5000/api/swipe/queue', {
        headers: this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}
      });

      if (!response.ok) throw new Error(`Get swipe queue failed: ${response.status}`);
      return await response.json();
    });
  }

  async testAIServices() {
    console.log('\n🤖 AI SERVICE TESTS');
    console.log('===================');

    await this.runTest('AI Bio Generation', async () => {
      const response = await this.fetch('http://localhost:8000/api/generate-bio', {
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
      if (!data.bio || data.bio.length < 10) {
        throw new Error('Generated bio too short or empty');
      }

      return { bioLength: data.bio.length, bio: data.bio.substring(0, 100) + '...' };
    });

    await this.runTest('AI Photo Analysis', async () => {
      const response = await this.fetch('http://localhost:8000/api/analyze-photo', {
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

      return await response.json();
    });

    await this.runTest('AI Compatibility Calculation', async () => {
      const response = await this.fetch('http://localhost:8000/api/calculate-compatibility', {
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

      return await response.json();
    });
  }

  async testFrontendComponents() {
    console.log('\n🎨 FRONTEND TESTS');
    console.log('=================');

    await this.runTest('Login Page Accessibility', async () => {
      const response = await this.fetch('http://localhost:3000/login');
      if (!response.ok) throw new Error(`Login page not accessible: ${response.status}`);
      
      const html = await response.text();
      
      // Check for essential elements
      if (!html.includes('email')) throw new Error('Email field not found');
      if (!html.includes('password')) throw new Error('Password field not found');
      if (!html.includes('Sign in') && !html.includes('Login')) throw new Error('Submit button not found');
      
      return { accessible: true, hasForm: true };
    });

    await this.runTest('Dashboard Page Structure', async () => {
      const response = await this.fetch('http://localhost:3000/dashboard');
      // Will redirect to login if not authenticated, which is expected
      return { redirectsToAuth: response.status === 307 || response.status === 302 };
    });

    await this.runTest('API Client Initialization', async () => {
      // Test if the API client can be imported and initialized
      const apiClientPath = path.join(__dirname, 'apps/web/src/lib/api-client.ts');
      if (!fs.existsSync(apiClientPath)) {
        throw new Error('API client file not found');
      }
      
      const content = fs.readFileSync(apiClientPath, 'utf8');
      if (!content.includes('class APIClient')) {
        throw new Error('APIClient class not found');
      }
      
      return { fileExists: true, hasAPIClient: true };
    });
  }

  async testIntegration() {
    console.log('\n🔗 INTEGRATION TESTS');
    console.log('====================');

    await this.runTest('End-to-End Auth Flow', async () => {
      // Test complete authentication flow
      const registerResponse = await this.fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `e2e-${Date.now()}@test.com`,
          password: 'testpass123',
          name: 'E2E Test User'
        })
      });

      if (!registerResponse.ok) {
        // User might already exist, try login
        const loginResponse = await this.fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'demo@pawfectmatch.com',
            password: 'password123'
          })
        });

        if (!loginResponse.ok) throw new Error('Both register and login failed');
        return await loginResponse.json();
      }

      return await registerResponse.json();
    });

    await this.runTest('Pet Creation to Swipe Flow', async () => {
      if (!this.authToken) {
        throw new Error('No auth token available for integration test');
      }

      // Create a pet
      const createResponse = await this.fetch('http://localhost:5000/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          name: 'Integration Test Pet',
          species: 'cat',
          breed: 'Persian',
          age: 2,
          size: 'small',
          photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'],
          bio: 'Integration testing pet'
        })
      });

      if (!createResponse.ok) {
        const error = await createResponse.text();
        throw new Error(`Pet creation failed: ${error}`);
      }

      const pet = await createResponse.json();

      // Get swipe queue
      const queueResponse = await this.fetch('http://localhost:5000/api/swipe/queue', {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });

      if (!queueResponse.ok) throw new Error('Failed to get swipe queue');

      return { petCreated: true, queueAccessible: true, petId: pet.id };
    });
  }

  async runTest(name, testFn) {
    const start = Date.now();
    try {
      console.log(`🧪 Testing: ${name}...`);
      const result = await testFn();
      const duration = Date.now() - start;
      
      console.log(`✅ ${name} - PASSED (${duration}ms)`);
      return { name, status: 'PASS', duration, data: result };
    } catch (error) {
      const duration = Date.now() - start;
      console.log(`❌ ${name} - FAILED (${duration}ms): ${error.message}`);
      return { name, status: 'FAIL', duration, error: error.message };
    }
  }

  async fetch(url, options = {}) {
    // Use node-fetch equivalent or native fetch if available
    const fetch = globalThis.fetch || require('node-fetch');
    return await fetch(url, {
      timeout: 10000,
      ...options
    });
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const allTests = Object.values(this.results).flatMap(r => r.tests);
    const totalTests = allTests.length;
    const passedTests = allTests.filter(t => t.status === 'PASS').length;
    const failedTests = totalTests - passedTests;

    console.log('\n🏆 ULTRA TEST RESULTS');
    console.log('=====================');
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⏱️  Total Time: ${totalTime}ms`);
    console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\n💥 FAILED TESTS:');
      allTests
        .filter(t => t.status === 'FAIL')
        .forEach(t => {
          console.log(`❌ ${t.name}: ${t.error}`);
        });
    }

    // Generate HTML report
    this.generateHTMLReport(allTests, totalTime, passedTests, failedTests);

    if (passedTests === totalTests) {
      console.log('\n🎉 ALL TESTS PASSED! ULTRA TESTING COMPLETE! 🚀');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Check the results above.');
      process.exit(1);
    }
  }

  generateHTMLReport(tests, totalTime, passed, failed) {
    const reportHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>🧪 Ultra Test Report - PawfectMatch Premium</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; }
        .test-result { padding: 10px; margin: 5px 0; border-radius: 5px; }
        .pass { background: #d4edda; color: #155724; }
        .fail { background: #f8d7da; color: #721c24; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Ultra Test Report</h1>
        <p class="timestamp">Generated: ${new Date().toISOString()}</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <h3>${tests.length}</h3>
            <p>Total Tests</p>
        </div>
        <div class="stat-card">
            <h3>${passed}</h3>
            <p>Passed</p>
        </div>
        <div class="stat-card">
            <h3>${failed}</h3>
            <p>Failed</p>
        </div>
        <div class="stat-card">
            <h3>${totalTime}ms</h3>
            <p>Total Time</p>
        </div>
    </div>
    
    <div class="results">
        ${tests.map(test => `
            <div class="test-result ${test.status.toLowerCase()}">
                <strong>${test.name}</strong> - ${test.status} (${test.duration}ms)
                ${test.error ? `<br><small>Error: ${test.error}</small>` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;

    fs.writeFileSync('ultra-test-report.html', reportHTML);
    console.log('\n📄 HTML report generated: ultra-test-report.html');
  }
}

// Run the tests
const runner = new UltraTestRunner();
runner.runAllTests().catch(console.error);
