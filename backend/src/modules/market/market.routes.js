const express = require('express');
const marketController = require('./market.controller');

const router = express.Router();

// Public — anyone can view market prices
router.get('/prices', marketController.getMandiPrices);
router.get('/search', marketController.searchCommodity);
router.get('/trends', marketController.getPriceTrends);

module.exports = router;
