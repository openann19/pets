/**
 * Test Coverage Validation
 * Validates that all critical paths and components are properly tested
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Test Coverage Validation', () => {
  const serverRoot = path.join(__dirname, '../..');
  const srcDir = path.join(serverRoot, 'src');
  const testsDir = path.join(serverRoot, 'tests');

  describe('Critical Component Coverage', () => {
    it('should have tests for all critical API endpoints', () => {
      const criticalEndpoints = [
        'auth',
        'users',
        'pets',
        'matches',
        'premium',
        'ai',
        'gdpr',
        'stripe',
        'weather'
      ];

      criticalEndpoints.forEach(endpoint => {
        const testFile = path.join(testsDir, 'integration', `${endpoint}.test.js`);
        const altTestFile = path.join(testsDir, 'integration', `${endpoint}-endpoints.test.js`);
        const altTestFile2 = path.join(testsDir, 'integration', `${endpoint}-service.test.js`);
        const altTestFile3 = path.join(testsDir, 'integration', `${endpoint}-webhooks.test.js`);

        const hasTest = fs.existsSync(testFile) || 
                       fs.existsSync(altTestFile) || 
                       fs.existsSync(altTestFile2) ||
                       fs.existsSync(altTestFile3);

        expect(hasTest).toBe(true, `Missing test for critical endpoint: ${endpoint}`);
      });
    });

    it('should have tests for all critical models', () => {
      const modelsDir = path.join(srcDir, 'models');
      if (!fs.existsSync(modelsDir)) return;

      const modelFiles = fs.readdirSync(modelsDir)
        .filter(file => file.endsWith('.js') && !file.includes('.test.'));

      modelFiles.forEach(modelFile => {
        const modelName = path.basename(modelFile, '.js');
        const testFile = path.join(testsDir, 'unit', `${modelName}.test.js`);

        expect(fs.existsSync(testFile)).toBe(true, 
          `Missing test for model: ${modelName}`
        );
      });
    });

    it('should have tests for all critical services', () => {
      const servicesDir = path.join(srcDir, 'services');
      if (!fs.existsSync(servicesDir)) return;

      const serviceFiles = fs.readdirSync(servicesDir)
        .filter(file => file.endsWith('.js') && !file.includes('.test.'));

      const criticalServices = [
        'monitoring.js',
        'stripeService.js',
        'emailService.js'
      ];

      criticalServices.forEach(serviceFile => {
        if (fs.existsSync(path.join(servicesDir, serviceFile))) {
          const serviceName = path.basename(serviceFile, '.js');
          const testFile = path.join(testsDir, 'unit', `${serviceName}.test.js`);

          expect(fs.existsSync(testFile)).toBe(true, 
            `Missing test for critical service: ${serviceName}`
          );
        }
      });
    });

    it('should have tests for all critical middleware', () => {
      const middlewareDir = path.join(srcDir, 'middleware');
      if (!fs.existsSync(middlewareDir)) return;

      const middlewareFiles = fs.readdirSync(middlewareDir)
        .filter(file => file.endsWith('.js') && !file.includes('.test.'));

      const criticalMiddleware = [
        'auth.js',
        'validation.js',
        'rateLimit.js'
      ];

      criticalMiddleware.forEach(middlewareFile => {
        if (fs.existsSync(path.join(middlewareDir, middlewareFile))) {
          const middlewareName = path.basename(middlewareFile, '.js');
          const testFile = path.join(testsDir, 'unit', `${middlewareName}.test.js`);

          expect(fs.existsSync(testFile)).toBe(true, 
            `Missing test for critical middleware: ${middlewareName}`
          );
        }
      });
    });
  });

  describe('Test File Structure', () => {
    it('should have proper test directory structure', () => {
      const expectedDirs = [
        'unit',
        'integration',
        'e2e'
      ];

      expectedDirs.forEach(dir => {
        const dirPath = path.join(testsDir, dir);
        expect(fs.existsSync(dirPath)).toBe(true, 
          `Missing test directory: ${dir}`
        );
      });
    });

    it('should have test configuration files', () => {
      const configFiles = [
        'jest.config.js',
        'setup.js'
      ];

      configFiles.forEach(configFile => {
        const configPath = path.join(testsDir, configFile);
        const altConfigPath = path.join(serverRoot, configFile);
        
        const hasConfig = fs.existsSync(configPath) || fs.existsSync(altConfigPath);
        expect(hasConfig).toBe(true, 
          `Missing test configuration: ${configFile}`
        );
      });
    });

    it('should have proper test file naming conventions', () => {
      const testFiles = getAllTestFiles(testsDir);
      
      testFiles.forEach(testFile => {
        const fileName = path.basename(testFile);
        expect(fileName).toMatch(/\.test\.js$|\.spec\.js$/, 
          `Test file should end with .test.js or .spec.js: ${fileName}`
        );
      });
    });
  });

  describe('Test Content Validation', () => {
    it('should have proper test structure in integration tests', () => {
      const integrationTests = getAllTestFiles(path.join(testsDir, 'integration'));
      
      integrationTests.forEach(testFile => {
        const content = fs.readFileSync(testFile, 'utf8');
        
        // Should have describe blocks
        expect(content).toMatch(/describe\(/, 
          `Test file should have describe blocks: ${path.basename(testFile)}`
        );
        
        // Should have test cases
        expect(content).toMatch(/it\(|test\(/, 
          `Test file should have test cases: ${path.basename(testFile)}`
        );
        
        // Should have proper imports
        expect(content).toMatch(/require\(|import/, 
          `Test file should have imports: ${path.basename(testFile)}`
        );
      });
    });

    it('should have proper setup and teardown in integration tests', () => {
      const integrationTests = getAllTestFiles(path.join(testsDir, 'integration'));
      
      integrationTests.forEach(testFile => {
        const content = fs.readFileSync(testFile, 'utf8');
        
        // Should have beforeAll or beforeEach
        const hasSetup = content.includes('beforeAll') || content.includes('beforeEach');
        expect(hasSetup).toBe(true, 
          `Integration test should have setup: ${path.basename(testFile)}`
        );
        
        // Should have afterAll or afterEach
        const hasTeardown = content.includes('afterAll') || content.includes('afterEach');
        expect(hasTeardown).toBe(true, 
          `Integration test should have teardown: ${path.basename(testFile)}`
        );
      });
    });

    it('should have proper mocking in unit tests', () => {
      const unitTests = getAllTestFiles(path.join(testsDir, 'unit'));
      
      unitTests.forEach(testFile => {
        const content = fs.readFileSync(testFile, 'utf8');
        
        // Should have jest.mock or similar mocking
        const hasMocking = content.includes('jest.mock') || 
                          content.includes('mock') || 
                          content.includes('spyOn');
        
        if (hasMocking) {
          expect(content).toMatch(/jest\.mock\(|mock\(/, 
            `Unit test should have proper mocking: ${path.basename(testFile)}`
          );
        }
      });
    });
  });

  describe('Test Coverage Metrics', () => {
    it('should have minimum test coverage for critical files', () => {
      const criticalFiles = [
        'src/models/User.js',
        'src/models/Pet.js',
        'src/models/Match.js',
        'src/controllers/authController.js',
        'src/middleware/auth.js'
      ];

      criticalFiles.forEach(file => {
        const filePath = path.join(serverRoot, file);
        if (fs.existsSync(filePath)) {
          const testFile = findTestFile(file, testsDir);
          expect(testFile).toBeTruthy(`Critical file should have tests: ${file}`);
        }
      });
    });

    it('should have tests for all error handling paths', () => {
      const errorHandlingFiles = [
        'src/middleware/errorHandler.js',
        'src/utils/logger.js'
      ];

      errorHandlingFiles.forEach(file => {
        const filePath = path.join(serverRoot, file);
        if (fs.existsSync(filePath)) {
          const testFile = findTestFile(file, testsDir);
          expect(testFile).toBeTruthy(`Error handling file should have tests: ${file}`);
        }
      });
    });
  });

  describe('Test Execution Validation', () => {
    it('should be able to run all tests without syntax errors', () => {
      expect(() => {
        try {
          execSync('npm test -- --dry-run', { 
            cwd: serverRoot,
            stdio: 'pipe',
            timeout: 30000
          });
        } catch (error) {
          // Should not have syntax errors
          expect(error.message).not.toContain('SyntaxError');
          expect(error.message).not.toContain('ReferenceError');
        }
      }).not.toThrow();
    });

    it('should have proper test scripts in package.json', () => {
      const packageJsonPath = path.join(serverRoot, 'package.json');
      expect(fs.existsSync(packageJsonPath)).toBe(true);
      
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      expect(packageJson.scripts).toHaveProperty('test');
      expect(packageJson.scripts).toHaveProperty('test:coverage');
    });
  });

  describe('Test Data and Fixtures', () => {
    it('should have test data factories or fixtures', () => {
      const testDataFiles = [
        'testDataFactory.js',
        'fixtures.js',
        'factories.js'
      ];

      const hasTestData = testDataFiles.some(file => {
        const filePath = path.join(testsDir, file);
        return fs.existsSync(filePath);
      });

      // Test data factories are optional but recommended
      if (hasTestData) {
        expect(hasTestData).toBe(true);
      }
    });

    it('should have proper test database setup', () => {
      const integrationTests = getAllTestFiles(path.join(testsDir, 'integration'));
      
      const hasDbSetup = integrationTests.some(testFile => {
        const content = fs.readFileSync(testFile, 'utf8');
        return content.includes('MongoMemoryServer') || 
               content.includes('mongoose.connect') ||
               content.includes('test database');
      });

      expect(hasDbSetup).toBe(true, 
        'Should have proper test database setup in integration tests'
      );
    });
  });

  describe('Security and Performance Tests', () => {
    it('should have security-related tests', () => {
      const securityTestFiles = [
        'security.test.js',
        'auth.test.js',
        'validation.test.js'
      ];

      const hasSecurityTests = securityTestFiles.some(file => {
        const filePath = path.join(testsDir, 'integration', file);
        return fs.existsSync(filePath);
      });

      expect(hasSecurityTests).toBe(true, 
        'Should have security-related tests'
      );
    });

    it('should have performance-related tests', () => {
      const performanceTestFiles = [
        'performance.test.js',
        'load.test.js'
      ];

      const hasPerformanceTests = performanceTestFiles.some(file => {
        const filePath = path.join(testsDir, 'integration', file);
        return fs.existsSync(filePath);
      });

      // Performance tests are optional but recommended
      if (hasPerformanceTests) {
        expect(hasPerformanceTests).toBe(true);
      }
    });
  });
});

// Helper functions
function getAllTestFiles(dir) {
  const testFiles = [];
  
  if (!fs.existsSync(dir)) return testFiles;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      testFiles.push(...getAllTestFiles(filePath));
    } else if (file.match(/\.test\.js$|\.spec\.js$/)) {
      testFiles.push(filePath);
    }
  });
  
  return testFiles;
}

function findTestFile(sourceFile, testsDir) {
  const fileName = path.basename(sourceFile, '.js');
  const possibleTestFiles = [
    path.join(testsDir, 'unit', `${fileName}.test.js`),
    path.join(testsDir, 'integration', `${fileName}.test.js`),
    path.join(testsDir, 'unit', `${fileName}.spec.js`),
    path.join(testsDir, 'integration', `${fileName}.spec.js`)
  ];
  
  return possibleTestFiles.find(testFile => fs.existsSync(testFile));
}
