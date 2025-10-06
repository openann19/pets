/**
 * ♿ ACCESSIBILITY TESTING SUITE
 * Comprehensive accessibility analysis for the admin panel
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class AccessibilityTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      keyboard: {},
      screenReader: {},
      colorContrast: {},
      semanticHTML: {},
      aria: {},
      focus: {},
      details: []
    };
  }

  async initialize() {
    console.log('♿ Initializing Accessibility Testing...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    console.log('✅ Accessibility testing initialized');
  }

  async testKeyboardNavigation() {
    console.log('\n⌨️ Testing Keyboard Navigation...');
    
    await this.page.goto('http://localhost:3000/admin', {
      waitUntil: 'networkidle0'
    });

    const keyboardTests = [];
    let tabCount = 0;
    const maxTabs = 50; // Prevent infinite loops

    // Test Tab navigation
    while (tabCount < maxTabs) {
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(100);
      
      const focusedElement = await this.page.evaluate(() => {
        const active = document.activeElement;
        if (!active || active === document.body) return null;
        
        return {
          tagName: active.tagName,
          type: active.type,
          className: active.className,
          id: active.id,
          textContent: active.textContent?.substring(0, 50),
          hasTabIndex: active.tabIndex >= 0,
          isVisible: active.offsetParent !== null
        };
      });

      if (!focusedElement) break;
      
      keyboardTests.push({
        step: tabCount + 1,
        element: focusedElement,
        timestamp: Date.now()
      });
      
      tabCount++;
    }

    console.log(`⌨️ Tab navigation steps: ${keyboardTests.length}`);
    
    // Test Shift+Tab (reverse navigation)
    await this.page.keyboard.down('Shift');
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.up('Shift');
    
    const reverseFocused = await this.page.evaluate(() => {
      const active = document.activeElement;
      return active ? active.tagName : null;
    });
    
    console.log(`🔄 Reverse navigation: ${reverseFocused ? 'Working' : 'Not working'}`);

    // Test Enter key on buttons
    const buttons = await this.page.$$('button');
    let enterKeyWorking = 0;
    
    for (const button of buttons.slice(0, 3)) { // Test first 3 buttons
      await button.focus();
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(100);
      enterKeyWorking++;
    }
    
    console.log(`✅ Enter key on buttons: ${enterKeyWorking} tested`);

    this.results.keyboard = {
      tabSteps: keyboardTests.length,
      reverseNavigation: !!reverseFocused,
      enterKeyWorking,
      details: keyboardTests
    };
  }

  async testScreenReaderCompatibility() {
    console.log('\n🔊 Testing Screen Reader Compatibility...');
    
    // Test ARIA attributes
    const ariaElements = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('[aria-label], [aria-describedby], [aria-labelledby], [role]');
      const ariaDetails = [];
      
      elements.forEach(el => {
        const attributes = {};
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('aria-') || attr.name === 'role') {
            attributes[attr.name] = attr.value;
          }
        });
        
        ariaDetails.push({
          tagName: el.tagName,
          className: el.className,
          attributes
        });
      });
      
      return ariaDetails;
    });

    console.log(`🔊 ARIA elements found: ${ariaElements.length}`);
    
    // Test heading hierarchy
    const headingHierarchy = await this.page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const hierarchy = [];
      
      headings.forEach(heading => {
        hierarchy.push({
          level: parseInt(heading.tagName.substring(1)),
          text: heading.textContent.trim(),
          id: heading.id
        });
      });
      
      return hierarchy;
    });

    console.log(`📝 Heading hierarchy: ${headingHierarchy.length} headings`);
    
    // Check for proper heading order
    let properOrder = true;
    let lastLevel = 0;
    
    for (const heading of headingHierarchy) {
      if (heading.level > lastLevel + 1) {
        properOrder = false;
        break;
      }
      lastLevel = heading.level;
    }
    
    console.log(`📊 Proper heading order: ${properOrder ? 'Yes' : 'No'}`);

    // Test alt text for images
    const images = await this.page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      const imageDetails = [];
      
      imgs.forEach(img => {
        imageDetails.push({
          src: img.src,
          alt: img.alt,
          hasAlt: !!img.alt,
          isDecorative: img.alt === '' && img.getAttribute('role') === 'presentation'
        });
      });
      
      return imageDetails;
    });

    const imagesWithAlt = images.filter(img => img.hasAlt || img.isDecorative).length;
    console.log(`🖼️ Images with alt text: ${imagesWithAlt}/${images.length}`);

    this.results.screenReader = {
      ariaElements: ariaElements.length,
      headingCount: headingHierarchy.length,
      properHeadingOrder: properOrder,
      imagesWithAlt: imagesWithAlt,
      totalImages: images.length,
      details: {
        ariaElements,
        headingHierarchy,
        images
      }
    };
  }

  async testColorContrast() {
    console.log('\n🎨 Testing Color Contrast...');
    
    const contrastTests = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const contrastIssues = [];
      
      elements.forEach(el => {
        const style = getComputedStyle(el);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        
        // Skip if colors are transparent or same
        if (color === 'rgba(0, 0, 0, 0)' || 
            backgroundColor === 'rgba(0, 0, 0, 0)' ||
            color === backgroundColor) return;
        
        // Extract RGB values
        const colorMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        const bgMatch = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        
        if (colorMatch && bgMatch) {
          const colorRgb = {
            r: parseInt(colorMatch[1]),
            g: parseInt(colorMatch[2]),
            b: parseInt(colorMatch[3])
          };
          
          const bgRgb = {
            r: parseInt(bgMatch[1]),
            g: parseInt(bgMatch[2]),
            b: parseInt(bgMatch[3])
          };
          
          // Calculate relative luminance
          const getLuminance = (rgb) => {
            const { r, g, b } = rgb;
            const [rs, gs, bs] = [r, g, b].map(c => {
              c = c / 255;
              return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
          };
          
          const colorLuminance = getLuminance(colorRgb);
          const bgLuminance = getLuminance(bgRgb);
          
          // Calculate contrast ratio
          const lighter = Math.max(colorLuminance, bgLuminance);
          const darker = Math.min(colorLuminance, bgLuminance);
          const contrastRatio = (lighter + 0.05) / (darker + 0.05);
          
          // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
          const fontSize = parseFloat(style.fontSize);
          const isLargeText = fontSize >= 18 || (fontSize >= 14 && style.fontWeight >= '700');
          const requiredRatio = isLargeText ? 3 : 4.5;
          
          if (contrastRatio < requiredRatio) {
            contrastIssues.push({
              element: el.tagName,
              className: el.className,
              color,
              backgroundColor,
              contrastRatio: contrastRatio.toFixed(2),
              requiredRatio,
              fontSize,
              isLargeText
            });
          }
        }
      });
      
      return contrastIssues;
    });

    console.log(`🎨 Color contrast issues: ${contrastIssues.length}`);
    
    if (contrastIssues.length > 0) {
      console.log('⚠️ Contrast issues found:');
      contrastIssues.slice(0, 5).forEach(issue => {
        console.log(`   ${issue.element}: ${issue.contrastRatio}:1 (needs ${issue.requiredRatio}:1)`);
      });
    }

    this.results.colorContrast = {
      issues: contrastIssues.length,
      details: contrastIssues
    };
  }

  async testSemanticHTML() {
    console.log('\n📝 Testing Semantic HTML...');
    
    const semanticTests = await this.page.evaluate(() => {
      const semanticElements = {
        main: document.querySelectorAll('main').length,
        nav: document.querySelectorAll('nav').length,
        header: document.querySelectorAll('header').length,
        footer: document.querySelectorAll('footer').length,
        section: document.querySelectorAll('section').length,
        article: document.querySelectorAll('article').length,
        aside: document.querySelectorAll('aside').length,
        button: document.querySelectorAll('button').length,
        input: document.querySelectorAll('input').length,
        label: document.querySelectorAll('label').length,
        form: document.querySelectorAll('form').length,
        table: document.querySelectorAll('table').length,
        th: document.querySelectorAll('th').length,
        td: document.querySelectorAll('td').length
      };
      
      // Check for proper form labels
      const inputs = document.querySelectorAll('input');
      let inputsWithLabels = 0;
      
      inputs.forEach(input => {
        const id = input.id;
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        
        if (label || ariaLabel || ariaLabelledBy) {
          inputsWithLabels++;
        }
      });
      
      // Check for proper table headers
      const tables = document.querySelectorAll('table');
      let tablesWithHeaders = 0;
      
      tables.forEach(table => {
        const headers = table.querySelectorAll('th');
        if (headers.length > 0) {
          tablesWithHeaders++;
        }
      });
      
      return {
        semanticElements,
        inputsWithLabels,
        totalInputs: inputs.length,
        tablesWithHeaders,
        totalTables: tables.length
      };
    });

    console.log(`📝 Semantic elements found:`);
    Object.entries(semanticTests.semanticElements).forEach(([tag, count]) => {
      if (count > 0) {
        console.log(`   ${tag}: ${count}`);
      }
    });
    
    console.log(`🏷️ Inputs with labels: ${semanticTests.inputsWithLabels}/${semanticTests.totalInputs}`);
    console.log(`📊 Tables with headers: ${semanticTests.tablesWithHeaders}/${semanticTests.totalTables}`);

    this.results.semanticHTML = semanticTests;
  }

  async testFocusManagement() {
    console.log('\n🎯 Testing Focus Management...');
    
    const focusTests = await this.page.evaluate(() => {
      const focusableElements = document.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );
      
      const focusDetails = [];
      
      focusableElements.forEach(el => {
        const style = getComputedStyle(el);
        const focusDetails = {
          tagName: el.tagName,
          type: el.type,
          className: el.className,
          id: el.id,
          tabIndex: el.tabIndex,
          isVisible: el.offsetParent !== null,
          hasFocusStyles: style.outline !== 'none' || style.boxShadow !== 'none',
          outline: style.outline,
          boxShadow: style.boxShadow
        };
        
        focusDetails.push(focusDetails);
      });
      
      return {
        totalFocusable: focusableElements.length,
        visibleFocusable: focusDetails.filter(f => f.isVisible).length,
        withFocusStyles: focusDetails.filter(f => f.hasFocusStyles).length,
        details: focusDetails
      };
    });

    console.log(`🎯 Focusable elements: ${focusTests.totalFocusable}`);
    console.log(`👁️ Visible focusable: ${focusTests.visibleFocusable}`);
    console.log(`✨ With focus styles: ${focusTests.withFocusStyles}`);

    // Test focus visibility
    await this.page.keyboard.press('Tab');
    await this.page.waitForTimeout(100);
    
    const focusedElement = await this.page.evaluate(() => {
      const active = document.activeElement;
      if (!active || active === document.body) return null;
      
      const style = getComputedStyle(active);
      return {
        tagName: active.tagName,
        hasFocus: true,
        outline: style.outline,
        boxShadow: style.boxShadow,
        isVisible: active.offsetParent !== null
      };
    });

    console.log(`🎯 Focus visibility: ${focusedElement ? 'Working' : 'Not working'}`);

    this.results.focus = {
      ...focusTests,
      focusVisibility: !!focusedElement
    };
  }

  async testARIAImplementation() {
    console.log('\n🔊 Testing ARIA Implementation...');
    
    const ariaTests = await this.page.evaluate(() => {
      const ariaElements = document.querySelectorAll('[aria-label], [aria-describedby], [aria-labelledby], [role]');
      const ariaDetails = [];
      
      ariaElements.forEach(el => {
        const attributes = {};
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('aria-') || attr.name === 'role') {
            attributes[attr.name] = attr.value;
          }
        });
        
        ariaDetails.push({
          tagName: el.tagName,
          className: el.className,
          attributes,
          hasValidRole: attributes.role && ['button', 'link', 'menuitem', 'tab', 'tabpanel', 'dialog', 'alert', 'status'].includes(attributes.role),
          hasValidAriaLabel: attributes['aria-label'] && attributes['aria-label'].trim().length > 0
        });
      });
      
      return ariaDetails;
    });

    const validAriaElements = ariaTests.filter(el => 
      el.hasValidRole || el.hasValidAriaLabel
    ).length;

    console.log(`🔊 ARIA elements: ${ariaTests.length}`);
    console.log(`✅ Valid ARIA elements: ${validAriaElements}`);

    // Test ARIA live regions
    const liveRegions = await this.page.evaluate(() => {
      const liveElements = document.querySelectorAll('[aria-live]');
      return liveElements.length;
    });

    console.log(`📢 ARIA live regions: ${liveRegions}`);

    this.results.aria = {
      totalElements: ariaTests.length,
      validElements: validAriaElements,
      liveRegions,
      details: ariaTests
    };
  }

  async generateAccessibilityReport() {
    console.log('\n📊 Generating Accessibility Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        keyboardNavigation: this.results.keyboard.tabSteps,
        screenReaderCompatibility: this.results.screenReader.ariaElements,
        colorContrastIssues: this.results.colorContrast.issues,
        semanticElements: Object.values(this.results.semanticHTML.semanticElements).reduce((sum, count) => sum + count, 0),
        focusManagement: this.results.focus.totalFocusable,
        ariaImplementation: this.results.aria.totalElements
      },
      details: this.results,
      recommendations: this.generateAccessibilityRecommendations()
    };

    const reportPath = path.join(__dirname, 'accessibility-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Accessibility report saved: ${reportPath}`);
    
    return report;
  }

  generateAccessibilityRecommendations() {
    const recommendations = [];
    
    if (this.results.keyboard.tabSteps < 5) {
      recommendations.push('Improve keyboard navigation - ensure all interactive elements are reachable');
    }
    
    if (this.results.colorContrast.issues > 0) {
      recommendations.push('Fix color contrast issues to meet WCAG AA standards');
    }
    
    if (this.results.semanticHTML.inputsWithLabels < this.results.semanticHTML.totalInputs) {
      recommendations.push('Add labels to all form inputs for screen reader compatibility');
    }
    
    if (this.results.focus.withFocusStyles < this.results.focus.totalFocusable) {
      recommendations.push('Add visible focus indicators to all focusable elements');
    }
    
    if (this.results.aria.validElements < this.results.aria.totalElements) {
      recommendations.push('Improve ARIA implementation with proper roles and labels');
    }

    return recommendations;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runAccessibilityTests() {
    try {
      await this.initialize();
      await this.testKeyboardNavigation();
      await this.testScreenReaderCompatibility();
      await this.testColorContrast();
      await this.testSemanticHTML();
      await this.testFocusManagement();
      await this.testARIAImplementation();
      
      const report = await this.generateAccessibilityReport();
      
      console.log('\n🎉 Accessibility Testing Complete!');
      console.log(`⌨️ Keyboard navigation: ${report.summary.keyboardNavigation} steps`);
      console.log(`🔊 Screen reader elements: ${report.summary.screenReaderCompatibility}`);
      console.log(`🎨 Color contrast issues: ${report.summary.colorContrastIssues}`);
      
      return report;
    } catch (error) {
      console.error('💥 Accessibility testing failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new AccessibilityTester();
  tester.runAccessibilityTests()
    .then(report => {
      console.log('\n✨ Accessibility Testing Complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Accessibility testing failed:', error);
      process.exit(1);
    });
}

module.exports = AccessibilityTester;
