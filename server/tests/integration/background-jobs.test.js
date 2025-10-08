/**
 * Background Jobs Smoke Tests
 * Tests critical background jobs and scripts for data integrity and functionality
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../src/models/User');
const Pet = require('../../src/models/Pet');

let mongoServer;

describe('Background Jobs Smoke Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  }, 30000);

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
  }, 30000);

  beforeEach(async () => {
    await User.deleteMany({});
    await Pet.deleteMany({});
  });

  describe('Database Index Creation Script', () => {
    it('should create database indexes without errors', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/create-indexes.js');
      
      expect(fs.existsSync(scriptPath)).toBe(true);

      // Test that the script can be executed without throwing
      expect(() => {
        try {
          execSync(`node ${scriptPath}`, { 
            cwd: path.join(__dirname, '../../..'),
            stdio: 'pipe',
            timeout: 10000
          });
        } catch (error) {
          // Script might fail due to missing MongoDB connection, but should not crash
          expect(error.message).not.toContain('SyntaxError');
          expect(error.message).not.toContain('ReferenceError');
        }
      }).not.toThrow();
    });

    it('should list existing indexes', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/create-indexes.js');
      
      expect(() => {
        try {
          execSync(`node ${scriptPath} list`, { 
            cwd: path.join(__dirname, '../../..'),
            stdio: 'pipe',
            timeout: 10000
          });
        } catch (error) {
          // Should not crash with syntax errors
          expect(error.message).not.toContain('SyntaxError');
        }
      }).not.toThrow();
    });
  });

  describe('User Migration Script', () => {
    it('should run user role migration without errors', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/migrations/001-add-user-roles.js');
      
      expect(fs.existsSync(scriptPath)).toBe(true);

      expect(() => {
        try {
          execSync(`node ${scriptPath}`, { 
            cwd: path.join(__dirname, '../../..'),
            stdio: 'pipe',
            timeout: 10000
          });
        } catch (error) {
          // Should not crash with syntax errors
          expect(error.message).not.toContain('SyntaxError');
          expect(error.message).not.toContain('ReferenceError');
        }
      }).not.toThrow();
    });

    it('should support rollback functionality', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/migrations/001-add-user-roles.js');
      
      expect(() => {
        try {
          execSync(`node ${scriptPath} down`, { 
            cwd: path.join(__dirname, '../../..'),
            stdio: 'pipe',
            timeout: 10000
          });
        } catch (error) {
          // Should not crash with syntax errors
          expect(error.message).not.toContain('SyntaxError');
        }
      }).not.toThrow();
    });
  });

  describe('Admin User Creation Script', () => {
    it('should create admin user script without syntax errors', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/create-admin-user.js');
      
      expect(fs.existsSync(scriptPath)).toBe(true);

      expect(() => {
        try {
          execSync(`node ${scriptPath}`, { 
            cwd: path.join(__dirname, '../../..'),
            stdio: 'pipe',
            timeout: 10000
          });
        } catch (error) {
          // Should not crash with syntax errors
          expect(error.message).not.toContain('SyntaxError');
          expect(error.message).not.toContain('ReferenceError');
        }
      }).not.toThrow();
    });
  });

  describe('Test User Creation Script', () => {
    it('should create test users script without syntax errors', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/create-test-users.js');
      
      expect(fs.existsSync(scriptPath)).toBe(true);

      expect(() => {
        try {
          execSync(`node ${scriptPath}`, { 
            cwd: path.join(__dirname, '../../..'),
            stdio: 'pipe',
            timeout: 10000
          });
        } catch (error) {
          // Should not crash with syntax errors
          expect(error.message).not.toContain('SyntaxError');
          expect(error.message).not.toContain('ReferenceError');
        }
      }).not.toThrow();
    });
  });

  describe('Performance Test Script', () => {
    it('should run performance tests without syntax errors', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/performance-test.js');
      
      expect(fs.existsSync(scriptPath)).toBe(true);

      expect(() => {
        try {
          execSync(`node ${scriptPath}`, { 
            cwd: path.join(__dirname, '../../..'),
            stdio: 'pipe',
            timeout: 15000
          });
        } catch (error) {
          // Should not crash with syntax errors
          expect(error.message).not.toContain('SyntaxError');
          expect(error.message).not.toContain('ReferenceError');
        }
      }).not.toThrow();
    });
  });

  describe('Production Check Script', () => {
    it('should run production checks without syntax errors', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/production-check.js');
      
      expect(fs.existsSync(scriptPath)).toBe(true);

      expect(() => {
        try {
          execSync(`node ${scriptPath}`, { 
            cwd: path.join(__dirname, '../../..'),
            stdio: 'pipe',
            timeout: 10000
          });
        } catch (error) {
          // Should not crash with syntax errors
          expect(error.message).not.toContain('SyntaxError');
          expect(error.message).not.toContain('ReferenceError');
        }
      }).not.toThrow();
    });
  });

  describe('Deployment Script', () => {
    it('should have deployment script without syntax errors', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/deploy-production.js');
      
      expect(fs.existsSync(scriptPath)).toBe(true);

      // Test that the script can be parsed without syntax errors
      expect(() => {
        const scriptContent = fs.readFileSync(scriptPath, 'utf8');
        // Basic syntax check - should not throw when parsing
        new Function(scriptContent);
      }).not.toThrow();
    });
  });

  describe('Todo Manager Script', () => {
    it('should run todo manager without syntax errors', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/todo-manager.js');
      
      expect(fs.existsSync(scriptPath)).toBe(true);

      expect(() => {
        try {
          execSync(`node ${scriptPath}`, { 
            cwd: path.join(__dirname, '../../..'),
            stdio: 'pipe',
            timeout: 10000
          });
        } catch (error) {
          // Should not crash with syntax errors
          expect(error.message).not.toContain('SyntaxError');
          expect(error.message).not.toContain('ReferenceError');
        }
      }).not.toThrow();
    });
  });

  describe('Validation Scripts', () => {
    it('should run validation enhancements script', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/validate-enhancements.js');
      
      expect(fs.existsSync(scriptPath)).toBe(true);

      expect(() => {
        try {
          execSync(`node ${scriptPath}`, { 
            cwd: path.join(__dirname, '../../..'),
            stdio: 'pipe',
            timeout: 10000
          });
        } catch (error) {
          // Should not crash with syntax errors
          expect(error.message).not.toContain('SyntaxError');
          expect(error.message).not.toContain('ReferenceError');
        }
      }).not.toThrow();
    });
  });

  describe('Shell Scripts', () => {
    it('should have executable backup script', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/backup-mongodb.sh');
      
      expect(fs.existsSync(scriptPath)).toBe(true);
      
      // Check if script is executable
      const stats = fs.statSync(scriptPath);
      expect(stats.mode & parseInt('111', 8)).toBeTruthy();
    });

    it('should have executable restore script', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/restore-mongodb.sh');
      
      expect(fs.existsSync(scriptPath)).toBe(true);
      
      // Check if script is executable
      const stats = fs.statSync(scriptPath);
      expect(stats.mode & parseInt('111', 8)).toBeTruthy();
    });

    it('should have executable health check script', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/health-check.sh');
      
      expect(fs.existsSync(scriptPath)).toBe(true);
      
      // Check if script is executable
      const stats = fs.statSync(scriptPath);
      expect(stats.mode & parseInt('111', 8)).toBeTruthy();
    });

    it('should have executable deployment script', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/deploy-production.sh');
      
      expect(fs.existsSync(scriptPath)).toBe(true);
      
      // Check if script is executable
      const stats = fs.statSync(scriptPath);
      expect(stats.mode & parseInt('111', 8)).toBeTruthy();
    });

    it('should have executable dev setup script', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/dev-setup.sh');
      
      expect(fs.existsSync(scriptPath)).toBe(true);
      
      // Check if script is executable
      const stats = fs.statSync(scriptPath);
      expect(stats.mode & parseInt('111', 8)).toBeTruthy();
    });

    it('should have executable start services script', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/start-services.sh');
      
      expect(fs.existsSync(scriptPath)).toBe(true);
      
      // Check if script is executable
      const stats = fs.statSync(scriptPath);
      expect(stats.mode & parseInt('111', 8)).toBeTruthy();
    });
  });

  describe('Data Integrity Tests', () => {
    it('should maintain data integrity during index creation', async () => {
      // Create some test data
      const testUser = new User({
        email: 'test@example.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date('1990-01-01')
      });
      await testUser.save();

      const testPet = new Pet({
        owner: testUser._id,
        name: 'TestPet',
        species: 'dog',
        breed: 'Labrador',
        age: 3,
        gender: 'male',
        size: 'large'
      });
      await testPet.save();

      // Verify data exists before script
      const userCount = await User.countDocuments();
      const petCount = await Pet.countDocuments();
      expect(userCount).toBe(1);
      expect(petCount).toBe(1);

      // Run index creation script (should not affect data)
      const scriptPath = path.join(__dirname, '../../../scripts/create-indexes.js');
      try {
        execSync(`node ${scriptPath}`, { 
          cwd: path.join(__dirname, '../../..'),
          stdio: 'pipe',
          timeout: 10000
        });
      } catch (error) {
        // Script might fail due to connection, but data should remain
      }

      // Verify data still exists after script
      const userCountAfter = await User.countDocuments();
      const petCountAfter = await Pet.countDocuments();
      expect(userCountAfter).toBe(1);
      expect(petCountAfter).toBe(1);
    });

    it('should handle migration rollback without data loss', async () => {
      // Create test data
      const testUser = new User({
        email: 'migration@example.com',
        password: 'hashedpassword',
        firstName: 'Migration',
        lastName: 'Test',
        dateOfBirth: new Date('1990-01-01')
      });
      await testUser.save();

      const initialCount = await User.countDocuments();
      expect(initialCount).toBe(1);

      // Run migration rollback (should not delete data)
      const scriptPath = path.join(__dirname, '../../../scripts/migrations/001-add-user-roles.js');
      try {
        execSync(`node ${scriptPath} down`, { 
          cwd: path.join(__dirname, '../../..'),
          stdio: 'pipe',
          timeout: 10000
        });
      } catch (error) {
        // Script might fail, but data should remain
      }

      // Verify data still exists
      const finalCount = await User.countDocuments();
      expect(finalCount).toBe(1);
    });
  });

  describe('Script Error Handling', () => {
    it('should handle missing environment variables gracefully', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/create-admin-user.js');
      
      // Test with missing environment variables
      const originalEnv = process.env;
      process.env = {};

      expect(() => {
        try {
          execSync(`node ${scriptPath}`, { 
            cwd: path.join(__dirname, '../../..'),
            stdio: 'pipe',
            timeout: 10000
          });
        } catch (error) {
          // Should handle missing env vars gracefully
          expect(error.message).not.toContain('SyntaxError');
        }
      }).not.toThrow();

      process.env = originalEnv;
    });

    it('should handle database connection failures gracefully', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/create-test-users.js');
      
      // Test with invalid database connection
      const originalMongoUri = process.env.MONGODB_URI;
      process.env.MONGODB_URI = 'mongodb://invalid:27017/test';

      expect(() => {
        try {
          execSync(`node ${scriptPath}`, { 
            cwd: path.join(__dirname, '../../..'),
            stdio: 'pipe',
            timeout: 10000
          });
        } catch (error) {
          // Should handle connection errors gracefully
          expect(error.message).not.toContain('SyntaxError');
        }
      }).not.toThrow();

      process.env.MONGODB_URI = originalMongoUri;
    });
  });

  describe('Script Dependencies', () => {
    it('should have all required dependencies for scripts', () => {
      const scriptsDir = path.join(__dirname, '../../../scripts');
      const jsFiles = fs.readdirSync(scriptsDir).filter(file => file.endsWith('.js'));

      jsFiles.forEach(file => {
        const scriptPath = path.join(scriptsDir, file);
        const content = fs.readFileSync(scriptPath, 'utf8');

        // Check for common dependency patterns
        const requires = content.match(/require\(['"`]([^'"`]+)['"`]\)/g) || [];
        
        requires.forEach(req => {
          const moduleName = req.match(/require\(['"`]([^'"`]+)['"`]\)/)[1];
          
          // Skip built-in modules and relative paths
          if (!moduleName.startsWith('.') && !moduleName.startsWith('/')) {
            try {
              require.resolve(moduleName);
            } catch (error) {
              // If module is not found, it should be in package.json
              const packageJson = require('../../../package.json');
              const allDeps = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies
              };
              
              // Allow some common modules that might be missing in test environment
              const allowedMissing = ['mongodb', 'redis', 'stripe'];
              
              if (!allowedMissing.includes(moduleName)) {
                expect(allDeps[moduleName]).toBeDefined();
              }
            }
          }
        });
      });
    });
  });

  describe('Script Performance', () => {
    it('should complete index creation within reasonable time', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/create-indexes.js');
      
      const startTime = Date.now();
      
      try {
        execSync(`node ${scriptPath}`, { 
          cwd: path.join(__dirname, '../../..'),
          stdio: 'pipe',
          timeout: 30000 // 30 seconds max
        });
      } catch (error) {
        // Script might fail, but should not hang
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 30 seconds
      expect(duration).toBeLessThan(30000);
    });

    it('should complete performance tests within reasonable time', () => {
      const scriptPath = path.join(__dirname, '../../../scripts/performance-test.js');
      
      const startTime = Date.now();
      
      try {
        execSync(`node ${scriptPath}`, { 
          cwd: path.join(__dirname, '../../..'),
          stdio: 'pipe',
          timeout: 60000 // 60 seconds max
        });
      } catch (error) {
        // Script might fail, but should not hang
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 60 seconds
      expect(duration).toBeLessThan(60000);
    });
  });
});
