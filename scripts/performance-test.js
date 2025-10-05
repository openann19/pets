#!/usr/bin/env node

/**
 * Performance and Load Testing Script
 * Tests API endpoints under various load conditions
 * 
 * Usage: node scripts/performance-test.js
 */

const http = require('http');
const https = require('https');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

// Configuration
const config = {
  baseUrl: process.env.API_URL || 'http://localhost:5001',
  concurrentRequests: parseInt(process.env.CONCURRENT_REQUESTS) || 10,
  totalRequests: parseInt(process.env.TOTAL_REQUESTS) || 100,
  timeout: parseInt(process.env.REQUEST_TIMEOUT) || 5000
};

// Test results
const results = {
  total: 0,
  successful: 0,
  failed: 0,
  responseTimes: [],
  errors: {}
};

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          responseTime,
          data
        });
      });
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      reject({
        error: error.message,
        responseTime
      });
    });
    
    req.setTimeout(config.timeout, () => {
      req.destroy();
      reject({
        error: 'Request timeout',
        responseTime: config.timeout
      });
    });
  });
}

/**
 * Run performance test for an endpoint
 */
async function testEndpoint(name, url, options = {}) {
  console.log(`\n${colors.cyan}Testing: ${name}${colors.reset}`);
  console.log(`URL: ${url}`);
  console.log(`Requests: ${config.totalRequests} (${config.concurrentRequests} concurrent)`);
  
  const testResults = {
    name,
    total: 0,
    successful: 0,
    failed: 0,
    responseTimes: [],
    errors: {}
  };
  
  const startTime = Date.now();
  const requests = [];
  
  // Create batches of concurrent requests
  for (let i = 0; i < config.totalRequests; i += config.concurrentRequests) {
    const batch = [];
    const batchSize = Math.min(config.concurrentRequests, config.totalRequests - i);
    
    for (let j = 0; j < batchSize; j++) {
      batch.push(
        makeRequest(url, options)
          .then(result => {
            testResults.successful++;
            testResults.responseTimes.push(result.responseTime);
          })
          .catch(error => {
            testResults.failed++;
            const errorKey = error.error || 'Unknown error';
            testResults.errors[errorKey] = (testResults.errors[errorKey] || 0) + 1;
            testResults.responseTimes.push(error.responseTime || 0);
          })
      );
    }
    
    testResults.total += batch.length;
    await Promise.all(batch);
    
    // Progress indicator
    process.stdout.write(`\rProgress: ${testResults.total}/${config.totalRequests}`);
  }
  
  const totalTime = Date.now() - startTime;
  
  // Calculate statistics
  testResults.responseTimes.sort((a, b) => a - b);
  const avgTime = testResults.responseTimes.reduce((sum, t) => sum + t, 0) / testResults.responseTimes.length;
  const minTime = testResults.responseTimes[0];
  const maxTime = testResults.responseTimes[testResults.responseTimes.length - 1];
  const p50 = testResults.responseTimes[Math.floor(testResults.responseTimes.length * 0.5)];
  const p95 = testResults.responseTimes[Math.floor(testResults.responseTimes.length * 0.95)];
  const p99 = testResults.responseTimes[Math.floor(testResults.responseTimes.length * 0.99)];
  const requestsPerSecond = (testResults.total / totalTime * 1000).toFixed(2);
  
  // Print results
  console.log(`\n\n${colors.cyan}Results for ${name}:${colors.reset}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total Requests:    ${testResults.total}`);
  console.log(`Successful:        ${colors.green}${testResults.successful}${colors.reset} (${(testResults.successful/testResults.total*100).toFixed(2)}%)`);
  console.log(`Failed:            ${testResults.failed > 0 ? colors.red : ''}${testResults.failed}${colors.reset} (${(testResults.failed/testResults.total*100).toFixed(2)}%)`);
  console.log(`Total Time:        ${totalTime}ms`);
  console.log(`Requests/sec:      ${requestsPerSecond}`);
  console.log(`\nResponse Times:`);
  console.log(`  Min:             ${minTime}ms`);
  console.log(`  Average:         ${avgTime.toFixed(2)}ms`);
  console.log(`  Max:             ${maxTime}ms`);
  console.log(`  Median (p50):    ${p50}ms`);
  console.log(`  95th percentile: ${p95}ms`);
  console.log(`  99th percentile: ${p99}ms`);
  
  if (Object.keys(testResults.errors).length > 0) {
    console.log(`\n${colors.red}Errors:${colors.reset}`);
    Object.entries(testResults.errors).forEach(([error, count]) => {
      console.log(`  ${error}: ${count}`);
    });
  }
  
  return testResults;
}

/**
 * Main test suite
 */
async function runTests() {
  console.log(`\n${colors.cyan}${'='.repeat(70)}`);
  console.log(`       PERFORMANCE & LOAD TESTING - PAWFECTMATCH API`);
  console.log(`${'='.repeat(70)}${colors.reset}\n`);
  
  console.log(`Configuration:`);
  console.log(`  Base URL:             ${config.baseUrl}`);
  console.log(`  Total Requests:       ${config.totalRequests}`);
  console.log(`  Concurrent Requests:  ${config.concurrentRequests}`);
  console.log(`  Timeout:              ${config.timeout}ms`);
  
  const allResults = [];
  
  try {
    // Test 1: Health endpoint
    allResults.push(await testEndpoint(
      'Health Check',
      `${config.baseUrl}/health`
    ));
    
    // Test 2: API health endpoint
    allResults.push(await testEndpoint(
      'API Health Check',
      `${config.baseUrl}/api/health`
    ));
    
    // You can add more endpoints here:
    // - Pet discovery (requires auth)
    // - User profile (requires auth)
    // - etc.
    
    // Summary
    console.log(`\n\n${colors.cyan}${'='.repeat(70)}`);
    console.log(`                       OVERALL SUMMARY`);
    console.log(`${'='.repeat(70)}${colors.reset}\n`);
    
    const totalRequests = allResults.reduce((sum, r) => sum + r.total, 0);
    const totalSuccessful = allResults.reduce((sum, r) => sum + r.successful, 0);
    const totalFailed = allResults.reduce((sum, r) => sum + r.failed, 0);
    
    console.log(`Total Tests:       ${allResults.length}`);
    console.log(`Total Requests:    ${totalRequests}`);
    console.log(`Total Successful:  ${colors.green}${totalSuccessful}${colors.reset} (${(totalSuccessful/totalRequests*100).toFixed(2)}%)`);
    console.log(`Total Failed:      ${totalFailed > 0 ? colors.red : ''}${totalFailed}${colors.reset} (${(totalFailed/totalRequests*100).toFixed(2)}%)`);
    
    // Overall assessment
    const successRate = (totalSuccessful / totalRequests * 100);
    console.log(`\n${colors.cyan}Assessment:${colors.reset}`);
    if (successRate >= 99) {
      console.log(`${colors.green}✅ EXCELLENT - System is performing very well${colors.reset}`);
    } else if (successRate >= 95) {
      console.log(`${colors.green}✅ GOOD - System is performing well${colors.reset}`);
    } else if (successRate >= 90) {
      console.log(`${colors.yellow}⚠️  ACCEPTABLE - Some issues detected${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ POOR - System needs optimization${colors.reset}`);
    }
    
    console.log(`\n${colors.cyan}${'='.repeat(70)}${colors.reset}\n`);
    
    process.exit(totalFailed > totalSuccessful ? 1 : 0);
    
  } catch (error) {
    console.error(`\n${colors.red}Test suite failed:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run tests
console.log('Starting performance tests...\n');
runTests();

