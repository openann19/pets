#!/usr/bin/env node

/**
 * Script to create MongoDB indexes
 * Run this after deploying to production or when models change
 * 
 * Usage: node scripts/create-indexes.js
 */

const path = require('path');

// Change to server directory to resolve modules correctly
const serverDir = path.join(__dirname, '../server');
process.chdir(serverDir);

const mongoose = require(path.join(serverDir, 'node_modules/mongoose'));
const dotenv = require(path.join(serverDir, 'node_modules/dotenv'));
dotenv.config({ path: path.join(serverDir, '.env') });

const logger = console;

// Import models
const Pet = require(path.join(serverDir, 'src/models/Pet'));
const User = require(path.join(serverDir, 'src/models/User'));
const Match = require(path.join(serverDir, 'src/models/Match'));

/**
 * Create indexes for all models
 */
async function createIndexes() {
  try {
    logger.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pawfectmatch');
    
    logger.log('✅ Connected to MongoDB');
    logger.log('📊 Creating indexes...\n');

    // Create indexes for each model
    const models = [
      { name: 'User', model: User },
      { name: 'Pet', model: Pet },
      { name: 'Match', model: Match }
    ];

    for (const { name, model } of models) {
      logger.log(`Creating indexes for ${name} model...`);
      
      try {
        await model.createIndexes();
        
        // Get index information
        const indexes = await model.collection.getIndexes();
        logger.log(`✅ ${name} indexes created (${Object.keys(indexes).length} total):`);
        
        Object.keys(indexes).forEach(indexName => {
          logger.log(`   - ${indexName}`);
        });
        
        logger.log('');
      } catch (error) {
        logger.error(`❌ Error creating indexes for ${name}:`, error.message);
      }
    }

    logger.log('\n✅ All indexes created successfully!');
    logger.log('\n📋 Summary:');
    logger.log(`   Database: ${mongoose.connection.db.databaseName}`);
    logger.log(`   Collections: ${models.length}`);
    
  } catch (error) {
    logger.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

/**
 * Drop all indexes (use with caution!)
 */
async function dropIndexes() {
  try {
    logger.log('⚠️  WARNING: Dropping all indexes...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pawfectmatch');
    
    const models = [User, Pet, Match];
    
    for (const model of models) {
      try {
        await model.collection.dropIndexes();
        logger.log(`✅ Indexes dropped for ${model.modelName}`);
      } catch (error) {
        logger.error(`Error dropping indexes for ${model.modelName}:`, error.message);
      }
    }
    
    logger.log('✅ All indexes dropped');
    
  } catch (error) {
    logger.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

/**
 * List all indexes
 */
async function listIndexes() {
  try {
    logger.log('📋 Listing all indexes...\n');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pawfectmatch');
    
    const models = [
      { name: 'User', model: User },
      { name: 'Pet', model: Pet },
      { name: 'Match', model: Match }
    ];

    for (const { name, model } of models) {
      try {
        const indexes = await model.collection.getIndexes();
        logger.log(`\n${name} Indexes (${Object.keys(indexes).length} total):`);
        logger.log('─'.repeat(50));
        
        Object.entries(indexes).forEach(([indexName, indexDef]) => {
          logger.log(`\n  ${indexName}:`);
          logger.log(`    Keys: ${JSON.stringify(indexDef.key)}`);
          if (indexDef.unique) logger.log(`    Unique: true`);
          if (indexDef.sparse) logger.log(`    Sparse: true`);
          if (indexDef.expireAfterSeconds) logger.log(`    TTL: ${indexDef.expireAfterSeconds}s`);
        });
        
      } catch (error) {
        logger.error(`Error listing indexes for ${name}:`, error.message);
      }
    }
    
    logger.log('\n');
    
  } catch (error) {
    logger.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Parse command line arguments
const command = process.argv[2];

switch (command) {
  case 'drop':
    dropIndexes();
    break;
  case 'list':
    listIndexes();
    break;
  case 'create':
  default:
    createIndexes();
    break;
}

