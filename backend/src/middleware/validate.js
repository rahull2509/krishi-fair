const ApiResponse = require('../utils/apiResponse');

/**
 * Validation middleware factory
 * @param {Object} schema - Validation schema { field: { required, type, min, max, pattern, message } }
 * @param {string} source - 'body', 'query', or 'params'
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      // Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value === undefined || value === null || value === '') continue;

      // Type check
      if (rules.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push(`${field} must be a valid email`);
        }
      }

      if (rules.type === 'number') {
        if (isNaN(Number(value))) {
          errors.push(`${field} must be a number`);
        }
      }

      // Min length
      if (rules.minLength && String(value).length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }

      // Max length
      if (rules.maxLength && String(value).length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters`);
      }

      // Min value (for numbers)
      if (rules.min !== undefined && Number(value) < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }

      // Pattern (regex)
      if (rules.pattern && !rules.pattern.test(String(value))) {
        errors.push(rules.message || `${field} format is invalid`);
      }

      // Enum values
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }
    }

    if (errors.length > 0) {
      return ApiResponse.error(res, 'Validation failed', 400, errors);
    }

    next();
  };
};

module.exports = validate;
