#!/usr/bin/env node

/**
 * Comprehensive Button and Functionality Test
 * Tests all interactive elements across all pages
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const PAGES = [
  '/',
  '/login',
  '/register',
  '/dashboard',
  '/map',
  '/swipe',
  '/matches',
  '/chat',
  '/profile',
  '/pets',
  '/my-pets',
  '/premium',
  '/system-status'
];

const TEST_RESULTS = {
  passed: 0,
  failed: 0,
  errors: [],
  details: []
};

async function testPage(browser, pagePath) {
  console.log(`\n🧪 Testing page: ${pagePath}`);
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to page
    await page.goto(`${BASE_URL}${pagePath}`, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Test all buttons
    const buttons = await page.$$('button');
    console.log(`  Found ${buttons.length} buttons`);
    
    for (let i = 0; i < buttons.length; i++) {
      try {
        const button = buttons[i];
        const isVisible = await button.isIntersectingViewport();
        const isEnabled = await button.isEnabled();
        const text = await button.textContent();
        
        if (isVisible && isEnabled) {
          // Test button click
          await button.click();
          await page.waitForTimeout(500);
          
          TEST_RESULTS.passed++;
          console.log(`    ✅ Button "${text?.substring(0, 30)}..." - Clickable`);
        } else {
          TEST_RESULTS.failed++;
          console.log(`    ❌ Button "${text?.substring(0, 30)}..." - Not clickable (visible: ${isVisible}, enabled: ${isEnabled})`);
        }
      } catch (error) {
        TEST_RESULTS.failed++;
        TEST_RESULTS.errors.push(`Button test error on ${pagePath}: ${error.message}`);
        console.log(`    ❌ Button test failed: ${error.message}`);
      }
    }
    
    // Test all links
    const links = await page.$$('a[href]');
    console.log(`  Found ${links.length} links`);
    
    for (let i = 0; i < links.length; i++) {
      try {
        const link = links[i];
        const isVisible = await link.isIntersectingViewport();
        const href = await link.getAttribute('href');
        
        if (isVisible && href && !href.startsWith('#')) {
          TEST_RESULTS.passed++;
          console.log(`    ✅ Link "${href}" - Clickable`);
        } else {
          TEST_RESULTS.failed++;
          console.log(`    ❌ Link "${href}" - Not clickable (visible: ${isVisible})`);
        }
      } catch (error) {
        TEST_RESULTS.failed++;
        TEST_RESULTS.errors.push(`Link test error on ${pagePath}: ${error.message}`);
        console.log(`    ❌ Link test failed: ${error.message}`);
      }
    }
    
    // Test form inputs
    const inputs = await page.$$('input, textarea, select');
    console.log(`  Found ${inputs.length} form inputs`);
    
    for (let i = 0; i < inputs.length; i++) {
      try {
        const input = inputs[i];
        const isVisible = await input.isIntersectingViewport();
        const isEnabled = await input.isEnabled();
        const type = await input.getAttribute('type') || 'text';
        
        if (isVisible && isEnabled) {
          // Test input interaction
          await input.click();
          await input.type('test');
          await page.waitForTimeout(200);
          
          TEST_RESULTS.passed++;
          console.log(`    ✅ Input (${type}) - Interactive`);
        } else {
          TEST_RESULTS.failed++;
          console.log(`    ❌ Input (${type}) - Not interactive (visible: ${isVisible}, enabled: ${isEnabled})`);
        }
      } catch (error) {
        TEST_RESULTS.failed++;
        TEST_RESULTS.errors.push(`Input test error on ${pagePath}: ${error.message}`);
        console.log(`    ❌ Input test failed: ${error.message}`);
      }
    }
    
    // Check for JavaScript errors
    const jsErrors = await page.evaluate(() => {
      return window.jsErrors || [];
    });
    
    if (jsErrors.length > 0) {
      TEST_RESULTS.errors.push(`JavaScript errors on ${pagePath}: ${jsErrors.join(', ')}`);
      console.log(`    ⚠️  JavaScript errors: ${jsErrors.length}`);
    }
    
    // Check page performance
    const performance = await page.evaluate(() => {
      return {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
      };
    });
    
    TEST_RESULTS.details.push({
      page: pagePath,
      buttons: buttons.length,
      links: links.length,
      inputs: inputs.length,
      jsErrors: jsErrors.length,
      loadTime: performance.loadTime,
      domContentLoaded: performance.domContentLoaded
    });
    
    await page.close();
    
  } catch (error) {
    TEST_RESULTS.failed++;
    TEST_RESULTS.errors.push(`Page test error for ${pagePath}: ${error.message}`);
    console.log(`  ❌ Page test failed: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting Comprehensive Button and Functionality Tests');
  console.log('=' .repeat(60));
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Listen for JavaScript errors
  browser.on('targetcreated', async (target) => {
    const page = await target.page();
    if (page) {
      page.on('pageerror', (error) => {
        if (!page._jsErrors) page._jsErrors = [];
        page._jsErrors.push(error.message);
      });
      
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          if (!page._jsErrors) page._jsErrors = [];
          page._jsErrors.push(msg.text());
        }
      });
    }
  });
  
  for (const pagePath of PAGES) {
    await testPage(browser, pagePath);
  }
  
  await browser.close();
  
  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${TEST_RESULTS.passed}`);
  console.log(`❌ Failed: ${TEST_RESULTS.failed}`);
  console.log(`⚠️  Errors: ${TEST_RESULTS.errors.length}`);
  
  if (TEST_RESULTS.errors.length > 0) {
    console.log('\n🚨 ERRORS:');
    TEST_RESULTS.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  console.log('\n📋 DETAILED RESULTS:');
  TEST_RESULTS.details.forEach(detail => {
    console.log(`\n${detail.page}:`);
    console.log(`  Buttons: ${detail.buttons}`);
    console.log(`  Links: ${detail.links}`);
    console.log(`  Inputs: ${detail.inputs}`);
    console.log(`  JS Errors: ${detail.jsErrors}`);
    console.log(`  Load Time: ${detail.loadTime}ms`);
    console.log(`  DOM Ready: ${detail.domContentLoaded}ms`);
  });
  
  // Save results to file
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      passed: TEST_RESULTS.passed,
      failed: TEST_RESULTS.failed,
      total: TEST_RESULTS.passed + TEST_RESULTS.failed
    },
    errors: TEST_RESULTS.errors,
    details: TEST_RESULTS.details
  };
  
  fs.writeFileSync('button-test-results.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Results saved to button-test-results.json');
  
  // Exit with appropriate code
  process.exit(TEST_RESULTS.failed > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

// Run tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
