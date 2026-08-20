const userService = require('./user.service');
const ApiResponse = require('../../utils/apiResponse');

class UserController {
  /** PUT /api/users/profile */
  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.user.id, req.body);
      return ApiResponse.success(res, user, 'Profile updated');
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/users/kyc */
  async submitKYC(req, res, next) {
    try {
      const user = await userService.submitKYC(req.user.id, req.body);
      return ApiResponse.success(res, user, 'KYC submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /api/users/:id/kyc-status (Admin) */
  async updateKYCStatus(req, res, next) {
    try {
      const user = await userService.updateKYCStatus(req.params.id, req.body.status);
      return ApiResponse.success(res, user, 'KYC status updated');
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/users (Admin) */
  async getAllUsers(req, res, next) {
    try {
      const { role, kycStatus, page, limit } = req.query;
      const { users, total } = await userService.getAllUsers({ role, kycStatus, page, limit });
      return ApiResponse.paginated(res, users, total, page || 1, limit || 20);
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/users/:id */
  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /api/users/:id/toggle-status (Admin) */
  async toggleUserStatus(req, res, next) {
    try {
      const user = await userService.toggleUserStatus(req.params.id);
      return ApiResponse.success(res, user, 'User status toggled');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
