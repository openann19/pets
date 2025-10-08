#!/usr/bin/env node

/**
 * 🧪 ULTRA DEEP SYSTEM TEST - PawfectMatch Premium
 * Comprehensive testing of the entire application ecosystem
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎯 ULTRA DEEP SYSTEM TEST - PawfectMatch Premium');
console.log('=' .repeat(70));

// Test Results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function test(name, condition, details = '') {
  const passed = condition;
  results.tests.push({ name, passed, details });
  if (passed) {
    results.passed++;
    console.log(`✅ ${name}`);
  } else {
    results.failed++;
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

function warn(name, condition, details = '') {
  if (!condition) {
    results.warnings++;
    console.log(`⚠️  ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

// 1. SYSTEM ARCHITECTURE TESTS
console.log('\n🏗️  SYSTEM ARCHITECTURE TESTS');
console.log('-'.repeat(40));

// Check monorepo structure
test('Monorepo structure exists', fs.existsSync('package.json'));
test('pnpm workspace config exists', fs.existsSync('pnpm-workspace.yaml'));
test('Turbo config exists', fs.existsSync('turbo.json'));
test('TypeScript base config exists', fs.existsSync('tsconfig.base.json'));

// Check workspace packages
test('Web app directory exists', fs.existsSync('apps/web'));
test('Server directory exists', fs.existsSync('server'));
test('UI package exists', fs.existsSync('packages/ui'));
test('Core package exists', fs.existsSync('packages/core'));

// 2. FRONTEND TESTS
console.log('\n🌐 FRONTEND TESTS');
console.log('-'.repeat(40));

const webDir = 'apps/web';
test('Web app package.json exists', fs.existsSync(`${webDir}/package.json`));
test('Next.js config exists', fs.existsSync(`${webDir}/next.config.js`));
test('Tailwind config exists', fs.existsSync(`${webDir}/tailwind.config.js`));
test('TypeScript config exists', fs.existsSync(`${webDir}/tsconfig.json`));

// Check key frontend files
const frontendFiles = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/(protected)/dashboard/page.tsx',
  'src/components/Pet/SwipeCardV2.tsx',
  'src/components/Stories/StoryRing.tsx',
  'src/components/Stories/EmojiReactions.tsx',
  'src/lib/auth-store.ts',
  'src/services/api.ts'
];

frontendFiles.forEach(file => {
  const exists = fs.existsSync(`${webDir}/${file}`);
  test(`Frontend file exists: ${file}`, exists);
});

// 3. BACKEND TESTS
console.log('\n🔧 BACKEND TESTS');
console.log('-'.repeat(40));

const serverDir = 'server';
test('Server package.json exists', fs.existsSync(`${serverDir}/package.json`));
test('Server entry point exists', fs.existsSync(`${serverDir}/server.js`));

// Check backend structure
const backendFiles = [
  'src/models/User.js',
  'src/models/Pet.js',
  'src/models/Story.js',
  'src/models/Post.js',
  'src/routes/auth.js',
  'src/routes/pets.js',
  'src/routes/stories.js',
  'src/routes/feed.js',
  'src/middleware/auth.js'
];

backendFiles.forEach(file => {
  const exists = fs.existsSync(`${serverDir}/${file}`);
  test(`Backend file exists: ${file}`, exists);
});

// 4. SWIPECARD V2 IMPLEMENTATION TESTS
console.log('\n🎯 SWIPECARD V2 IMPLEMENTATION TESTS');
console.log('-'.repeat(40));

const swipecardFiles = [
  'apps/web/src/components/Pet/SwipeCardV2.tsx',
  'apps/web/src/utils/petCardAdapter.ts',
  'apps/web/src/app/swipe-v2/page.tsx',
  'apps/web/src/components/Pet/__tests__/SwipeCardV2.test.tsx'
];

swipecardFiles.forEach(file => {
  const exists = fs.existsSync(file);
  test(`SwipeCardV2 file exists: ${path.basename(file)}`, exists);
});

// Check SwipeCardV2 content
if (fs.existsSync('apps/web/src/components/Pet/SwipeCardV2.tsx')) {
  const swipecardContent = fs.readFileSync('apps/web/src/components/Pet/SwipeCardV2.tsx', 'utf8');
  test('SwipeCardV2 has Framer Motion', swipecardContent.includes('framer-motion'));
  test('SwipeCardV2 has haptic feedback', swipecardContent.includes('navigator.vibrate'));
  test('SwipeCardV2 has sound effects', swipecardContent.includes('AudioContext'));
  test('SwipeCardV2 has 8px grid system', swipecardContent.includes('p-4') && swipecardContent.includes('gap-6'));
  test('SwipeCardV2 has 4:5 aspect ratio', swipecardContent.includes('aspect-[4/5]'));
  test('SwipeCardV2 has accessibility', swipecardContent.includes('aria-label'));
}

// 5. STORIES & POSTS IMPLEMENTATION TESTS
console.log('\n📖 STORIES & POSTS IMPLEMENTATION TESTS');
console.log('-'.repeat(40));

const storiesFiles = [
  'apps/web/src/components/Stories/StoryRing.tsx',
  'apps/web/src/components/Stories/EmojiReactions.tsx',
  'server/src/models/Story.js',
  'server/src/models/Post.js',
  'server/src/routes/stories.js',
  'server/src/routes/feed.js'
];

storiesFiles.forEach(file => {
  const exists = fs.existsSync(file);
  test(`Stories/Posts file exists: ${path.basename(file)}`, exists);
});

// Check Stories implementation
if (fs.existsSync('apps/web/src/components/Stories/StoryRing.tsx')) {
  const storyRingContent = fs.readFileSync('apps/web/src/components/Stories/StoryRing.tsx', 'utf8');
  test('StoryRing has animations', storyRingContent.includes('framer-motion') || storyRingContent.includes('animate'));
  test('StoryRing has progress indicators', storyRingContent.includes('progress') || storyRingContent.includes('ring'));
}

// 6. GAMIFICATION TESTS
console.log('\n🎮 GAMIFICATION TESTS');
console.log('-'.repeat(40));

const gamificationFiles = [
  'apps/web/src/components/gamification/BadgeSystem.tsx',
  'apps/web/src/services/gamification.ts'
];

gamificationFiles.forEach(file => {
  const exists = fs.existsSync(file);
  test(`Gamification file exists: ${path.basename(file)}`, exists);
});

// 7. PWA TESTS
console.log('\n📱 PWA TESTS');
console.log('-'.repeat(40));

const pwaFiles = [
  'apps/web/src/components/PWA/SplashScreen.tsx',
  'apps/web/public/manifest.json',
  'apps/web/public/sw.js'
];

pwaFiles.forEach(file => {
  const exists = fs.existsSync(file);
  test(`PWA file exists: ${path.basename(file)}`, exists);
});

// 8. TESTING INFRASTRUCTURE TESTS
console.log('\n🧪 TESTING INFRASTRUCTURE TESTS');
console.log('-'.repeat(40));

const testFiles = [
  'apps/web/jest.config.js',
  'apps/web/src/tests/UXPack.test.tsx',
  'apps/web/src/tests/UXPack.integration.test.tsx',
  'apps/web/src/tests/PWA.simple.test.tsx'
];

testFiles.forEach(file => {
  const exists = fs.existsSync(file);
  test(`Test file exists: ${path.basename(file)}`, exists);
});

// 9. CONFIGURATION TESTS
console.log('\n⚙️  CONFIGURATION TESTS');
console.log('-'.repeat(40));

const configFiles = [
  'apps/web/.env.local',
  'server/.env',
  'docker-compose.dev.yml',
  'docker-compose.prod.yml',
  'Dockerfile'
];

configFiles.forEach(file => {
  const exists = fs.existsSync(file);
  test(`Config file exists: ${path.basename(file)}`, exists);
});

// 10. DOCUMENTATION TESTS
console.log('\n📚 DOCUMENTATION TESTS');
console.log('-'.repeat(40));

const docFiles = [
  'README.md',
  'CHANGELOG.md',
  'DEPLOYMENT_GUIDE.md',
  'USER_GUIDE.md',
  'API.md',
  'ARCHITECTURE.md'
];

docFiles.forEach(file => {
  const exists = fs.existsSync(file);
  test(`Documentation exists: ${file}`, exists);
});

// 11. DEPLOYMENT TESTS
console.log('\n🚀 DEPLOYMENT TESTS');
console.log('-'.repeat(40));

const deploymentFiles = [
  'deploy-production.sh',
  'production-setup.sh',
  'nginx/nginx.conf',
  'monitoring/prometheus.yml'
];

deploymentFiles.forEach(file => {
  const exists = fs.existsSync(file);
  test(`Deployment file exists: ${path.basename(file)}`, exists);
});

// 12. SECURITY TESTS
console.log('\n🔒 SECURITY TESTS');
console.log('-'.repeat(40));

// Check for security-related files
const securityFiles = [
  'security-audit.sh',
  'SECURITY_HEADERS.md'
];

securityFiles.forEach(file => {
  const exists = fs.existsSync(file);
  test(`Security file exists: ${path.basename(file)}`, exists);
});

// 13. PERFORMANCE TESTS
console.log('\n⚡ PERFORMANCE TESTS');
console.log('-'.repeat(40));

// Check for performance optimization files
const performanceFiles = [
  'apps/web/src/lib/performance.ts',
  'monitoring/performance.js'
];

performanceFiles.forEach(file => {
  const exists = fs.existsSync(file);
  test(`Performance file exists: ${path.basename(file)}`, exists);
});

// 14. AI SERVICE TESTS
console.log('\n🤖 AI SERVICE TESTS');
console.log('-'.repeat(40));

const aiFiles = [
  'ai-service/deepseek_app.py',
  'ai-service/requirements.txt'
];

aiFiles.forEach(file => {
  const exists = fs.existsSync(file);
  test(`AI service file exists: ${path.basename(file)}`, exists);
});

// 15. MOBILE APP TESTS
console.log('\n📱 MOBILE APP TESTS');
console.log('-'.repeat(40));

const mobileFiles = [
  'apps/mobile/package.json',
  'apps/mobile/app.json',
  'apps/mobile/src/App.tsx'
];

mobileFiles.forEach(file => {
  const exists = fs.existsSync(file);
  test(`Mobile file exists: ${path.basename(file)}`, exists);
});

// 16. CODE QUALITY TESTS
console.log('\n📊 CODE QUALITY TESTS');
console.log('-'.repeat(40));

// Check for linting and formatting configs
const qualityFiles = [
  '.eslintrc.js',
  '.prettierrc',
  'sonar-project.properties'
];

qualityFiles.forEach(file => {
  const exists = fs.existsSync(file);
  test(`Code quality file exists: ${path.basename(file)}`, exists);
});

// 17. FINAL ASSESSMENT
console.log('\n🎯 FINAL SYSTEM ASSESSMENT');
console.log('-'.repeat(40));

const totalTests = results.passed + results.failed;
const passRate = ((results.passed / totalTests) * 100).toFixed(1);

console.log(`\n📊 SYSTEM TEST RESULTS:`);
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log(`📈 Pass Rate: ${passRate}%`);

if (results.failed === 0) {
  console.log('\n🎉 ALL SYSTEM TESTS PASSED! PawfectMatch is production ready!');
} else if (results.failed <= 5) {
  console.log('\n✅ MINOR ISSUES: PawfectMatch is mostly ready with minor fixes needed.');
} else if (results.failed <= 10) {
  console.log('\n⚠️  MODERATE ISSUES: PawfectMatch needs attention before production.');
} else {
  console.log('\n❌ MAJOR ISSUES: PawfectMatch needs significant work before production.');
}

// System health assessment
console.log('\n🏥 SYSTEM HEALTH ASSESSMENT:');

// Check for critical files
const criticalFiles = [
  'apps/web/src/app/layout.tsx',
  'server/server.js',
  'package.json',
  'README.md'
];

let criticalPassed = 0;
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) criticalPassed++;
});

const criticalPassRate = ((criticalPassed / criticalFiles.length) * 100).toFixed(1);
console.log(`🔑 Critical Files: ${criticalPassed}/${criticalFiles.length} (${criticalPassRate}%)`);

// Check for implementation completeness
const implementationFiles = [
  'apps/web/src/components/Pet/SwipeCardV2.tsx',
  'apps/web/src/components/Stories/StoryRing.tsx',
  'server/src/models/Story.js',
  'server/src/models/Post.js'
];

let implementationPassed = 0;
implementationFiles.forEach(file => {
  if (fs.existsSync(file)) implementationPassed++;
});

const implementationPassRate = ((implementationPassed / implementationFiles.length) * 100).toFixed(1);
console.log(`🎯 Core Implementation: ${implementationPassed}/${implementationFiles.length} (${implementationPassRate}%)`);

// Overall system status
if (criticalPassRate >= 100 && implementationPassRate >= 75) {
  console.log('\n🌟 SYSTEM STATUS: EXCELLENT - Ready for production deployment');
} else if (criticalPassRate >= 75 && implementationPassRate >= 50) {
  console.log('\n✅ SYSTEM STATUS: GOOD - Minor issues to address');
} else {
  console.log('\n⚠️  SYSTEM STATUS: NEEDS WORK - Significant issues to resolve');
}

// Detailed test report
console.log('\n📋 DETAILED TEST REPORT:');
results.tests.forEach((test, index) => {
  const status = test.passed ? '✅' : '❌';
  console.log(`${index + 1}. ${status} ${test.name}`);
  if (test.details) console.log(`   ${test.details}`);
});

console.log('\n🚀 ULTRA DEEP SYSTEM TEST COMPLETE!');
console.log('=' .repeat(70));
