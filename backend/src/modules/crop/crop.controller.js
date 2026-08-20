const cropService = require('./crop.service');
const ApiResponse = require('../../utils/apiResponse');

class CropController {
  /** POST /api/crops */
  async createCrop(req, res, next) {
    try {
      const crop = await cropService.createCrop(req.user.id, req.body);
      return ApiResponse.created(res, crop, 'Crop listed successfully');
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/crops */
  async getCrops(req, res, next) {
    try {
      const { crops, total } = await cropService.getCrops(req.query);
      return ApiResponse.paginated(res, crops, total, req.query.page || 1, req.query.limit || 20);
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/crops/my */
  async getMyCrops(req, res, next) {
    try {
      const { crops, total } = await cropService.getMyCrops(req.user.id, req.query);
      return ApiResponse.paginated(res, crops, total, req.query.page || 1, req.query.limit || 20);
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/crops/:id */
  async getCropById(req, res, next) {
    try {
      const crop = await cropService.getCropById(req.params.id);
      return ApiResponse.success(res, crop);
    } catch (error) {
      next(error);
    }
  }

  /** PUT /api/crops/:id */
  async updateCrop(req, res, next) {
    try {
      const crop = await cropService.updateCrop(req.params.id, req.user.id, req.body);
      return ApiResponse.success(res, crop, 'Crop updated');
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /api/crops/:id */
  async deleteCrop(req, res, next) {
    try {
      const result = await cropService.deleteCrop(req.params.id, req.user.id);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/crops/:id/buy */
  async directPurchase(req, res, next) {
    try {
      const purchase = await cropService.directPurchase(req.params.id, req.user.id, req.body);
      return ApiResponse.created(res, purchase, 'Purchase order created');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CropController();
