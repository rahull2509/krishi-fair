const marketService = require('./market.service');
const ApiResponse = require('../../utils/apiResponse');

class MarketController {
  /** GET /api/market/prices */
  async getMandiPrices(req, res, next) {
    try {
      const result = await marketService.getMandiPrices(req.query);
      return ApiResponse.success(res, result, 'Market prices fetched');
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/market/search */
  async searchCommodity(req, res, next) {
    try {
      const { q } = req.query;
      if (!q) {
        return ApiResponse.error(res, 'Search query (q) is required', 400);
      }
      const result = await marketService.searchCommodity(q);
      return ApiResponse.success(res, result, 'Search results');
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/market/trends */
  async getPriceTrends(req, res, next) {
    try {
      const { commodity, state, days } = req.query;
      if (!commodity) {
        return ApiResponse.error(res, 'Commodity is required', 400);
      }
      const result = await marketService.getPriceTrends(commodity, state, days);
      return ApiResponse.success(res, result, 'Price trends');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MarketController();
