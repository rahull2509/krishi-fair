const authService = require('./auth.service');
const ApiResponse = require('../../utils/apiResponse');

class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, phone, password, role } = req.body;
      const result = await authService.register({ name, email, phone, password, role });
      return ApiResponse.created(res, result, 'Registration successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   */
  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      return ApiResponse.success(res, user, 'Profile fetched');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
