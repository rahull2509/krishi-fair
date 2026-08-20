const express = require('express');
const userController = require('./user.controller');
const { authenticate, authorize } = require('../../middleware/auth');

const router = express.Router();

// Profile
router.put('/profile', authenticate, userController.updateProfile);

// KYC
router.post('/kyc', authenticate, authorize('BUYER'), userController.submitKYC);

// Admin routes
router.get('/', authenticate, authorize('ADMIN'), userController.getAllUsers);
router.get('/:id', authenticate, userController.getUserById);
router.patch('/:id/kyc-status', authenticate, authorize('ADMIN'), userController.updateKYCStatus);
router.patch('/:id/toggle-status', authenticate, authorize('ADMIN'), userController.toggleUserStatus);

module.exports = router;
