import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.05'],    // Error rate must be below 5%
    errors: ['rate<0.1'],              // Custom error rate must be below 10%
  },
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_URL = __ENV.API_URL || 'http://localhost:5001';

export default function () {
  // Test scenarios
  const scenarios = [
    testHomePage,
    testAuthFlow,
    testPetMatching,
    testPremiumFeatures,
    testAPIEndpoints,
  ];

  // Randomly select a scenario
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  scenario();

  sleep(1);
}

function testHomePage() {
  const response = http.get(`${BASE_URL}/`);
  
  const success = check(response, {
    'homepage loads successfully': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
    'contains expected content': (r) => r.body.includes('PawfectMatch'),
  });

  if (!success) {
    errorRate.add(1);
  }
}

function testAuthFlow() {
  // Test login page
  const loginResponse = http.get(`${BASE_URL}/login`);
  
  check(loginResponse, {
    'login page loads': (r) => r.status === 200,
    'login form present': (r) => r.body.includes('email') && r.body.includes('password'),
  });

  // Test registration page
  const registerResponse = http.get(`${BASE_URL}/register`);
  
  check(registerResponse, {
    'register page loads': (r) => r.status === 200,
    'register form present': (r) => r.body.includes('firstName') && r.body.includes('lastName'),
  });
}

function testPetMatching() {
  // Test pet matching API
  const petsResponse = http.get(`${API_URL}/api/pets`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  check(petsResponse, {
    'pets API responds': (r) => r.status === 200,
    'pets data structure': (r) => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data.pets) || Array.isArray(data);
      } catch {
        return false;
      }
    },
  });
}

function testPremiumFeatures() {
  // Test premium page
  const premiumResponse = http.get(`${BASE_URL}/premium`);
  
  check(premiumResponse, {
    'premium page loads': (r) => r.status === 200,
    'premium content present': (r) => r.body.includes('Premium') || r.status === 302, // Redirect for non-auth users
  });
}

function testAPIEndpoints() {
  const endpoints = [
    '/api/health',
    '/api/pets',
    '/api/users/profile',
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const response = http.get(`${API_URL}${endpoint}`);

  check(response, {
    'API endpoint responds': (r) => r.status < 500,
    'response time acceptable': (r) => r.timings.duration < 1000,
  });
}

// Setup function - runs once before the test
export function setup() {
  console.log('🚀 Starting PawfectMatch Load Test');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API URL: ${API_URL}`);
  
  // Health check
  const healthResponse = http.get(`${API_URL}/api/health`);
  if (healthResponse.status !== 200) {
    console.error('❌ API health check failed');
    return false;
  }
  
  console.log('✅ API health check passed');
  return true;
}

// Teardown function - runs once after the test
export function teardown(data) {
  console.log('🏁 PawfectMatch Load Test completed');
  console.log('📊 Check the results for performance metrics');
}