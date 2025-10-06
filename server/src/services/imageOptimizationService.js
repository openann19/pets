const sharp = require('sharp');
const { v2: cloudinary } = require('cloudinary');
const logger = require('../utils/logger');

/**
 * Image Optimization Service
 * Handles image compression, resizing, and optimization before Cloudinary upload
 */

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Image optimization configurations
 */
const OPTIMIZATION_CONFIGS = {
  // Profile images
  profile: {
    maxWidth: 400,
    maxHeight: 400,
    quality: 85,
    format: 'webp',
    compression: 'auto'
  },
  
  // Pet photos
  pet: {
    maxWidth: 800,
    maxHeight: 600,
    quality: 90,
    format: 'webp',
    compression: 'auto'
  },
  
  // Chat images
  chat: {
    maxWidth: 600,
    maxHeight: 600,
    quality: 80,
    format: 'webp',
    compression: 'auto'
  },
  
  // Thumbnails
  thumbnail: {
    maxWidth: 200,
    maxHeight: 200,
    quality: 75,
    format: 'webp',
    compression: 'auto'
  },
  
  // Hero images
  hero: {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 95,
    format: 'webp',
    compression: 'auto'
  }
};

/**
 * Validate image file
 */
function validateImageFile(file) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`);
  }
  
  return true;
}

/**
 * Optimize image buffer
 */
async function optimizeImageBuffer(buffer, config) {
  try {
    let sharpInstance = sharp(buffer);
    
    // Get image metadata
    const metadata = await sharpInstance.metadata();
    logger.info('Original image metadata:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: buffer.length
    });
    
    // Resize if needed
    if (metadata.width > config.maxWidth || metadata.height > config.maxHeight) {
      sharpInstance = sharpInstance.resize(config.maxWidth, config.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Apply optimizations based on format
    switch (config.format) {
      case 'webp':
        sharpInstance = sharpInstance.webp({
          quality: config.quality,
          effort: 6, // Higher effort for better compression
          smartSubsample: true,
          reductionEffort: 6
        });
        break;
        
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({
          quality: config.quality,
          progressive: true,
          mozjpeg: true
        });
        break;
        
      case 'png':
        sharpInstance = sharpInstance.png({
          quality: config.quality,
          compressionLevel: 9,
          progressive: true
        });
        break;
        
      default:
        sharpInstance = sharpInstance.webp({
          quality: config.quality
        });
    }
    
    // Apply additional optimizations
    if (config.compression === 'auto') {
      // Auto-optimize based on image content
      sharpInstance = sharpInstance
        .sharpen() // Enhance details
        .normalize() // Normalize colors
        .gamma(2.2); // Apply gamma correction
    }
    
    const optimizedBuffer = await sharpInstance.toBuffer();
    
    logger.info('Image optimization completed:', {
      originalSize: buffer.length,
      optimizedSize: optimizedBuffer.length,
      compressionRatio: ((buffer.length - optimizedBuffer.length) / buffer.length * 100).toFixed(2) + '%',
      format: config.format
    });
    
    return optimizedBuffer;
    
  } catch (error) {
    logger.error('Image optimization failed:', error);
    throw new Error(`Image optimization failed: ${error.message}`);
  }
}

/**
 * Upload optimized image to Cloudinary
 */
async function uploadToCloudinary(buffer, options = {}) {
  try {
    const uploadOptions = {
      resource_type: 'image',
      folder: options.folder || 'uploads',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      transformation: [
        {
          quality: 'auto:good',
          fetch_format: 'auto',
          flags: 'progressive'
        }
      ],
      ...options
    };
    
    const result = await cloudinary.uploader.upload(
      `data:image/webp;base64,${buffer.toString('base64')}`,
      uploadOptions
    );
    
    logger.info('Image uploaded to Cloudinary:', {
      publicId: result.public_id,
      url: result.secure_url,
      size: result.bytes
    });
    
    return {
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      createdAt: result.created_at
    };
    
  } catch (error) {
    logger.error('Cloudinary upload failed:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
}

/**
 * Process and upload image with optimization
 */
async function processAndUploadImage(file, type = 'pet', options = {}) {
  try {
    // Validate file
    validateImageFile(file);
    
    // Get optimization config
    const config = OPTIMIZATION_CONFIGS[type] || OPTIMIZATION_CONFIGS.pet;
    
    // Optimize image
    const optimizedBuffer = await optimizeImageBuffer(file.buffer, config);
    
    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(optimizedBuffer, {
      folder: `${type}s`,
      public_id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...options
    });
    
    return {
      ...uploadResult,
      originalSize: file.size,
      optimizedSize: optimizedBuffer.length,
      type: type
    };
    
  } catch (error) {
    logger.error('Image processing failed:', error);
    throw error;
  }
}

/**
 * Generate multiple sizes of an image
 */
async function generateImageVariants(buffer, type = 'pet') {
  try {
    const variants = {};
    const config = OPTIMIZATION_CONFIGS[type];
    
    // Original optimized size
    const original = await optimizeImageBuffer(buffer, config);
    variants.original = {
      buffer: original,
      width: config.maxWidth,
      height: config.maxHeight
    };
    
    // Thumbnail
    const thumbnailConfig = { ...OPTIMIZATION_CONFIGS.thumbnail };
    const thumbnail = await optimizeImageBuffer(buffer, thumbnailConfig);
    variants.thumbnail = {
      buffer: thumbnail,
      width: thumbnailConfig.maxWidth,
      height: thumbnailConfig.maxHeight
    };
    
    // Medium size (for mobile)
    const mediumConfig = {
      maxWidth: Math.floor(config.maxWidth * 0.6),
      maxHeight: Math.floor(config.maxHeight * 0.6),
      quality: 80,
      format: config.format
    };
    const medium = await optimizeImageBuffer(buffer, mediumConfig);
    variants.medium = {
      buffer: medium,
      width: mediumConfig.maxWidth,
      height: mediumConfig.maxHeight
    };
    
    return variants;
    
  } catch (error) {
    logger.error('Image variant generation failed:', error);
    throw error;
  }
}

/**
 * Upload multiple image variants
 */
async function uploadImageVariants(file, type = 'pet', options = {}) {
  try {
    validateImageFile(file);
    
    // Generate variants
    const variants = await generateImageVariants(file.buffer, type);
    const uploadResults = {};
    
    // Upload each variant
    for (const [variantName, variant] of Object.entries(variants)) {
      const uploadResult = await uploadToCloudinary(variant.buffer, {
        folder: `${type}s/${variantName}`,
        public_id: `${type}_${variantName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...options
      });
      
      uploadResults[variantName] = uploadResult;
    }
    
    return uploadResults;
    
  } catch (error) {
    logger.error('Image variants upload failed:', error);
    throw error;
  }
}

