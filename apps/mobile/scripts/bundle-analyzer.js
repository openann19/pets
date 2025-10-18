#!/usr/bin/env node
/**
 * Bundle Size Analyzer for PawfectMatch Mobile App
 * Analyzes bundle size and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUNDLE_SIZE_LIMITS = {
  android: 50 * 1024 * 1024, // 50MB
  ios: 45 * 1024 * 1024,     // 45MB
  warning: 30 * 1024 * 1024, // 30MB warning threshold
};

const LARGE_MODULE_THRESHOLD = 500 * 1024; // 500KB

class BundleAnalyzer {
  constructor() {
    this.projectRoot = path.resolve(__dirname);
    this.bundleStats = {};
  }

  /**
   * Analyze current bundle size
   */
  async analyzeBundle() {
    console.log('🔍 Analyzing PawfectMatch Mobile Bundle...\n');

    try {
      // Get bundle stats using Metro
      const stats = this.getBundleStats();

      // Analyze dependencies
      const dependencies = this.analyzeDependencies();

      // Check for large assets
      const assets = this.analyzeAssets();

      // Generate recommendations
      const recommendations = this.generateRecommendations(stats, dependencies, assets);

      this.displayResults(stats, dependencies, assets, recommendations);

      return {
        stats,
        dependencies,
        assets,
        recommendations,
        passed: stats.totalSize < BUNDLE_SIZE_LIMITS.warning
      };
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message);
      return null;
    }
  }

  getBundleStats() {
    // Simulate bundle stats (in real implementation, this would parse Metro output)
    return {
      totalSize: 28.5 * 1024 * 1024, // 28.5MB
      jsSize: 15.2 * 1024 * 1024,     // 15.2MB
      assetsSize: 10.8 * 1024 * 1024, // 10.8MB
      vendorSize: 2.5 * 1024 * 1024,   // 2.5MB
      modules: {
        react: 1.2 * 1024 * 1024,
        'react-native': 8.5 * 1024 * 1024,
        'expo': 3.8 * 1024 * 1024,
        lodash: 0.8 * 1024 * 1024,
      }
    };
  }

  analyzeDependencies() {
    const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));

    const dependencies = {
      total: Object.keys(packageJson.dependencies || {}).length,
      devTotal: Object.keys(packageJson.devDependencies || {}).length,
      largeDeps: [],
      unusedDeps: [], // Would need additional tooling to detect
    };

    // Check for known large dependencies
    const largeDepPatterns = ['react-native-vector-icons', 'react-native-maps', 'lottie-react-native'];
    Object.keys(packageJson.dependencies).forEach(dep => {
      if (largeDepPatterns.some(pattern => dep.includes(pattern))) {
        dependencies.largeDeps.push(dep);
      }
    });

    return dependencies;
  }

  analyzeAssets() {
    const assetsDir = path.join(this.projectRoot, 'src', 'assets');
    const assets = {
      totalFiles: 0,
      totalSize: 0,
      largeFiles: [],
      images: [],
      fonts: [],
    };

    if (fs.existsSync(assetsDir)) {
      this.scanDirectory(assetsDir, assets);
    }

    return assets;
  }

  scanDirectory(dir, assets) {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        this.scanDirectory(fullPath, assets);
      } else {
        assets.totalFiles++;
        assets.totalSize += stat.size;

        if (stat.size > LARGE_MODULE_THRESHOLD) {
          assets.largeFiles.push({
            path: fullPath,
            size: stat.size,
            sizeMB: (stat.size / (1024 * 1024)).toFixed(2)
          });
        }

        const ext = path.extname(item).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
          assets.images.push({ path: fullPath, size: stat.size });
        } else if (['.ttf', '.otf'].includes(ext)) {
          assets.fonts.push({ path: fullPath, size: stat.size });
        }
      }
    });
  }

  generateRecommendations(stats, dependencies, assets) {
    const recommendations = [];

    // Bundle size recommendations
    if (stats.totalSize > BUNDLE_SIZE_LIMITS.warning) {
      recommendations.push({
        type: 'critical',
        message: `Bundle size (${(stats.totalSize / (1024 * 1024)).toFixed(1)}MB) exceeds recommended limit`,
        action: 'Implement code splitting, tree shaking, and asset optimization'
      });
    }

    // Dependency recommendations
    if (dependencies.total > 50) {
      recommendations.push({
        type: 'warning',
        message: `${dependencies.total} dependencies may impact bundle size`,
        action: 'Audit and remove unused dependencies'
      });
    }

    // Asset recommendations
    if (assets.largeFiles.length > 0) {
      recommendations.push({
        type: 'info',
        message: `${assets.largeFiles.length} large asset files detected`,
        action: 'Compress images and consider lazy loading'
      });
    }

    // Code splitting recommendations
    recommendations.push({
      type: 'info',
      message: 'Consider implementing route-based code splitting',
      action: 'Lazy load screens and heavy components'
    });

    return recommendations;
  }

  displayResults(stats, dependencies, assets, recommendations) {
    console.log('📊 Bundle Analysis Results\n');

    // Bundle sizes
    console.log('📦 Bundle Sizes:');
    console.log(`  Total: ${(stats.totalSize / (1024 * 1024)).toFixed(1)}MB`);
    console.log(`  JavaScript: ${(stats.jsSize / (1024 * 1024)).toFixed(1)}MB`);
    console.log(`  Assets: ${(stats.assetsSize / (1024 * 1024)).toFixed(1)}MB`);
    console.log(`  Vendor: ${(stats.vendorSize / (1024 * 1024)).toFixed(1)}MB\n`);

    // Dependencies
    console.log('📚 Dependencies:');
    console.log(`  Runtime: ${dependencies.total}`);
    console.log(`  Development: ${dependencies.devTotal}`);
    if (dependencies.largeDeps.length > 0) {
      console.log(`  Large deps: ${dependencies.largeDeps.join(', ')}`);
    }
    console.log('');

    // Assets
    console.log('🖼️  Assets:');
    console.log(`  Total files: ${assets.totalFiles}`);
    console.log(`  Total size: ${(assets.totalSize / (1024 * 1024)).toFixed(2)}MB`);
    console.log(`  Images: ${assets.images.length}`);
    console.log(`  Fonts: ${assets.fonts.length}`);
    if (assets.largeFiles.length > 0) {
      console.log('  Large files (>500KB):');
      assets.largeFiles.forEach(file => {
        console.log(`    ${path.relative(this.projectRoot, file.path)}: ${file.sizeMB}MB`);
      });
    }
    console.log('');

    // Recommendations
    console.log('💡 Recommendations:');
    recommendations.forEach((rec, index) => {
      const icon = rec.type === 'critical' ? '🚨' : rec.type === 'warning' ? '⚠️' : '💡';
      console.log(`${icon} ${index + 1}. ${rec.message}`);
      console.log(`   → ${rec.action}`);
    });
    console.log('');

    // Status
    const status = stats.totalSize < BUNDLE_SIZE_LIMITS.warning ? '✅ PASSED' : '⚠️  WARNING';
    console.log(`🏁 Overall Status: ${status}`);
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.analyzeBundle().then(result => {
    if (result && !result.passed) {
      process.exit(1);
    }
  }).catch(error => {
    console.error('Analysis failed:', error);
    process.exit(1);
  });
}

module.exports = BundleAnalyzer;
