const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/database');
const ApiResponse = require('../utils/apiResponse');

/**
 * Authentication middleware — verifies JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        kycStatus: true,
      },
    });

    if (!user) {
      return ApiResponse.error(res, 'User not found.', 401);
    }

    if (!user.isActive) {
      return ApiResponse.error(res, 'Account is deactivated. Contact admin.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.error(res, 'Invalid token.', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Token expired. Please login again.', 401);
    }
    return ApiResponse.error(res, 'Authentication failed.', 500);
  }
};

/**
 * Role-based access control middleware
 * @param  {...string} roles - Allowed roles (ADMIN, FARMER, BUYER)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required.', 401);
    }
    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Access denied. Required role: ${roles.join(' or ')}`,
        403
      );
    }
    next();
  };
};

/**
 * KYC verification check for buyers
 */
const requireKYC = (req, res, next) => {
  if (req.user.role === 'BUYER' && req.user.kycStatus !== 'VERIFIED') {
    return ApiResponse.error(
      res,
      'KYC verification required. Please complete your KYC first.',
      403
    );
  }
  next();
};

module.exports = { authenticate, authorize, requireKYC };
