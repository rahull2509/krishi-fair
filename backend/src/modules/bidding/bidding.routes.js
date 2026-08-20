const express = require('express');
const biddingController = require('./bidding.controller');
const { authenticate, authorize, requireKYC } = require('../../middleware/auth');

const router = express.Router();

// Buyer bids
router.post('/crops/:id/bids', authenticate, authorize('BUYER'), requireKYC, biddingController.placeBid);
router.get('/crops/:id/bids', authenticate, biddingController.getCropBids);

// Buyer's own bids
router.get('/bids/my', authenticate, authorize('BUYER'), biddingController.getMyBids);

// Farmer accept/reject
router.patch('/bids/:id/accept', authenticate, authorize('FARMER'), biddingController.acceptBid);
router.patch('/bids/:id/reject', authenticate, authorize('FARMER'), biddingController.rejectBid);

// Admin
router.patch('/admin/bidding-duration', authenticate, authorize('ADMIN'), biddingController.updateBiddingDuration);
router.get('/admin/settings', authenticate, authorize('ADMIN'), biddingController.getAdminSettings);
router.get('/admin/stats', authenticate, authorize('ADMIN'), biddingController.getAdminStats);

module.exports = router;
