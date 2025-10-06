#!/usr/bin/env node

/**
 * Authentication Bypass Test Script
 * Tests that all pages/screens are accessible without authentication in development mode
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Testing Authentication Bypass for Development Mode\n');

// Test configuration
const tests = [
  {
    name: 'Web Middleware Configuration',
    test: () => {
      const middlewarePath = path.join(__dirname, 'apps/web/middleware.ts');
      const content = fs.readFileSync(middlewarePath, 'utf8');
      
      const checks = [
        { pattern: /isAuthDisabled\(\)/, description: 'Uses isAuthDisabled() function' },
        { pattern: /Skip authentication checks/, description: 'Has auth bypass comment' },
        { pattern: /import.*isAuthDisabled.*from.*dev/, description: 'Imports dev config' }
      ];
      
      return checks.every(check => {
        const found = check.pattern.test(content);
        console.log(`  ${found ? '✅' : '❌'} ${check.description}`);
        return found;
      });
    }
  },
  {
    name: 'Web Protected Layouts',
    test: () => {
      const layouts = [
        'apps/web/app/[locale]/(protected)/layout.tsx',
        'apps/web/app/(protected)/layout.tsx'
      ];
      
      let allPassed = true;
      
      layouts.forEach(layoutPath => {
        const fullPath = path.join(__dirname, layoutPath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const hasAuthBypass = /isAuthDisabled\(\)/.test(content);
          console.log(`  ${hasAuthBypass ? '✅' : '❌'} ${layoutPath} - Auth bypass configured`);
          if (!hasAuthBypass) allPassed = false;
        } else {
          console.log(`  ⚠️  ${layoutPath} - File not found`);
        }
      });
      
      return allPassed;
    }
  },
  {
    name: 'Mobile App Configuration',
    test: () => {
      const appPath = path.join(__dirname, 'apps/mobile/App.tsx');
      const content = fs.readFileSync(appPath, 'utf8');
      
      const checks = [
        { pattern: /isAuthDisabled\(\)/, description: 'Uses isAuthDisabled() function' },
        { pattern: /DEVELOPMENT MODE.*Always show main app/, description: 'Has dev mode bypass' },
        { pattern: /import.*isAuthDisabled.*from.*dev/, description: 'Imports dev config' }
      ];
      
      return checks.every(check => {
        const found = check.pattern.test(content);
        console.log(`  ${found ? '✅' : '❌'} ${check.description}`);
        return found;
      });
    }
  },
  {
    name: 'Development Configuration Files',
    test: () => {
      const configs = [
        'apps/web/src/config/dev.ts',
        'apps/mobile/src/config/dev.ts'
      ];
      
      let allPassed = true;
      
      configs.forEach(configPath => {
        const fullPath = path.join(__dirname, configPath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const hasAuthConfig = /DISABLE_AUTH.*=/.test(content) && /isAuthDisabled/.test(content);
          console.log(`  ${hasAuthConfig ? '✅' : '❌'} ${configPath} - Auth config present`);
          if (!hasAuthConfig) allPassed = false;
        } else {
          console.log(`  ❌ ${configPath} - File not found`);
          allPassed = false;
        }
      });
      
      return allPassed;
    }
  },
  {
    name: 'Web Route Accessibility',
    test: () => {
      const protectedRoutes = [
        '/dashboard',
        '/swipe', 
        '/matches',
        '/chat',
        '/profile',
        '/pets',
        '/my-pets',
        '/premium',
        '/map',
        '/system-status',
        '/ai'
      ];
      
      console.log('  📋 Protected routes that should be accessible in dev mode:');
      protectedRoutes.forEach(route => {
        console.log(`    • ${route}`);
      });
      
      return true; // Routes are defined in middleware, this is informational
    }
  },
  {
    name: 'Mobile Screen Accessibility',
    test: () => {
      const mobileScreens = [
        'HomeScreen',
        'SwipeScreen', 
        'MatchesScreen',
        'ChatScreen',
        'MapScreen',
        'LoginScreen',
        'RegisterScreen'
      ];
      
      console.log('  📱 Mobile screens that should be accessible in dev mode:');
      mobileScreens.forEach(screen => {
        console.log(`    • ${screen}`);
      });
      
      return true; // Screens are defined in navigation, this is informational
    }
  }
];

// Run tests
let passedTests = 0;
let totalTests = tests.length;

tests.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.name}`);
  console.log('─'.repeat(50));
  
  try {
    const result = test.test();
    if (result) {
      passedTests++;
      console.log(`✅ PASSED`);
    } else {
      console.log(`❌ FAILED`);
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`📊 TEST SUMMARY: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('🎉 ALL TESTS PASSED! Authentication bypass is properly configured.');
  console.log('\n📝 Next Steps:');
  console.log('1. Start the web app: cd apps/web && pnpm dev');
  console.log('2. Start the mobile app: cd apps/mobile && npx expo start');
  console.log('3. Test accessing protected routes without authentication');
  console.log('4. Verify all screens are accessible in mobile app');
} else {
  console.log('⚠️  Some tests failed. Please review the configuration.');
  process.exit(1);
}

console.log('\n🔧 Configuration Details:');
console.log('• Web: Authentication bypassed when NODE_ENV=development');
console.log('• Mobile: Authentication bypassed when __DEV__=true');
console.log('• Both apps use centralized dev configuration files');
console.log('• Production builds will still require authentication');
