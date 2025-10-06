#!/usr/bin/env node

/**
 * Automated Database Backup Script
 * Creates comprehensive backups of MongoDB data with compression and encryption
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');
const logger = require('../src/utils/logger');

// Configuration
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pawfectmatch';
const BACKUP_RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
const ENCRYPTION_KEY = process.env.BACKUP_ENCRYPTION_KEY || null;

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Generate backup filename with timestamp
 */
function generateBackupFilename(type = 'full') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `pawfectmatch-${type}-${timestamp}`;
}

/**
 * Create full database backup using mongodump
 */
async function createFullBackup() {
  try {
    logger.info('🗄️ Creating full database backup...');
    
    const backupName = generateBackupFilename('full');
    const backupPath = path.join(BACKUP_DIR, backupName);
    
    // Create backup directory
    fs.mkdirSync(backupPath, { recursive: true });
    
    // Build mongodump command
    const dumpCommand = `mongodump --uri="${MONGODB_URI}" --out="${backupPath}" --gzip`;
    
    // Execute backup
    await new Promise((resolve, reject) => {
      exec(dumpCommand, (error, stdout, stderr) => {
        if (error) {
          logger.error('Mongodump error:', error);
          reject(error);
          return;
        }
        
        if (stderr && !stderr.includes('warning')) {
          logger.warn('Mongodump stderr:', stderr);
        }
        
        logger.info('Mongodump completed successfully');
        resolve();
      });
    });
    
    // Compress backup
    const compressedPath = `${backupPath}.tar.gz`;
    const compressCommand = `tar -czf "${compressedPath}" -C "${BACKUP_DIR}" "${backupName}"`;
    
    await new Promise((resolve, reject) => {
      exec(compressCommand, (error) => {
        if (error) {
          logger.error('Compression error:', error);
          reject(error);
          return;
        }
        resolve();
      });
    });
    
    // Remove uncompressed directory
    fs.rmSync(backupPath, { recursive: true, force: true });
    
    // Encrypt backup if key provided
    if (ENCRYPTION_KEY) {
      await encryptBackup(compressedPath);
    }
    
    logger.info(`✅ Full backup created: ${compressedPath}`);
    return compressedPath;
    
  } catch (error) {
    logger.error('❌ Full backup failed:', error);
    throw error;
  }
}

/**
 * Create incremental backup (only changed data)
 */