/**
 * Delete image from Cloudinary
 */
async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      logger.info('Image deleted from Cloudinary:', { publicId });
      return true;
    } else {
      logger.warn('Image deletion failed:', { publicId, result: result.result });
      return false;
    }
    
  } catch (error) {
    logger.error('Cloudinary deletion failed:', error);
    throw error;
  }
}

/**
 * Get image optimization statistics
 */
function getOptimizationStats(originalSize, optimizedSize) {
  const compressionRatio = ((originalSize - optimizedSize) / originalSize * 100);
  const spaceSaved = originalSize - optimizedSize;
  
  return {
    originalSize,
    optimizedSize,
    compressionRatio: Math.round(compressionRatio * 100) / 100,
    spaceSaved,
    spaceSavedMB: Math.round(spaceSaved / 1024 / 1024 * 100) / 100
  };
}

/**
 * Batch process multiple images
 */
async function batchProcessImages(files, type = 'pet', options = {}) {
  try {
    const results = [];
    const errors = [];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await processAndUploadImage(files[i], type, {
          ...options,
          public_id: `${type}_batch_${Date.now()}_${i}`
        });
        results.push(result);
      } catch (error) {
        errors.push({
          fileIndex: i,
          fileName: files[i].originalname,
          error: error.message
        });
      }
    }
    
    return {
      successful: results,
      failed: errors,
      totalProcessed: results.length,
      totalFailed: errors.length
    };
    
  } catch (error) {
    logger.error('Batch image processing failed:', error);
    throw error;
  }
}

module.exports = {
  validateImageFile,
  optimizeImageBuffer,
  uploadToCloudinary,
  processAndUploadImage,
  generateImageVariants,
  uploadImageVariants,
  deleteFromCloudinary,
  getOptimizationStats,
  batchProcessImages,
  OPTIMIZATION_CONFIGS
};
