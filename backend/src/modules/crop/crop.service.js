const prisma = require('../../config/database');

class CropService {
  /**
   * Create a new crop listing (Farmer)
   */
  async createCrop(farmerId, cropData) {
    const {
      title, description, category, variety, quantity, unit,
      basePrice, minBidPrice, imageIds, allowBidding,
      biddingEndsAt, location, state, district, harvestDate,
    } = cropData;

    if (minBidPrice && minBidPrice > basePrice) {
      throw Object.assign(new Error('Minimum bid price cannot exceed base price'), { statusCode: 400 });
    }

    // If bidding enabled but no end time, use admin default
    let biddingEnd = null;
    if (allowBidding !== false) {
      if (biddingEndsAt) {
        biddingEnd = new Date(biddingEndsAt);
      } else {
        const settings = await prisma.adminSetting.findFirst();
        const hours = settings?.defaultBiddingDuration || 24;
        biddingEnd = new Date(Date.now() + hours * 60 * 60 * 1000);
      }
    }

    const crop = await prisma.crop.create({
      data: {
        title,
        description,
        category,
        variety,
        quantity: parseFloat(quantity),
        unit: unit || 'quintal',
        basePrice: parseFloat(basePrice),
        minBidPrice: parseFloat(minBidPrice || basePrice),
        imageIds: JSON.stringify(imageIds || []),
        allowBidding: allowBidding !== false,
        biddingEndsAt: biddingEnd,
        location,
        state,
        district,
        harvestDate: harvestDate ? new Date(harvestDate) : null,
        farmerId,
      },
      include: {
        farmer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    return this.formatCrop(crop);
  }

  /**
   * Get all crops with filters
   */
  async getCrops({ category, state, status, search, minPrice, maxPrice, allowBidding, page = 1, limit = 20 }) {
    const where = {};

    if (category) where.category = category;
    if (state) where.state = state;
    if (status) where.status = status;
    else where.status = 'ACTIVE';

    if (allowBidding !== undefined) where.allowBidding = allowBidding === 'true';

    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
        { variety: { contains: search } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [crops, total] = await Promise.all([
      prisma.crop.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          farmer: {
            select: { id: true, name: true, phone: true },
          },
          _count: {
            select: { bids: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.crop.count({ where }),
    ]);

    return { crops: crops.map(c => this.formatCrop(c)), total };
  }

  /**
   * Get crop by ID
   */
  async getCropById(cropId) {
    const crop = await prisma.crop.findUnique({
      where: { id: cropId },
      include: {
        farmer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        bids: {
          include: {
            buyer: { select: { id: true, name: true } },
          },
          orderBy: { amount: 'desc' },
          take: 10,
        },
        _count: {
          select: { bids: true, purchases: true },
        },
      },
    });

    if (!crop) {
      throw Object.assign(new Error('Crop not found'), { statusCode: 404 });
    }

    return this.formatCrop(crop);
  }

  /**
   * Update crop (Farmer only, own crop)
   */
  async updateCrop(cropId, farmerId, updateData) {
    const crop = await prisma.crop.findUnique({ where: { id: cropId } });

    if (!crop) {
      throw Object.assign(new Error('Crop not found'), { statusCode: 404 });
    }

    if (crop.farmerId !== farmerId) {
      throw Object.assign(new Error('You can only edit your own crops'), { statusCode: 403 });
    }

    if (crop.status === 'SOLD') {
      throw Object.assign(new Error('Cannot edit a sold crop'), { statusCode: 400 });
    }

    const {
      title, description, category, variety, quantity, unit,
      basePrice, minBidPrice, imageIds, allowBidding,
      biddingEndsAt, location, state, district, harvestDate,
    } = updateData;

    const updated = await prisma.crop.update({
      where: { id: cropId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(variety !== undefined && { variety }),
        ...(quantity && { quantity: parseFloat(quantity) }),
        ...(unit && { unit }),
        ...(basePrice && { basePrice: parseFloat(basePrice) }),
        ...(minBidPrice && { minBidPrice: parseFloat(minBidPrice) }),
        ...(imageIds && { imageIds: JSON.stringify(imageIds) }),
        ...(allowBidding !== undefined && { allowBidding }),
        ...(biddingEndsAt && { biddingEndsAt: new Date(biddingEndsAt) }),
        ...(location && { location }),
        ...(state && { state }),
        ...(district && { district }),
        ...(harvestDate && { harvestDate: new Date(harvestDate) }),
      },
      include: {
        farmer: {
          select: { id: true, name: true },
        },
      },
    });

    return this.formatCrop(updated);
  }

  /**
   * Delete crop (Farmer only)
   */
  async deleteCrop(cropId, farmerId) {
    const crop = await prisma.crop.findUnique({ where: { id: cropId } });

    if (!crop) {
      throw Object.assign(new Error('Crop not found'), { statusCode: 404 });
    }
    if (crop.farmerId !== farmerId) {
      throw Object.assign(new Error('You can only delete your own crops'), { statusCode: 403 });
    }

    await prisma.crop.update({
      where: { id: cropId },
      data: { status: 'CANCELLED' },
    });

    return { message: 'Crop listing cancelled' };
  }

  /**
   * Direct purchase (Buyer)
   */
  async directPurchase(cropId, buyerId, { quantity }) {
    const crop = await prisma.crop.findUnique({ where: { id: cropId } });

    if (!crop) {
      throw Object.assign(new Error('Crop not found'), { statusCode: 404 });
    }
    if (crop.status !== 'ACTIVE') {
      throw Object.assign(new Error('Crop is no longer available'), { statusCode: 400 });
    }
    if (crop.farmerId === buyerId) {
      throw Object.assign(new Error('You cannot buy your own crop'), { statusCode: 400 });
    }

    const purchaseQty = parseFloat(quantity) || crop.quantity;
    if (purchaseQty > crop.quantity) {
      throw Object.assign(new Error('Requested quantity exceeds available'), { statusCode: 400 });
    }

    const totalAmount = purchaseQty * crop.basePrice;

    const purchase = await prisma.purchase.create({
      data: {
        quantity: purchaseQty,
        pricePerUnit: crop.basePrice,
        totalAmount,
        cropId,
        buyerId,
      },
      include: {
        crop: { select: { id: true, title: true, basePrice: true } },
        buyer: { select: { id: true, name: true } },
      },
    });

    // Update crop status if full quantity purchased
    if (purchaseQty >= crop.quantity) {
      await prisma.crop.update({
        where: { id: cropId },
        data: { status: 'SOLD' },
      });
    } else {
      await prisma.crop.update({
        where: { id: cropId },
        data: { quantity: crop.quantity - purchaseQty },
      });
    }

    return purchase;
  }

  /**
   * Get farmer's own crops
   */
  async getMyCrops(farmerId, { page = 1, limit = 20 }) {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [crops, total] = await Promise.all([
      prisma.crop.findMany({
        where: { farmerId },
        skip,
        take: parseInt(limit),
        include: {
          _count: { select: { bids: true, purchases: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.crop.count({ where: { farmerId } }),
    ]);

    return { crops: crops.map(c => this.formatCrop(c)), total };
  }

  /**
   * Parse imageIds JSON string
   */
  formatCrop(crop) {
    if (crop && typeof crop.imageIds === 'string') {
      try {
        crop.imageIds = JSON.parse(crop.imageIds);
      } catch {
        crop.imageIds = [];
      }
    }
    return crop;
  }
}

module.exports = new CropService();
