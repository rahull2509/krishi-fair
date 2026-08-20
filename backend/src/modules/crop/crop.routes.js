const express = require('express');
const cropController = require('./crop.controller');
const { authenticate, authorize, requireKYC } = require('../../middleware/auth');
const validate = require('../../middleware/validate');

const router = express.Router();

const createCropSchema = {
  title: { required: true, minLength: 3 },
  description: { required: true, minLength: 10 },
  category: { required: true },
  quantity: { required: true, type: 'number', min: 0.1 },
  basePrice: { required: true, type: 'number', min: 1 },
};

// Public
router.get('/', cropController.getCrops);
router.get('/my', authenticate, authorize('FARMER'), cropController.getMyCrops);
router.get('/:id', cropController.getCropById);

// Farmer only
router.post('/', authenticate, authorize('FARMER'), validate(createCropSchema), cropController.createCrop);
router.put('/:id', authenticate, authorize('FARMER'), cropController.updateCrop);
router.delete('/:id', authenticate, authorize('FARMER'), cropController.deleteCrop);

// Buyer only (direct purchase)
router.post('/:id/buy', authenticate, authorize('BUYER'), requireKYC, cropController.directPurchase);

module.exports = router;
