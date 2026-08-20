const prisma = require('../../config/database');

class UserService {
  /**
   * Update user profile
   */
  async updateProfile(userId, data) {
    const { name, phone, avatar } = data;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        kycStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Submit KYC documents (Buyer)
   */
  async submitKYC(userId, kycData) {
    const { aadharNumber, gstNumber, panNumber, kycDocumentId } = kycData;

    // Validate Aadhar (12 digits)
    if (aadharNumber && !/^\d{12}$/.test(aadharNumber)) {
      throw Object.assign(new Error('Aadhar number must be 12 digits'), { statusCode: 400 });
    }

    // Validate PAN (ABCDE1234F format)
    if (panNumber && !/^[A-Z]{5}\d{4}[A-Z]$/.test(panNumber)) {
      throw Object.assign(new Error('Invalid PAN number format'), { statusCode: 400 });
    }

    // Validate GST (15 char alphanumeric)
    if (gstNumber && !/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/.test(gstNumber)) {
      throw Object.assign(new Error('Invalid GST number format'), { statusCode: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        aadharNumber,
        gstNumber,
        panNumber,
        kycDocumentId,
        kycStatus: 'SUBMITTED',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        aadharNumber: true,
        gstNumber: true,
        panNumber: true,
        kycStatus: true,
        kycDocumentId: true,
      },
    });

    return user;
  }

  /**
   * Admin: Update KYC status
   */
  async updateKYCStatus(userId, status) {
    const validStatuses = ['VERIFIED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw Object.assign(new Error('Invalid KYC status'), { statusCode: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        kycStatus: true,
      },
    });

    return user;
  }

  /**
   * Admin: Get all users with filters
   */
  async getAllUsers({ role, kycStatus, page = 1, limit = 20 }) {
    const where = {};
    if (role) where.role = role;
    if (kycStatus) where.kycStatus = kycStatus;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          kycStatus: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
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
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            crops: true,
            bids: true,
            purchases: true,
          },
        },
      },
    });

    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    return user;
  }

  /**
   * Admin: Toggle user active status
   */
  async toggleUserStatus(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    return updated;
  }
}

module.exports = new UserService();
