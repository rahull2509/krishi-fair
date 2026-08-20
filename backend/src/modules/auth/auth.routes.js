const express = require('express');
const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');

const router = express.Router();

// Validation schemas
const registerSchema = {
  name: { required: true, minLength: 2 },
  email: { required: true, type: 'email' },
  password: { required: true, minLength: 6 },
  role: { enum: ['FARMER', 'BUYER'] },
};

const loginSchema = {
  email: { required: true, type: 'email' },
  password: { required: true },
};

// Routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
