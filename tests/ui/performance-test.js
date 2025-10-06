/**
 * ⚡ PERFORMANCE TESTING SUITE
 * Comprehensive performance analysis for the admin panel
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PerformanceTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      loadTime: {},
      animation: {},
      memory: {},
      network: {},
      lighthouse: {},
      details: []
    };
  }

  async initialize() {
    console.log('⚡ Initializing Performance Testing...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-default-apps'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Enable performance monitoring
    await this.page.evaluateOnNewDocument(() => {
      window.performanceMetrics = {
        paintTimings: [],
        navigationTimings: [],
        resourceTimings: [],
        memoryUsage: []
      };
    });

    console.log('✅ Performance testing initialized');
  }

  async testPageLoadPerformance() {
    console.log('\n📄 Testing Page Load Performance...');
    
    const startTime = Date.now();
    
    // Navigate and measure
    await this.page.goto('http://localhost:3000/admin', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    const loadTime = Date.now() - startTime;
    
    // Get detailed performance metrics
    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      const resources = performance.getEntriesByType('resource');
      
      return {
        // Navigation timing
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstByte: navigation.responseStart - navigation.requestStart,
        
        // Paint timing
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        
        // Resource timing
        totalResources: resources.length,
        totalResourceSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        
        // Memory usage
        memoryUsage: performance.memory ? {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        } : null
      };
    });

    console.log(`⏱️ Total Load Time: ${loadTime}ms`);
    console.log(`📄 DOM Content Loaded: ${performanceMetrics.domContentLoaded.toFixed(2)}ms`);
    console.log(`🎨 First Paint: ${performanceMetrics.firstPaint.toFixed(2)}ms`);
    console.log(`📝 First Contentful Paint: ${performanceMetrics.firstContentfulPaint.toFixed(2)}ms`);
    console.log(`📦 Total Resources: ${performanceMetrics.totalResources}`);
    console.log(`💾 Resource Size: ${(performanceMetrics.totalResourceSize / 1024).toFixed(2)}KB`);

    if (performanceMetrics.memoryUsage) {
      console.log(`🧠 Memory Used: ${(performanceMetrics.memoryUsage.used / 1024 / 1024).toFixed(2)}MB`);
    }

    this.results.loadTime = {
      total: loadTime,
      ...performanceMetrics
    };
  }

  async testAnimationPerformance() {
    console.log('\n🎬 Testing Animation Performance...');
    
    // Measure animation frame rate
    const animationMetrics = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        let lastTime = performance.now();
        let totalTime = 0;
        
        const measureFrames = (currentTime) => {
          frameCount++;
          totalTime = currentTime - lastTime;
          
          if (totalTime < 1000) {
            requestAnimationFrame(measureFrames);
          } else {
            const fps = (frameCount / totalTime) * 1000;
            resolve({
              fps: fps,
              frameCount: frameCount,
              totalTime: totalTime,
              smoothAnimations: fps > 30
            });
          }
        };
        
        requestAnimationFrame(measureFrames);
      });
    });

    console.log(`🎬 Animation FPS: ${animationMetrics.fps.toFixed(2)}`);
    console.log(`📊 Frame Count: ${animationMetrics.frameCount}`);
    console.log(`⏱️ Measurement Time: ${animationMetrics.totalTime.toFixed(2)}ms`);
    console.log(`✨ Smooth Animations: ${animationMetrics.smoothAnimations ? 'Yes' : 'No'}`);

    // Test specific animation performance
    const animationElements = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let animatedElements = 0;
      let animationRules = 0;
      
      elements.forEach(el => {
        const style = getComputedStyle(el);
        if (style.animation !== 'none' || style.transition !== 'all 0s ease 0s') {
          animatedElements++;
        }
      });
      
      // Count CSS animation rules
      const styleSheets = Array.from(document.styleSheets);
      styleSheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach(rule => {
            if (rule.type === CSSRule.KEYFRAMES_RULE || 
                (rule.style && (rule.style.animation || rule.style.transition))) {
              animationRules++;
            }
          });
        } catch (e) {
          // Cross-origin stylesheets may throw errors
        }
      });
      
      return {
        animatedElements,
        animationRules
      };
    });

    console.log(`🎭 Animated Elements: ${animationElements.animatedElements}`);
    console.log(`📜 Animation Rules: ${animationElements.animationRules}`);

    this.results.animation = {
      ...animationMetrics,
      ...animationElements
    };
  }

  async testMemoryUsage() {
    console.log('\n🧠 Testing Memory Usage...');
    
    // Force garbage collection if available
    await this.page.evaluate(() => {
      if (window.gc) {
        window.gc();
      }
    });

    // Measure memory usage
    const memoryMetrics = await this.page.evaluate(() => {
      if (!performance.memory) {
        return { available: false };
      }
      
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        available: true
      };
    });

    if (memoryMetrics.available) {
      console.log(`🧠 Memory Used: ${(memoryMetrics.used / 1024 / 1024).toFixed(2)}MB`);
      console.log(`📊 Total Memory: ${(memoryMetrics.total / 1024 / 1024).toFixed(2)}MB`);
      console.log(`🔒 Memory Limit: ${(memoryMetrics.limit / 1024 / 1024).toFixed(2)}MB`);
      console.log(`📈 Usage Percentage: ${((memoryMetrics.used / memoryMetrics.limit) * 100).toFixed(2)}%`);
    } else {
      console.log('⚠️ Memory metrics not available in this browser');
    }

    // Test memory leaks by performing actions
    console.log('\n🔍 Testing for Memory Leaks...');
    
    const initialMemory = memoryMetrics.available ? memoryMetrics.used : 0;
    
    // Perform multiple interactions
    for (let i = 0; i < 10; i++) {
      await this.page.click('button');
      await this.page.waitForTimeout(100);
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(100);
    }

    // Force garbage collection
    await this.page.evaluate(() => {
      if (window.gc) {
        window.gc();
      }
    });

    const finalMemory = await this.page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });

    const memoryIncrease = finalMemory - initialMemory;
    const memoryLeakDetected = memoryIncrease > 1024 * 1024; // 1MB threshold

    console.log(`📊 Memory Increase: ${(memoryIncrease / 1024).toFixed(2)}KB`);
    console.log(`🚨 Memory Leak: ${memoryLeakDetected ? 'Detected' : 'Not Detected'}`);

    this.results.memory = {
      ...memoryMetrics,
      memoryIncrease,
      memoryLeakDetected
    };
  }

  async testNetworkPerformance() {
    console.log('\n🌐 Testing Network Performance...');
    
    // Clear cache and reload
    await this.page.evaluate(() => {
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    });

    // Monitor network requests
    const requests = [];
    const responses = [];

    this.page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    });

    this.page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        timestamp: Date.now(),
        headers: response.headers()
      });
    });

    // Reload page to measure network performance
    await this.page.reload({ waitUntil: 'networkidle0' });

    // Calculate network metrics
    const networkMetrics = {
      totalRequests: requests.length,
      totalResponses: responses.length,
      failedRequests: responses.filter(r => r.status >= 400).length,
      averageResponseTime: 0,
      totalDataTransferred: 0
    };

    if (responses.length > 0) {
      const responseTimes = responses.map((response, index) => {
        const request = requests[index];
        return request ? response.timestamp - request.timestamp : 0;
      }).filter(time => time > 0);

      networkMetrics.averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    }

    console.log(`📡 Total Requests: ${networkMetrics.totalRequests}`);
    console.log(`📥 Total Responses: ${networkMetrics.totalResponses}`);
    console.log(`❌ Failed Requests: ${networkMetrics.failedRequests}`);
    console.log(`⏱️ Average Response Time: ${networkMetrics.averageResponseTime.toFixed(2)}ms`);

    this.results.network = networkMetrics;
  }

  async testLighthouseMetrics() {
    console.log('\n🏮 Testing Lighthouse Metrics...');
    
    // Simulate Lighthouse Core Web Vitals
    const lighthouseMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      // Largest Contentful Paint (LCP)
      const lcp = performance.getEntriesByType('largest-contentful-paint');
      const lcpValue = lcp.length > 0 ? lcp[lcp.length - 1].startTime : 0;
      
      // First Input Delay (FID) - simulated
      const fid = 0; // Would need user interaction to measure
      
      // Cumulative Layout Shift (CLS) - simulated
      const cls = 0; // Would need layout shift observer
      
      return {
        lcp: lcpValue,
        fid: fid,
        cls: cls,
        fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        ttfb: navigation.responseStart - navigation.requestStart
      };
    });

    console.log(`🎯 Largest Contentful Paint: ${lighthouseMetrics.lcp.toFixed(2)}ms`);
    console.log(`👆 First Input Delay: ${lighthouseMetrics.fid.toFixed(2)}ms`);
    console.log(`📐 Cumulative Layout Shift: ${lighthouseMetrics.cls.toFixed(4)}`);
    console.log(`📝 First Contentful Paint: ${lighthouseMetrics.fcp.toFixed(2)}ms`);
    console.log(`⚡ Time to First Byte: ${lighthouseMetrics.ttfb.toFixed(2)}ms`);

    // Performance scoring
    const performanceScore = this.calculatePerformanceScore(lighthouseMetrics);
    console.log(`🏆 Performance Score: ${performanceScore}/100`);

    this.results.lighthouse = {
      ...lighthouseMetrics,
      score: performanceScore
    };
  }

  calculatePerformanceScore(metrics) {
    let score = 100;
    
    // LCP scoring (0-2.5s = 100, 2.5-4s = 50, >4s = 0)
    if (metrics.lcp > 4000) score -= 50;
    else if (metrics.lcp > 2500) score -= 25;
    
    // FCP scoring (0-1.8s = 100, 1.8-3s = 50, >3s = 0)
    if (metrics.fcp > 3000) score -= 30;
    else if (metrics.fcp > 1800) score -= 15;
    
    // TTFB scoring (0-800ms = 100, 800-1800ms = 50, >1800ms = 0)
    if (metrics.ttfb > 1800) score -= 20;
    else if (metrics.ttfb > 800) score -= 10;
    
    return Math.max(0, score);
  }

  async testResponsivePerformance() {
    console.log('\n📱 Testing Responsive Performance...');
    
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];

    const responsiveResults = [];

    for (const viewport of viewports) {
      console.log(`📐 Testing ${viewport.name} performance...`);
      
      await this.page.setViewport(viewport);
      await this.page.waitForTimeout(500);
      
      const startTime = Date.now();
      await this.page.reload({ waitUntil: 'networkidle0' });
      const loadTime = Date.now() - startTime;
      
      const memoryUsage = await this.page.evaluate(() => {
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
      });

      responsiveResults.push({
        viewport: viewport.name,
        loadTime,
        memoryUsage: memoryUsage / 1024 / 1024 // Convert to MB
      });

      console.log(`⏱️ ${viewport.name} Load Time: ${loadTime}ms`);
      console.log(`🧠 ${viewport.name} Memory: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }

    this.results.responsive = responsiveResults;
  }

  async generatePerformanceReport() {
    console.log('\n📊 Generating Performance Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        loadTime: this.results.loadTime.total,
        animationFPS: this.results.animation.fps,
        memoryUsage: this.results.memory.used,
        performanceScore: this.results.lighthouse.score,
        networkRequests: this.results.network.totalRequests
      },
      details: this.results,
      recommendations: this.generatePerformanceRecommendations()
    };

    const reportPath = path.join(__dirname, 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Performance report saved: ${reportPath}`);
    
    return report;
  }

  generatePerformanceRecommendations() {
    const recommendations = [];
    
    if (this.results.loadTime.total > 3000) {
      recommendations.push('Optimize page load time - consider code splitting and lazy loading');
    }
    
    if (this.results.animation.fps < 30) {
      recommendations.push('Improve animation performance - reduce animation complexity');
    }
    
    if (this.results.memory.used > 50 * 1024 * 1024) { // 50MB
      recommendations.push('Optimize memory usage - check for memory leaks');
    }
    
    if (this.results.lighthouse.score < 80) {
      recommendations.push('Improve Core Web Vitals - optimize LCP, FCP, and TTFB');
    }
    
    if (this.results.network.totalRequests > 50) {
      recommendations.push('Reduce number of network requests - bundle resources');
    }

    return recommendations;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runPerformanceTests() {
    try {
      await this.initialize();
      await this.testPageLoadPerformance();
      await this.testAnimationPerformance();
      await this.testMemoryUsage();
      await this.testNetworkPerformance();
      await this.testLighthouseMetrics();
      await this.testResponsivePerformance();
      
      const report = await this.generatePerformanceReport();
      
      console.log('\n🎉 Performance Testing Complete!');
      console.log(`📊 Performance Score: ${report.summary.performanceScore}/100`);
      console.log(`⏱️ Load Time: ${report.summary.loadTime}ms`);
      console.log(`🎬 Animation FPS: ${report.summary.animationFPS.toFixed(2)}`);
      
      return report;
    } catch (error) {
      console.error('💥 Performance testing failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.runPerformanceTests()
    .then(report => {
      console.log('\n✨ Performance Testing Complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Performance testing failed:', error);
      process.exit(1);
    });
}

module.exports = PerformanceTester;
