const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

const validatePremiumRequest = (req, res, next) => {
  // Basic premium request validation
  if (!req.body.planId && !req.body.plan) {
    return res.status(400).json({
      success: false,
      message: 'Plan ID or plan type is required'
    });
  }
  
  next();
};

module.exports = { validate, validatePremiumRequest };