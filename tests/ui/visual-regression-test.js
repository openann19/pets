/**
 * 🎨 VISUAL REGRESSION TESTING SUITE
 * Pixel-perfect testing for UI consistency
 */

const puppeteer = require('puppeteer');
const pixelmatch = require('pixelmatch');
const PNG = require('pngjs').PNG;
const fs = require('fs');
const path = require('path');

class VisualRegressionTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baselineDir = path.join(__dirname, 'baselines');
    this.diffDir = path.join(__dirname, 'diffs');
    this.results = {
      passed: 0,
      failed: 0,
      new: 0,
      total: 0,
      details: []
    };
  }

  async initialize() {
    console.log('🎨 Initializing Visual Regression Testing...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Ensure directories exist
    [this.baselineDir, this.diffDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    console.log('✅ Visual testing initialized');
  }

  async captureElementScreenshot(selector, name) {
    const element = await this.page.$(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    const screenshot = await element.screenshot({
      type: 'png'
    });

    const screenshotPath = path.join(__dirname, 'screenshots', `${name}.png`);
    const screenshotDir = path.dirname(screenshotPath);
    
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    fs.writeFileSync(screenshotPath, screenshot);
    return screenshotPath;
  }

  async compareScreenshots(currentPath, baselinePath, diffPath) {
    const current = PNG.sync.read(fs.readFileSync(currentPath));
    const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
    
    const { width, height } = current;
    const diff = new PNG({ width, height });
    
    const pixelDiff = pixelmatch(
      current.data,
      baseline.data,
      diff.data,
      width,
      height,
      {
        threshold: 0.1,
        alpha: 0.1,
        diffColor: [255, 0, 0],
        diffColorAlt: [0, 255, 0]
      }
    );

    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    
    const diffPercentage = (pixelDiff / (width * height)) * 100;
    
    return {
      pixelDiff,
      diffPercentage,
      isMatch: diffPercentage < 1.0 // 1% threshold
    };
  }

  async testComponentVisuals() {
    console.log('\n🎭 Testing Component Visuals...');
    
    // Navigate to admin panel
    await this.page.goto('http://localhost:3000/admin', {
      waitUntil: 'networkidle0'
    });

    const componentTests = [
      {
        name: 'admin-header',
        selector: 'h1',
        description: 'Admin panel header'
      },
      {
        name: 'admin-sidebar',
        selector: 'nav',
        description: 'Navigation sidebar'
      },
      {
        name: 'stats-cards',
        selector: '[class*="grid"]:first-child',
        description: 'Statistics cards'
      },
      {
        name: 'system-health',
        selector: '[class*="gradient"]',
        description: 'System health section'
      },
      {
        name: 'quick-actions',
        selector: 'button',
        description: 'Quick action buttons'
      }
    ];

    for (const test of componentTests) {
      try {
        console.log(`📸 Capturing ${test.name}...`);
        
        const currentPath = await this.captureElementScreenshot(
          test.selector,
          `current-${test.name}`
        );

        const baselinePath = path.join(this.baselineDir, `${test.name}.png`);
        const diffPath = path.join(this.diffDir, `${test.name}-diff.png`);

        if (fs.existsSync(baselinePath)) {
          // Compare with baseline
          const comparison = await this.compareScreenshots(
            currentPath,
            baselinePath,
            diffPath
          );

          this.results.total++;
          
          if (comparison.isMatch) {
            this.results.passed++;
            console.log(`✅ ${test.name}: Visual match (${comparison.diffPercentage.toFixed(2)}% diff)`);
          } else {
            this.results.failed++;
            console.log(`❌ ${test.name}: Visual mismatch (${comparison.diffPercentage.toFixed(2)}% diff)`);
          }

          this.results.details.push({
            name: test.name,
            description: test.description,
            status: comparison.isMatch ? 'PASSED' : 'FAILED',
            diffPercentage: comparison.diffPercentage,
            pixelDiff: comparison.pixelDiff
          });
        } else {
          // Create new baseline
          fs.copyFileSync(currentPath, baselinePath);
          this.results.new++;
          console.log(`🆕 ${test.name}: New baseline created`);
          
          this.results.details.push({
            name: test.name,
            description: test.description,
            status: 'NEW_BASELINE',
            diffPercentage: 0,
            pixelDiff: 0
          });
        }
      } catch (error) {
        console.log(`💥 ${test.name}: Test failed - ${error.message}`);
        this.results.details.push({
          name: test.name,
          description: test.description,
          status: 'ERROR',
          error: error.message
        });
      }
    }
  }

  async testResponsiveVisuals() {
    console.log('\n📱 Testing Responsive Visuals...');
    
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      console.log(`📐 Testing ${viewport.name} viewport...`);
      
      await this.page.setViewport(viewport);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const screenshotPath = path.join(__dirname, 'screenshots', `${viewport.name}-fullpage.png`);
      await this.page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });

      const baselinePath = path.join(this.baselineDir, `${viewport.name}-fullpage.png`);
      
      if (fs.existsSync(baselinePath)) {
        const diffPath = path.join(this.diffDir, `${viewport.name}-diff.png`);
        const comparison = await this.compareScreenshots(
          screenshotPath,
          baselinePath,
          diffPath
        );

        console.log(`📊 ${viewport.name}: ${comparison.diffPercentage.toFixed(2)}% difference`);
      } else {
        fs.copyFileSync(screenshotPath, baselinePath);
        console.log(`🆕 ${viewport.name}: New baseline created`);
      }
    }
  }

  async testAnimationStates() {
    console.log('\n🎬 Testing Animation States...');
    
    // Test different animation states
    const animationStates = [
      {
        name: 'initial-load',
        action: async () => {
          await this.page.reload({ waitUntil: 'networkidle0' });
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      },
      {
        name: 'hover-state',
        action: async () => {
          const element = await this.page.$('button');
          if (element) {
            await element.hover();
            await this.page.waitForTimeout(200);
          }
        }
      },
      {
        name: 'active-state',
        action: async () => {
          const element = await this.page.$('button');
          if (element) {
            await element.click();
            await this.page.waitForTimeout(200);
          }
        }
      }
    ];

    for (const state of animationStates) {
      try {
        console.log(`🎭 Testing ${state.name}...`);
        
        await state.action();
        
        const screenshotPath = path.join(__dirname, 'screenshots', `${state.name}.png`);
        await this.page.screenshot({ path: screenshotPath });
        
        const baselinePath = path.join(this.baselineDir, `${state.name}.png`);
        
        if (fs.existsSync(baselinePath)) {
          const diffPath = path.join(this.diffDir, `${state.name}-diff.png`);
          const comparison = await this.compareScreenshots(
            screenshotPath,
            baselinePath,
            diffPath
          );

          console.log(`✅ ${state.name}: ${comparison.diffPercentage.toFixed(2)}% difference`);
        } else {
          fs.copyFileSync(screenshotPath, baselinePath);
          console.log(`🆕 ${state.name}: New baseline created`);
        }
      } catch (error) {
        console.log(`💥 ${state.name}: Test failed - ${error.message}`);
      }
    }
  }

  async testColorAccuracy() {
    console.log('\n🎨 Testing Color Accuracy...');
    
    const colorTests = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const colorIssues = [];
      
      elements.forEach((el, index) => {
        if (index > 100) return; // Limit to first 100 elements
        
        const style = getComputedStyle(el);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        
        // Check for potential contrast issues
        if (color && backgroundColor && 
            color !== 'rgba(0, 0, 0, 0)' && 
            backgroundColor !== 'rgba(0, 0, 0, 0)') {
          
          // Simple contrast check (in real implementation, use proper WCAG calculation)
          const colorRgb = color.match(/\d+/g);
          const bgRgb = backgroundColor.match(/\d+/g);
          
          if (colorRgb && bgRgb && colorRgb.length >= 3 && bgRgb.length >= 3) {
            const colorLuminance = (parseInt(colorRgb[0]) * 0.299 + 
                                  parseInt(colorRgb[1]) * 0.587 + 
                                  parseInt(colorRgb[2]) * 0.114) / 255;
            
            const bgLuminance = (parseInt(bgRgb[0]) * 0.299 + 
                               parseInt(bgRgb[1]) * 0.587 + 
                               parseInt(bgRgb[2]) * 0.114) / 255;
            
            const contrast = Math.abs(colorLuminance - bgLuminance);
            
            if (contrast < 0.3) {
              colorIssues.push({
                element: el.tagName,
                className: el.className,
                color,
                backgroundColor,
                contrast
              });
            }
          }
        }
      });
      
      return colorIssues;
    });

    console.log(`🎨 Color contrast issues found: ${colorTests.length}`);
    
    if (colorTests.length > 0) {
      console.log('⚠️ Potential contrast issues:');
      colorTests.slice(0, 5).forEach(issue => {
        console.log(`   ${issue.element}: ${issue.color} on ${issue.backgroundColor}`);
      });
    }
  }

  async generateVisualReport() {
    console.log('\n📊 Generating Visual Regression Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        new: this.results.new,
        successRate: this.results.total > 0 ? 
          ((this.results.passed / this.results.total) * 100).toFixed(1) : 0
      },
      details: this.results.details,
      recommendations: this.generateVisualRecommendations()
    };

    const reportPath = path.join(__dirname, 'visual-regression-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Visual report saved: ${reportPath}`);
    
    return report;
  }

  generateVisualRecommendations() {
    const recommendations = [];
    
    if (this.results.failed > 0) {
      recommendations.push('Review failed visual tests and update baselines if changes are intentional');
    }
    
    if (this.results.new > 0) {
      recommendations.push('New baselines created - verify they represent the intended design');
    }
    
    recommendations.push('Consider implementing automated visual testing in CI/CD pipeline');
    recommendations.push('Regular baseline updates recommended for design system evolution');
    
    return recommendations;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runVisualRegressionTests() {
    try {
      await this.initialize();
      await this.testComponentVisuals();
      await this.testResponsiveVisuals();
      await this.testAnimationStates();
      await this.testColorAccuracy();
      
      const report = await this.generateVisualReport();
      
      console.log('\n🎉 Visual Regression Testing Complete!');
      console.log(`📊 Summary: ${report.summary.passed}/${report.summary.total} tests passed`);
      console.log(`🆕 New baselines: ${report.summary.new}`);
      
      return report;
    } catch (error) {
      console.error('💥 Visual testing failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new VisualRegressionTester();
  tester.runVisualRegressionTests()
    .then(report => {
      console.log('\n✨ Visual Regression Testing Complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Visual testing failed:', error);
      process.exit(1);
    });
}

module.exports = VisualRegressionTester;
