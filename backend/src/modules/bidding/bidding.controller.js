const biddingService = require('./bidding.service');
const ApiResponse = require('../../utils/apiResponse');

class BiddingController {
  /** POST /api/crops/:id/bids */
  async placeBid(req, res, next) {
    try {
      const bid = await biddingService.placeBid(req.params.id, req.user.id, req.body);
      return ApiResponse.created(res, bid, 'Bid placed successfully');
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/crops/:id/bids */
  async getCropBids(req, res, next) {
    try {
      const { bids, total } = await biddingService.getCropBids(req.params.id, req.query);
      return ApiResponse.paginated(res, bids, total, req.query.page || 1, req.query.limit || 20);
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /api/bids/:id/accept */
  async acceptBid(req, res, next) {
    try {
      const bid = await biddingService.acceptBid(req.params.id, req.user.id);
      return ApiResponse.success(res, bid, 'Bid accepted');
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /api/bids/:id/reject */
  async rejectBid(req, res, next) {
    try {
      const bid = await biddingService.rejectBid(req.params.id, req.user.id);
      return ApiResponse.success(res, bid, 'Bid rejected');
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/bids/my */
  async getMyBids(req, res, next) {
    try {
      const { bids, total } = await biddingService.getMyBids(req.user.id, req.query);
      return ApiResponse.paginated(res, bids, total, req.query.page || 1, req.query.limit || 20);
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /api/admin/bidding-duration */
  async updateBiddingDuration(req, res, next) {
    try {
      const settings = await biddingService.updateBiddingDuration(req.body.hours);
      return ApiResponse.success(res, settings, 'Bidding duration updated');
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/admin/settings */
  async getAdminSettings(req, res, next) {
    try {
      const settings = await biddingService.getAdminSettings();
      return ApiResponse.success(res, settings);
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/admin/stats */
  async getAdminStats(req, res, next) {
    try {
      const stats = await biddingService.getAdminStats();
      return ApiResponse.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BiddingController();
