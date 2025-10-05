/**
 * Validation Utilities
 * Common validation functions for request parameters
 */

/**
 * Validate and sanitize pagination parameters
 * @param {number|string} page - Page number from request
 * @param {number|string} limit - Limit from request
 * @param {number} maxLimit - Maximum allowed limit (default: 100)
 * @param {number|string} directSkip - Direct skip value (optional, overrides page-based skip)
 * @returns {{page: number, limit: number, skip: number}}
 */
const validatePagination = (page, limit, maxLimit = 100, directSkip = null) => {
  // Parse and validate page number
  let validPage = parseInt(page);
  if (isNaN(validPage) || validPage < 1) {
    validPage = 1;
  }
  
  // Parse and validate limit
  let validLimit = parseInt(limit);
  if (isNaN(validLimit) || validLimit < 1) {
    validLimit = 10; // Default limit
  }
  
  // Cap limit at maximum
  validLimit = Math.min(validLimit, maxLimit);
  
  // Calculate skip - use directSkip if provided, otherwise calculate from page
  let skip;
  if (directSkip !== null && directSkip !== undefined) {
    skip = parseInt(directSkip);
    if (isNaN(skip) || skip < 0) {
      skip = 0;
    }
  } else {
    skip = (validPage - 1) * validLimit;
  }
  
  return {
    page: validPage,
    limit: validLimit,
    skip
  };
};

/**
 * Validate MongoDB ObjectId format
 * @param {string} id - ID to validate
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
  if (!id) return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validate age range parameters
 * @param {number|string} minAge - Minimum age
 * @param {number|string} maxAge - Maximum age
 * @returns {{minAge: number|null, maxAge: number|null, isValid: boolean}}
 */
const validateAgeRange = (minAge, maxAge) => {
  let validMinAge = null;
  let validMaxAge = null;
  let isValid = true;
  
  if (minAge !== undefined && minAge !== null && minAge !== '') {
    validMinAge = parseInt(minAge);
    if (isNaN(validMinAge) || validMinAge < 0) {
      isValid = false;
      validMinAge = null;
    }
  }
  
  if (maxAge !== undefined && maxAge !== null && maxAge !== '') {
    validMaxAge = parseInt(maxAge);
    if (isNaN(validMaxAge) || validMaxAge < 0) {
      isValid = false;
      validMaxAge = null;
    }
  }
  
  // Ensure minAge <= maxAge if both are provided
  if (validMinAge !== null && validMaxAge !== null && validMinAge > validMaxAge) {
    isValid = false;
  }
  
  return {
    minAge: validMinAge,
    maxAge: validMaxAge,
    isValid
  };
};

/**
 * Validate distance parameter
 * @param {number|string} distance - Distance in km
 * @param {number} maxDistance - Maximum allowed distance (default: 500)
 * @returns {number}
 */
const validateDistance = (distance, maxDistance = 500) => {
  let validDistance = parseFloat(distance);
  
  if (isNaN(validDistance) || validDistance < 0) {
    return 50; // Default 50km
  }
  
  return Math.min(validDistance, maxDistance);
};

/**
 * Sanitize search query string
 * @param {string} query - Search query
 * @param {number} maxLength - Maximum query length (default: 100)
 * @returns {string|null}
 */
const sanitizeSearchQuery = (query, maxLength = 100) => {
  if (!query || typeof query !== 'string') {
    return null;
  }
  
  // Trim and limit length
  let sanitized = query.trim().substring(0, maxLength);
  
  // Escape special regex characters
  sanitized = sanitized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  return sanitized || null;
};

/**
 * Validate enum value
 * @param {string} value - Value to validate
 * @param {string[]} allowedValues - Array of allowed values
 * @param {string|null} defaultValue - Default value if invalid (default: null)
 * @returns {string|null}
 */
const validateEnum = (value, allowedValues, defaultValue = null) => {
  if (!value) return defaultValue;
  return allowedValues.includes(value) ? value : defaultValue;
};

/**
 * Validate array parameter (comma-separated or actual array)
 * @param {string|string[]} value - Value to validate
 * @param {string[]} allowedValues - Array of allowed values (optional)
 * @param {number} maxItems - Maximum number of items (default: 50)
 * @returns {string[]}
 */
const validateArrayParam = (value, allowedValues = null, maxItems = 50) => {
  if (!value) return [];
  
  // Convert to array if string
  let arr = Array.isArray(value) ? value : value.split(',').map(v => v.trim());
  
  // Limit number of items
  arr = arr.slice(0, maxItems);
  
  // Filter by allowed values if provided
  if (allowedValues && allowedValues.length > 0) {
    arr = arr.filter(v => allowedValues.includes(v));
  }
  
  return arr;
};

module.exports = {
  validatePagination,
  isValidObjectId,
  validateAgeRange,
  validateDistance,
  sanitizeSearchQuery,
  validateEnum,
  validateArrayParam
};

