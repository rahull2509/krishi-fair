const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/database');
const config = require('../../config');

class AuthService {
  /**
   * Register a new user
   */
  async register({ name, email, phone, password, role }) {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (existingUser) {
      throw Object.assign(new Error('User with this email or phone already exists'), { statusCode: 409 });
    }

    // Validate role
    const allowedRoles = ['FARMER', 'BUYER'];
    if (role && !allowedRoles.includes(role)) {
      throw Object.assign(new Error('Invalid role. Must be FARMER or BUYER'), { statusCode: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: role || 'FARMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        kycStatus: true,
        createdAt: true,
      },
    });

    const token = this.generateToken(user.id);

    return { user, token };
  }

  /**
   * Login user
   */
  async login({ email, password }) {
    console.log("LOGIN ATTEMPT WITH:", email);
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    if (!user.isActive) {
      throw Object.assign(new Error('Account is deactivated. Contact admin.'), { statusCode: 403 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    const token = this.generateToken(user.id);

    // Remove password from response
    const { password: _, ...userData } = user;

    return { user: userData, token };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        kycStatus: true,
        aadharNumber: true,
        gstNumber: true,
        panNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    return user;
  }

  /**
   * Generate JWT token
   */
  generateToken(userId) {
    return jwt.sign({ userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }
}

module.exports = new AuthService();
