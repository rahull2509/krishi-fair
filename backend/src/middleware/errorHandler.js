const ApiResponse = require('../utils/apiResponse');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Prisma errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'field';
    return ApiResponse.error(res, `Duplicate value for ${field}. Already exists.`, 409);
  }
  if (err.code === 'P2025') {
    return ApiResponse.error(res, 'Record not found.', 404);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid token.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Token expired.', 401);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return ApiResponse.error(res, err.message, 400);
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return ApiResponse.error(res, 'File too large. Max 5MB allowed.', 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  return ApiResponse.error(res, message, statusCode);
};

module.exports = errorHandler;
