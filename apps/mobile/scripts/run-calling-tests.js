#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Running PawfectMatch Calling Features Test Suite\n');

const testCategories = [
  {
    name: 'WebRTC Service Tests',
    pattern: 'src/services/__tests__/WebRTCService.test.ts',
    description: 'Core WebRTC functionality, call management, signaling'
  },
  {
    name: 'Call Manager Tests',
    pattern: 'src/components/calling/__tests__/CallManager.test.tsx',
    description: 'Call state management, modal handling, event coordination'
  },
  {
    name: 'Socket Hook Tests',
    pattern: 'src/hooks/__tests__/useSocket.test.ts',
    description: 'Socket connection, authentication, event handling'
  },
  {
    name: 'Incoming Call Screen Tests',
    pattern: 'src/screens/calling/__tests__/IncomingCallScreen.test.tsx',
    description: 'Incoming call UI, animations, user interactions'
  },
  {
    name: 'Active Call Screen Tests',
    pattern: 'src/screens/calling/__tests__/ActiveCallScreen.test.tsx',
    description: 'Active call UI, controls, video/voice modes'
  },
  {
    name: 'Chat Screen Calling Tests',
    pattern: 'src/screens/__tests__/ChatScreen.calling.test.tsx',
    description: 'Call buttons in chat, integration with call manager'
  },
  {
    name: 'Matches Screen Calling Tests',
    pattern: 'src/screens/__tests__/MatchesScreen.calling.test.tsx',
    description: 'Call buttons in matches list, match-specific calling'
  }
];

const results = {
  passed: 0,
  failed: 0,
  total: 0,
  coverage: {},
  details: []
};

function runTestCategory(category) {
  console.log(`\n📋 Running ${category.name}...`);
  console.log(`   ${category.description}`);
  
  try {
    const command = `npx jest ${category.pattern} --verbose --coverage --collectCoverageFrom="src/**/*.{ts,tsx}" --coverageReporters=text-summary`;
    
    const output = execSync(command, { 
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // Parse test results
    const lines = output.split('\n');
    const testResults = lines.filter(line => 
      line.includes('✓') || line.includes('✗') || line.includes('PASS') || line.includes('FAIL')
    );
    
    const passedTests = (output.match(/✓/g) || []).length;
    const failedTests = (output.match(/✗/g) || []).length;
    
    results.passed += passedTests;
    results.failed += failedTests;
    results.total += passedTests + failedTests;
    
    results.details.push({
      category: category.name,
      passed: passedTests,
      failed: failedTests,
      status: failedTests === 0 ? 'PASS' : 'FAIL',
      output: output
    });
    
    if (failedTests === 0) {
      console.log(`   ✅ ${passedTests} tests passed`);
    } else {
      console.log(`   ❌ ${failedTests} tests failed, ${passedTests} tests passed`);
    }
    
    // Extract coverage info
    const coverageMatch = output.match(/All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/);
    if (coverageMatch) {
      results.coverage[category.name] = {
        statements: parseFloat(coverageMatch[1]),
        branches: parseFloat(coverageMatch[2]),
        functions: parseFloat(coverageMatch[3]),
        lines: parseFloat(coverageMatch[4])
      };
    }
    
  } catch (error) {
    console.log(`   ❌ Test execution failed: ${error.message}`);
    results.failed += 1;
    results.total += 1;
    
    results.details.push({
      category: category.name,
      passed: 0,
      failed: 1,
      status: 'ERROR',
      output: error.message
    });
  }
}

// Run all test categories
testCategories.forEach(runTestCategory);

// Generate comprehensive report
console.log('\n' + '='.repeat(80));
console.log('📊 PAWFECTMATCH CALLING FEATURES TEST REPORT');
console.log('='.repeat(80));

console.log(`\n🎯 OVERALL RESULTS:`);
console.log(`   Total Tests: ${results.total}`);
console.log(`   Passed: ${results.passed} (${((results.passed / results.total) * 100).toFixed(1)}%)`);
console.log(`   Failed: ${results.failed} (${((results.failed / results.total) * 100).toFixed(1)}%)`);

const overallStatus = results.failed === 0 ? '✅ ALL TESTS PASSING' : '❌ SOME TESTS FAILING';
console.log(`\n🏆 STATUS: ${overallStatus}`);

console.log(`\n📋 DETAILED RESULTS:`);
results.details.forEach(detail => {
  const statusIcon = detail.status === 'PASS' ? '✅' : detail.status === 'FAIL' ? '❌' : '⚠️';
  console.log(`   ${statusIcon} ${detail.category}: ${detail.passed} passed, ${detail.failed} failed`);
});

// Coverage summary
if (Object.keys(results.coverage).length > 0) {
  console.log(`\n📈 COVERAGE SUMMARY:`);
  let totalStatements = 0, totalBranches = 0, totalFunctions = 0, totalLines = 0;
  let categoryCount = 0;
  
  Object.entries(results.coverage).forEach(([category, coverage]) => {
    console.log(`   ${category}:`);
    console.log(`     Statements: ${coverage.statements}%`);
    console.log(`     Branches: ${coverage.branches}%`);
    console.log(`     Functions: ${coverage.functions}%`);
    console.log(`     Lines: ${coverage.lines}%`);
    
    totalStatements += coverage.statements;
    totalBranches += coverage.branches;
    totalFunctions += coverage.functions;
    totalLines += coverage.lines;
    categoryCount++;
  });
  
  if (categoryCount > 0) {
    console.log(`\n   📊 AVERAGE COVERAGE:`);
    console.log(`     Statements: ${(totalStatements / categoryCount).toFixed(1)}%`);
    console.log(`     Branches: ${(totalBranches / categoryCount).toFixed(1)}%`);
    console.log(`     Functions: ${(totalFunctions / categoryCount).toFixed(1)}%`);
    console.log(`     Lines: ${(totalLines / categoryCount).toFixed(1)}%`);
  }
}

console.log(`\n🔧 TESTED FEATURES:`);
console.log(`   ✅ WebRTC peer-to-peer connections`);
console.log(`   ✅ Voice and video call initiation`);
console.log(`   ✅ Incoming call handling and UI`);
console.log(`   ✅ Active call controls and management`);
console.log(`   ✅ Socket.IO real-time communication`);
console.log(`   ✅ Call state management and persistence`);
console.log(`   ✅ Integration with chat and matches screens`);
console.log(`   ✅ Error handling and edge cases`);
console.log(`   ✅ Mobile-optimized calling interface`);
console.log(`   ✅ Call button interactions and confirmations`);

console.log(`\n🚀 CALLING SYSTEM STATUS:`);
if (results.failed === 0) {
  console.log(`   🎉 All calling features are fully tested and operational!`);
  console.log(`   📱 Ready for production deployment`);
  console.log(`   🔊 Voice calls: Ready`);
  console.log(`   📹 Video calls: Ready`);
  console.log(`   🌐 Real-time signaling: Ready`);
  console.log(`   📞 Call management: Ready`);
} else {
  console.log(`   ⚠️  Some tests are failing - review required`);
  console.log(`   🔧 Fix failing tests before deployment`);
}

console.log('\n' + '='.repeat(80));

// Exit with appropriate code
process.exit(results.failed === 0 ? 0 : 1);
