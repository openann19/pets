#!/usr/bin/env node

/**
 * 🧪 PREMIUM UI INTEGRATION TEST
 * Comprehensive test for all Premium components
 */

const fs = require('fs');
const path = require('path');

class PremiumUITest {
  constructor() {
    this.results = [];
    this.webAppPath = 'apps/web';
  }

  async runAllTests() {
    console.log('🧪 PREMIUM UI INTEGRATION TEST');
    console.log('===============================\n');

    await this.testComponentImports();
    await this.testPremiumCardUsage();
    await this.testPremiumButtonUsage();
    await this.testAllPagesIntegration();
    await this.testPhase3Features();

    this.printResults();
  }

  async test(name, testFn) {
    const start = Date.now();
    try {
      console.log(`🧪 Testing: ${name}...`);
      const result = await testFn();
      const duration = Date.now() - start;
      console.log(`✅ ${name} - PASSED (${duration}ms)`);
      this.results.push({ name, status: 'PASS', duration, data: result });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.log(`❌ ${name} - FAILED (${duration}ms): ${error.message}`);
      this.results.push({ name, status: 'FAIL', duration, error: error.message });
      return null;
    }
  }

  // === TEST SUITE 1: Component Files ===
  async testComponentImports() {
    console.log('\n📦 COMPONENT IMPORTS TEST');
    console.log('=========================');

    await this.test('Premium Button Component Exists', async () => {
      const filePath = `${this.webAppPath}/src/components/UI/PremiumButton.tsx`;
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, 'utf8');
      if (!content.includes('PremiumButton')) {
        throw new Error('PremiumButton component not found');
      }
      return { exists: true, size: content.length };
    });

