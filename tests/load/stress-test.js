import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Stress test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 100 },  // Ramp up to 100 users
    { duration: '2m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 200 },  // Ramp up to 200 users
    { duration: '2m', target: 200 },  // Stay at 200 users
    { duration: '1m', target: 300 },  // Ramp up to 300 users
    { duration: '2m', target: 300 },  // Stay at 300 users
    { duration: '1m', target: 500 },  // Ramp up to 500 users
    { duration: '3m', target: 500 },  // Stay at 500 users (stress point)
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests must complete below 5s
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
    errors: ['rate<0.15'],             // Custom error rate must be below 15%
  },
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_URL = __ENV.API_URL || 'http://localhost:5001';

export default function () {
  // Stress test scenarios
  const scenarios = [
    stressTestHomePage,
    stressTestAPI,
    stressTestDatabase,
    stressTestFileUpload,
    stressTestWebSocket,
  ];

  // Execute multiple scenarios per iteration
  const numScenarios = Math.floor(Math.random() * 3) + 1; // 1-3 scenarios per iteration
  for (let i = 0; i < numScenarios; i++) {
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    scenario();
  }

  sleep(0.5); // Shorter sleep for stress testing
}

function stressTestHomePage() {
  const startTime = Date.now();
  const response = http.get(`${BASE_URL}/`);
  const duration = Date.now() - startTime;
  
  responseTime.add(duration);
  
  const success = check(response, {
    'homepage stress test': (r) => r.status === 200,
    'response time recorded': (r) => true,
  });

  if (!success) {
    errorRate.add(1);
  }
}

function stressTestAPI() {
  const endpoints = [
    '/api/pets',
    '/api/users/profile',
    '/api/matches',
    '/api/premium/features',
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const startTime = Date.now();
  const response = http.get(`${API_URL}${endpoint}`);
  const duration = Date.now() - startTime;
  
  responseTime.add(duration);

  check(response, {
    'API stress test': (r) => r.status < 500,
    'API response time': (r) => r.timings.duration < 10000, // 10s max for stress test
  });
}

function stressTestDatabase() {
  // Simulate database-heavy operations
  const queries = [
    { endpoint: '/api/pets/search', params: { q: 'dog', limit: 100 } },
    { endpoint: '/api/matches', params: { userId: 'test-user' } },
    { endpoint: '/api/users', params: { page: 1, limit: 50 } },
  ];

  const query = queries[Math.floor(Math.random() * queries.length)];
  const response = http.get(`${API_URL}${query.endpoint}`, {
    params: query.params,
  });

  check(response, {
    'database stress test': (r) => r.status < 500,
    'database response time': (r) => r.timings.duration < 15000, // 15s max for DB operations
  });
}

function stressTestFileUpload() {
  // Simulate file upload stress
  const payload = {
    file: http.file('test-image.jpg', 'fake-image-data', 'image/jpeg'),
  };

  const response = http.post(`${API_URL}/api/upload`, payload);

  check(response, {
    'file upload stress test': (r) => r.status < 500,
    'upload response time': (r) => r.timings.duration < 30000, // 30s max for uploads
  });
}

function stressTestWebSocket() {
  // Simulate WebSocket connection stress
  // Note: k6 doesn't support WebSocket natively, so we simulate with HTTP
  const response = http.get(`${API_URL}/api/ws/status`);

  check(response, {
    'WebSocket stress test': (r) => r.status < 500,
    'WebSocket response time': (r) => r.timings.duration < 5000,
  });
}

// Setup function
export function setup() {
  console.log('🔥 Starting PawfectMatch Stress Test');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API URL: ${API_URL}`);
  
  // Pre-stress health check
  const healthResponse = http.get(`${API_URL}/api/health`);
  if (healthResponse.status !== 200) {
    console.error('❌ Pre-stress health check failed');
    return false;
  }
  
  console.log('✅ Pre-stress health check passed');
  console.log('⚠️  This is a stress test - expect higher response times and error rates');
  return true;
}

// Teardown function
export function teardown(data) {
  console.log('🏁 PawfectMatch Stress Test completed');
  console.log('📊 Analyze results for breaking points and performance degradation');
  
  // Post-stress health check
  const healthResponse = http.get(`${API_URL}/api/health`);
  if (healthResponse.status === 200) {
    console.log('✅ Post-stress health check passed - system recovered');
  } else {
    console.error('❌ Post-stress health check failed - system may need recovery time');
  }
}