async function createIncrementalBackup() {
  try {
    logger.info('📊 Creating incremental backup...');
    
    const backupName = generateBackupFilename('incremental');
    const backupPath = path.join(BACKUP_DIR, backupName);
    
    // Get last backup timestamp
    const lastBackupFile = getLastBackupFile();
    const lastBackupTime = lastBackupFile ? fs.statSync(lastBackupFile).mtime : new Date(0);
    
    // Create backup directory
    fs.mkdirSync(backupPath, { recursive: true });
    
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    
    // Get collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const incrementalData = {
      timestamp: new Date().toISOString(),
      lastBackupTime: lastBackupTime.toISOString(),
      collections: {}
    };
    
    // Backup only modified documents
    for (const collection of collections) {
      const collectionName = collection.name;
      const collectionData = await db.collection(collectionName)
        .find({ 
          $or: [
            { createdAt: { $gte: lastBackupTime } },
            { updatedAt: { $gte: lastBackupTime } }
          ]
        })
        .toArray();
      
      if (collectionData.length > 0) {
        incrementalData.collections[collectionName] = collectionData;
        logger.info(`Found ${collectionData.length} modified documents in ${collectionName}`);
      }
    }
    
    // Save incremental backup
    const backupFile = path.join(backupPath, 'incremental.json');
    fs.writeFileSync(backupFile, JSON.stringify(incrementalData, null, 2));
    
    // Compress
    const compressedPath = `${backupPath}.tar.gz`;
    const compressCommand = `tar -czf "${compressedPath}" -C "${BACKUP_DIR}" "${backupName}"`;
    
    await new Promise((resolve, reject) => {
      exec(compressCommand, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
    
    // Remove uncompressed directory
    fs.rmSync(backupPath, { recursive: true, force: true });
    
    // Encrypt if key provided
    if (ENCRYPTION_KEY) {
      await encryptBackup(compressedPath);
    }
    
    logger.info(`✅ Incremental backup created: ${compressedPath}`);
    return compressedPath;
    
  } catch (error) {
    logger.error('❌ Incremental backup failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

/**
 * Encrypt backup file
 */
async function encryptBackup(filePath) {
  try {
    logger.info('🔐 Encrypting backup...');
    
    const encryptedPath = `${filePath}.enc`;
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher('aes-256-cbc', key);
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(encryptedPath);
    
    // Write IV to beginning of encrypted file
    output.write(iv);
    
    input.pipe(cipher).pipe(output);
    
    await new Promise((resolve, reject) => {
      output.on('finish', () => {
        // Remove unencrypted file
        fs.unlinkSync(filePath);
        logger.info(`✅ Backup encrypted: ${encryptedPath}`);
        resolve();
      });
      output.on('error', reject);
    });
    
  } catch (error) {
    logger.error('❌ Encryption failed:', error);
    throw error;
  }
}

/**
 * Get the most recent backup file
 */
function getLastBackupFile() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith('.tar.gz') || file.endsWith('.tar.gz.enc'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        mtime: fs.statSync(path.join(BACKUP_DIR, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);
    
    return files.length > 0 ? files[0].path : null;
  } catch (error) {
    logger.warn('Could not find last backup file:', error);
    return null;
  }
}

/**
 * Clean up old backups based on retention policy
 */
async function cleanupOldBackups() {
  try {
    logger.info('🧹 Cleaning up old backups...');
    
    const files = fs.readdirSync(BACKUP_DIR)
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        mtime: fs.statSync(path.join(BACKUP_DIR, file)).mtime
      }))
      .filter(file => {
        const ageInDays = (Date.now() - file.mtime.getTime()) / (1000 * 60 * 60 * 24);
        return ageInDays > BACKUP_RETENTION_DAYS;
      });
    
    let deletedCount = 0;
    for (const file of files) {
      try {
        fs.unlinkSync(file.path);
        deletedCount++;
        logger.info(`Deleted old backup: ${file.name}`);
      } catch (error) {
        logger.warn(`Failed to delete backup ${file.name}:`, error);
      }
    }
    
    logger.info(`✅ Cleaned up ${deletedCount} old backups`);
    
  } catch (error) {
    logger.error('❌ Cleanup failed:', error);
  }
}

/**
 * Restore database from backup
 */
async function restoreFromBackup(backupPath, options = {}) {
  try {
    logger.info(`🔄 Restoring database from: ${backupPath}`);
    
    const { drop = false, collections = [] } = options;
    
    // Decrypt if encrypted
    let workingPath = backupPath;
    if (backupPath.endsWith('.enc')) {
      workingPath = await decryptBackup(backupPath);
    }
    
    // Extract if compressed
    if (workingPath.endsWith('.tar.gz')) {
      const extractPath = workingPath.replace('.tar.gz', '');
      const extractCommand = `tar -xzf "${workingPath}" -C "${path.dirname(workingPath)}"`;
      
      await new Promise((resolve, reject) => {
        exec(extractCommand, (error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
      
      workingPath = extractPath;
    }
    
    // Build mongorestore command
    let restoreCommand = `mongorestore --uri="${MONGODB_URI}"`;
    
    if (drop) {
      restoreCommand += ' --drop';
    }
    
    if (collections.length > 0) {
      restoreCommand += ` --collection ${collections.join(' --collection ')}`;
    }
    
    restoreCommand += ` "${workingPath}"`;
    
    // Execute restore
    await new Promise((resolve, reject) => {
      exec(restoreCommand, (error, stdout, stderr) => {
        if (error) {
          logger.error('Mongorestore error:', error);
          reject(error);
          return;
        }
        
        if (stderr && !stderr.includes('warning')) {
          logger.warn('Mongorestore stderr:', stderr);
        }
        
        logger.info('Mongorestore completed successfully');
        resolve();
      });
    });
    
    logger.info('✅ Database restore completed');
    
  } catch (error) {
    logger.error('❌ Database restore failed:', error);
    throw error;
  }
}

/**
 * Decrypt backup file
 */
async function decryptBackup(encryptedPath) {
  try {
    logger.info('🔓 Decrypting backup...');
    
    const decryptedPath = encryptedPath.replace('.enc', '');
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    
    const input = fs.createReadStream(encryptedPath);
    const output = fs.createWriteStream(decryptedPath);
    
    // Read IV from beginning of file
    const iv = Buffer.alloc(16);
    input.read(iv);
    
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    input.pipe(decipher).pipe(output);
    
    await new Promise((resolve, reject) => {
      output.on('finish', () => {
        logger.info(`✅ Backup decrypted: ${decryptedPath}`);
        resolve();
      });
      output.on('error', reject);
    });
    
    return decryptedPath;
    
  } catch (error) {
    logger.error('❌ Decryption failed:', error);
    throw error;
  }
}

/**
 * Get backup statistics
 */
function getBackupStats() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          type: file.includes('incremental') ? 'incremental' : 'full'
        };
      });
    
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const fullBackups = files.filter(f => f.type === 'full').length;
    const incrementalBackups = files.filter(f => f.type === 'incremental').length;
    
    return {
      totalBackups: files.length,
      fullBackups,
      incrementalBackups,
      totalSize,
      totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      oldestBackup: files.length > 0 ? Math.min(...files.map(f => f.created.getTime())) : null,
      newestBackup: files.length > 0 ? Math.max(...files.map(f => f.created.getTime())) : null
    };
    
  } catch (error) {
    logger.error('Failed to get backup stats:', error);
    return null;
  }
}

/**
 * Main backup function
 */
async function main() {
  const command = process.argv[2];
  const options = process.argv.slice(3);
  
  try {
    switch (command) {
      case 'full':
        await createFullBackup();
        break;
        
      case 'incremental':
        await createIncrementalBackup();
        break;
        
      case 'cleanup':
        await cleanupOldBackups();
        break;
        
      case 'restore':
        if (options.length === 0) {
          logger.error('❌ Please provide backup file path');
          process.exit(1);
        }
        const restoreOptions = {
          drop: options.includes('--drop'),
          collections: options.filter(opt => !opt.startsWith('--'))
        };
        await restoreFromBackup(options[0], restoreOptions);
        break;
        
      case 'stats':
        const stats = getBackupStats();
        console.log(JSON.stringify(stats, null, 2));
        break;
        
      case 'list':
        const files = fs.readdirSync(BACKUP_DIR)
          .map(file => {
            const filePath = path.join(BACKUP_DIR, file);
            const stats = fs.statSync(filePath);
            return {
              name: file,
              size: Math.round(stats.size / (1024 * 1024) * 100) / 100 + ' MB',
              created: stats.birthtime.toISOString(),
              type: file.includes('incremental') ? 'incremental' : 'full'
            };
          })
          .sort((a, b) => new Date(b.created) - new Date(a.created));
        
        console.table(files);
        break;
        
      default:
        console.log(`
🗄️ PawfectMatch Database Backup Tool

Usage: node backup-database.js <command> [options]

Commands:
  full                    Create full database backup
  incremental            Create incremental backup
  cleanup                Clean up old backups
  restore <file> [--drop] Restore from backup
  stats                  Show backup statistics
  list                   List all backups

Examples:
  node backup-database.js full
  node backup-database.js incremental
  node backup-database.js restore /path/to/backup.tar.gz
  node backup-database.js restore /path/to/backup.tar.gz --drop
  node backup-database.js cleanup
  node backup-database.js stats
  node backup-database.js list

Environment Variables:
  BACKUP_DIR              Backup directory (default: ./backups)
  MONGODB_URI            MongoDB connection string
  BACKUP_RETENTION_DAYS  Days to keep backups (default: 30)
  BACKUP_ENCRYPTION_KEY  Encryption key for backups (optional)
        `);
        process.exit(1);
    }
    
    // Cleanup old backups after successful backup
    if (command === 'full' || command === 'incremental') {
      await cleanupOldBackups();
    }
    
  } catch (error) {
    logger.error('❌ Backup operation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  createFullBackup,
  createIncrementalBackup,
  restoreFromBackup,
  cleanupOldBackups,
  getBackupStats
};