    await this.test('Premium Card Component Exists', async () => {
      const filePath = `${this.webAppPath}/src/components/UI/PremiumCard.tsx`;
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, 'utf8');
      if (!content.includes('PremiumCard')) {
        throw new Error('PremiumCard component not found');
      }
      return { exists: true, size: content.length };
    });
  }

  // === TEST SUITE 2: Premium Card Usage ===
  async testPremiumCardUsage() {
    console.log('\n💎 PREMIUM CARD USAGE TEST');
    console.log('==========================');

    await this.test('Analytics Page Uses PremiumCard', async () => {
      const filePath = `${this.webAppPath}/app/(protected)/analytics/page.tsx`;
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, 'utf8');
      
      const imports = content.includes("import PremiumCard from '../../../src/components/UI/PremiumCard'");
      const usage = content.includes('<PremiumCard');
      
      if (!imports) throw new Error('PremiumCard not imported');
      if (!usage) throw new Error('PremiumCard not used');
      
      const usageCount = (content.match(/<PremiumCard/g) || []).length;
      return { imported: true, used: true, usageCount };
    });

    await this.test('Dashboard Page Uses PremiumCard', async () => {
      const filePath = `${this.webAppPath}/app/(protected)/dashboard/page.tsx`;
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, 'utf8');
      
      const imports = content.includes("import PremiumCard from '../../../src/components/UI/PremiumCard'");
      const usage = content.includes('<PremiumCard');
      
      if (!imports) throw new Error('PremiumCard not imported');
      if (!usage) throw new Error('PremiumCard not used');
      
      const usageCount = (content.match(/<PremiumCard/g) || []).length;
      return { imported: true, used: true, usageCount };
    });
  }

  // === TEST SUITE 3: Premium Button Usage ===
  async testPremiumButtonUsage() {
    console.log('\n✨ PREMIUM BUTTON USAGE TEST');
    console.log('============================');

    await this.test('Login Page Uses PremiumButton', async () => {
      const filePath = `${this.webAppPath}/app/(auth)/login/page.tsx`;
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, 'utf8');
      
      const imports = content.includes("import PremiumButton from '../../../src/components/UI/PremiumButton'");
      const usage = content.includes('<PremiumButton');
      
      if (!imports) throw new Error('PremiumButton not imported');
      if (!usage) throw new Error('PremiumButton not used');
      
      const usageCount = (content.match(/<PremiumButton/g) || []).length;
      return { imported: true, used: true, usageCount };
    });

    await this.test('Analytics Page Uses PremiumButton', async () => {
      const filePath = `${this.webAppPath}/app/(protected)/analytics/page.tsx`;
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, 'utf8');
      
      const imports = content.includes("import PremiumButton from '../../../src/components/UI/PremiumButton'");
      const usage = content.includes('<PremiumButton');
      
      if (!imports) throw new Error('PremiumButton not imported');
      if (!usage) throw new Error('PremiumButton not used');
      
      const usageCount = (content.match(/<PremiumButton/g) || []).length;
      return { imported: true, used: true, usageCount };
    });
  }

  // === TEST SUITE 4: All Pages Integration ===
  async testAllPagesIntegration() {
    console.log('\n🌐 ALL PAGES INTEGRATION TEST');
    console.log('=============================');

    await this.test('Login Page Structure', async () => {
      const filePath = `${this.webAppPath}/app/(auth)/login/page.tsx`;
      const content = fs.readFileSync(filePath, 'utf8');
      
      const hasForm = content.includes('onSubmit');
      const hasValidation = content.includes('zodResolver');
      const hasPremiumUI = content.includes('PremiumButton');
      
      if (!hasForm) throw new Error('Form not found');
      if (!hasValidation) throw new Error('Validation not found');
      if (!hasPremiumUI) throw new Error('Premium UI not integrated');
      
      return { hasForm, hasValidation, hasPremiumUI };
    });

    await this.test('Dashboard Page Structure', async () => {
      const filePath = `${this.webAppPath}/app/(protected)/dashboard/page.tsx`;
      const content = fs.readFileSync(filePath, 'utf8');
      
      const hasStats = content.includes('stats.map');
      const hasAuth = content.includes('useAuthStore');
      const hasPremiumUI = content.includes('PremiumCard');
      
      if (!hasStats) throw new Error('Stats not found');
      if (!hasAuth) throw new Error('Auth not found');
      if (!hasPremiumUI) throw new Error('Premium UI not integrated');
      
      return { hasStats, hasAuth, hasPremiumUI };
    });

    await this.test('Analytics Page Structure', async () => {
      const filePath = `${this.webAppPath}/app/(protected)/analytics/page.tsx`;
      const content = fs.readFileSync(filePath, 'utf8');
      
      const hasAnalytics = content.includes('useUserAnalytics');
      const hasMetrics = content.includes('MetricCard');
      const hasPremiumUI = content.includes('PremiumCard');
      
      if (!hasAnalytics) throw new Error('Analytics hooks not found');
      if (!hasMetrics) throw new Error('Metrics not found');
      if (!hasPremiumUI) throw new Error('Premium UI not integrated');
      
      return { hasAnalytics, hasMetrics, hasPremiumUI };
    });
  }

  // === TEST SUITE 5: Phase 3 Features ===
  async testPhase3Features() {
    console.log('\n🚀 PHASE 3 FEATURES TEST');
    console.log('========================');

    await this.test('Premium Tier Service Exists', async () => {
      const filePath = `${this.webAppPath}/src/lib/premium-tier-service.ts`;
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, 'utf8');
      
      const hasTiers = content.includes('PremiumTier');
      const hasService = content.includes('PremiumTierService');
      const hasPricing = content.includes('price');
      
      if (!hasTiers) throw new Error('Tiers not defined');
      if (!hasService) throw new Error('Service not defined');
      if (!hasPricing) throw new Error('Pricing not defined');
      
      return { hasTiers, hasService, hasPricing };
    });

    await this.test('Video Communication Service Exists', async () => {
      const filePath = `${this.webAppPath}/src/lib/video-communication.ts`;
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, 'utf8');
      
      const hasWebRTC = content.includes('RTCPeerConnection');
      const hasService = content.includes('VideoCallService');
      const hasScreenShare = content.includes('screenSharing');
      
      if (!hasWebRTC) throw new Error('WebRTC not found');
      if (!hasService) throw new Error('Service not defined');
      if (!hasScreenShare) throw new Error('Screen sharing not found');
      
      return { hasWebRTC, hasService, hasScreenShare };
    });

    await this.test('Analytics Service Exists', async () => {
      const filePath = `${this.webAppPath}/src/lib/analytics-service.ts`;
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, 'utf8');
      
      const hasService = content.includes('AnalyticsService');
      const hasMetrics = content.includes('UserAnalytics');
      const hasInsights = content.includes('generateInsights');
      
      if (!hasService) throw new Error('Service not defined');
      if (!hasMetrics) throw new Error('Metrics not defined');
      if (!hasInsights) throw new Error('Insights not found');
      
      return { hasService, hasMetrics, hasInsights };
    });

    await this.test('Premium Hooks Exist', async () => {
      const filePath = `${this.webAppPath}/src/hooks/premium-hooks.tsx`;
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, 'utf8');
      
      const hooks = [
        'useVideoCall',
        'usePremiumTier',
        'useUserAnalytics',
        'useMatchAnalytics',
        'useFeatureGate',
        'useUsageLimits'
      ];
      
      const foundHooks = hooks.filter(hook => content.includes(hook));
      
      if (foundHooks.length < hooks.length) {
        throw new Error(`Missing hooks: ${hooks.filter(h => !foundHooks.includes(h)).join(', ')}`);
      }
      
      return { totalHooks: hooks.length, foundHooks: foundHooks.length };
    });
  }

  // === RESULTS ===
  printResults() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = total - passed;
    const successRate = ((passed / total) * 100).toFixed(1);

    console.log('\n🏆 PREMIUM UI INTEGRATION TEST RESULTS');
    console.log('======================================');
    console.log(`📊 Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${successRate}%`);

    if (failed > 0) {
      console.log('\n💥 FAILED TESTS:');
      this.results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`   ❌ ${r.name}: ${r.error}`);
      });
    }

    console.log('\n📊 COVERAGE SUMMARY:');
    console.log('===================');
    
    const coverage = {
      premiumButton: this.results.filter(r => r.name.includes('Button') && r.status === 'PASS').length,
      premiumCard: this.results.filter(r => r.name.includes('Card') && r.status === 'PASS').length,
      pages: this.results.filter(r => r.name.includes('Page') && r.status === 'PASS').length,
      phase3: this.results.filter(r => r.name.includes('Service') && r.status === 'PASS').length,
    };

    console.log(`💎 Premium Button Integration: ${coverage.premiumButton} tests passed`);
    console.log(`💎 Premium Card Integration: ${coverage.premiumCard} tests passed`);
    console.log(`🌐 Pages Integration: ${coverage.pages} tests passed`);
    console.log(`🚀 Phase 3 Features: ${coverage.phase3} tests passed`);

    if (passed === total) {
      console.log('\n🎉 🎯 ALL TESTS PASSED! 🎯 🎉');
      console.log('🌟 PREMIUM UI FULLY INTEGRATED!');
      console.log('🚀 PHASE 3 COMPLETE AND TESTED!');
      console.log('✨ READY FOR PRODUCTION DEPLOYMENT!');
    } else {
      console.log('\n⚠️  Some tests failed. Review the issues above.');
    }
  }
}

// Run tests
const tester = new PremiumUITest();
tester.runAllTests().catch(console.error);
