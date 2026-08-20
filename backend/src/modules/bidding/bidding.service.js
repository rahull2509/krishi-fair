const prisma = require('../../config/database');

class BiddingService {
  /**
   * Place a bid on a crop
   */
  async placeBid(cropId, buyerId, { amount, message }) {
    const crop = await prisma.crop.findUnique({ where: { id: cropId } });

    if (!crop) {
      throw Object.assign(new Error('Crop not found'), { statusCode: 404 });
    }
    if (crop.status !== 'ACTIVE') {
      throw Object.assign(new Error('Crop is no longer available for bidding'), { statusCode: 400 });
    }
    if (!crop.allowBidding) {
      throw Object.assign(new Error('Bidding is not allowed for this crop. Use direct purchase.'), { statusCode: 400 });
    }
    if (crop.farmerId === buyerId) {
      throw Object.assign(new Error('You cannot bid on your own crop'), { statusCode: 400 });
    }
    if (crop.biddingEndsAt && new Date() > crop.biddingEndsAt) {
      throw Object.assign(new Error('Bidding period has ended'), { statusCode: 400 });
    }

    const bidAmount = parseFloat(amount);
    if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
      throw Object.assign(new Error('Bid amount must be a valid positive number'), { statusCode: 400 });
    }

    if (bidAmount < crop.minBidPrice) {
      throw Object.assign(new Error(`Bid must be at least ₹${crop.minBidPrice}`), { statusCode: 400 });
    }

    const highestPendingBid = await prisma.bid.findFirst({
      where: {
        cropId,
        status: 'PENDING',
      },
      orderBy: { amount: 'desc' },
    });

    if (highestPendingBid && bidAmount <= highestPendingBid.amount && highestPendingBid.buyerId !== buyerId) {
      throw Object.assign(new Error(`Bid must be higher than current highest bid ₹${highestPendingBid.amount}`), { statusCode: 400 });
    }

    // Check if buyer already has a pending bid
    const existingBid = await prisma.bid.findFirst({
      where: {
        cropId,
        buyerId,
        status: 'PENDING',
      },
    });

    if (existingBid) {
      // Update existing bid
      const [updated] = await prisma.$transaction([
        prisma.bid.update({
          where: { id: existingBid.id },
          data: {
            amount: bidAmount,
            message: message || existingBid.message,
          },
          include: {
            crop: { select: { id: true, title: true, basePrice: true } },
            buyer: { select: { id: true, name: true } },
          },
        }),
        prisma.bid.updateMany({
          where: {
            cropId,
            id: { not: existingBid.id },
            status: 'PENDING',
            amount: { lt: bidAmount },
          },
          data: { status: 'OUTBID' },
        }),
      ]);
      return updated;
    }

    const [bid] = await prisma.$transaction([
      prisma.bid.create({
        data: {
          amount: bidAmount,
          message,
          cropId,
          buyerId,
        },
        include: {
          crop: { select: { id: true, title: true, basePrice: true } },
          buyer: { select: { id: true, name: true } },
        },
      }),
      prisma.bid.updateMany({
        where: {
          cropId,
          status: 'PENDING',
          amount: { lt: bidAmount },
        },
        data: { status: 'OUTBID' },
      }),
    ]);

    return bid;
  }

  /**
   * Get all bids for a crop
   */
  async getCropBids(cropId, { page = 1, limit = 20 }) {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({
        where: { cropId },
        skip,
        take: parseInt(limit),
        include: {
          buyer: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { amount: 'desc' },
      }),
      prisma.bid.count({ where: { cropId } }),
    ]);

    return { bids, total };
  }

  /**
   * Accept a bid (Farmer)
   */
  async acceptBid(bidId, farmerId) {
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { crop: true },
    });

    if (!bid) {
      throw Object.assign(new Error('Bid not found'), { statusCode: 404 });
    }
    if (bid.crop.farmerId !== farmerId) {
      throw Object.assign(new Error('You can only accept bids on your own crops'), { statusCode: 403 });
    }
    if (bid.status !== 'PENDING') {
      throw Object.assign(new Error('Bid is not in pending state'), { statusCode: 400 });
    }
    if (bid.crop.status !== 'ACTIVE') {
      throw Object.assign(new Error('Crop is no longer active'), { statusCode: 400 });
    }
    if (bid.crop.biddingEndsAt && new Date() > bid.crop.biddingEndsAt) {
      throw Object.assign(new Error('Bidding period has ended'), { statusCode: 400 });
    }

    // Accept this bid, reject others
    const [acceptedBid] = await prisma.$transaction([
      prisma.bid.update({
        where: { id: bidId },
        data: { status: 'ACCEPTED' },
        include: {
          buyer: { select: { id: true, name: true, email: true } },
          crop: { select: { id: true, title: true } },
        },
      }),
      prisma.bid.updateMany({
        where: {
          cropId: bid.cropId,
          id: { not: bidId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      }),
      prisma.crop.update({
        where: { id: bid.cropId },
        data: { status: 'SOLD' },
      }),
      // Create a purchase record from the accepted bid
      prisma.purchase.create({
        data: {
          quantity: bid.crop.quantity,
          pricePerUnit: bid.amount,
          totalAmount: bid.amount * bid.crop.quantity,
          status: 'CONFIRMED',
          cropId: bid.cropId,
          buyerId: bid.buyerId,
        },
      }),
    ]);

    return acceptedBid;
  }

  /**
   * Reject a bid (Farmer)
   */
  async rejectBid(bidId, farmerId) {
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { crop: true },
    });

    if (!bid) {
      throw Object.assign(new Error('Bid not found'), { statusCode: 404 });
    }
    if (bid.crop.farmerId !== farmerId) {
      throw Object.assign(new Error('You can only reject bids on your own crops'), { statusCode: 403 });
    }
    if (bid.status !== 'PENDING') {
      throw Object.assign(new Error('Bid is not in pending state'), { statusCode: 400 });
    }

    const rejected = await prisma.bid.update({
      where: { id: bidId },
      data: { status: 'REJECTED' },
    });

    return rejected;
  }

  /**
   * Get buyer's bids
   */
  async getMyBids(buyerId, { page = 1, limit = 20 }) {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({
        where: { buyerId },
        skip,
        take: parseInt(limit),
        include: {
          crop: {
            select: {
              id: true,
              title: true,
              basePrice: true,
              status: true,
              biddingEndsAt: true,
              farmer: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.bid.count({ where: { buyerId } }),
    ]);

    return { bids, total };
  }

  /**
   * Admin: Update default bidding duration
   */
  async updateBiddingDuration(hours) {
    let settings = await prisma.adminSetting.findFirst();

    if (!settings) {
      settings = await prisma.adminSetting.create({
        data: { defaultBiddingDuration: parseInt(hours) },
      });
    } else {
      settings = await prisma.adminSetting.update({
        where: { id: settings.id },
        data: { defaultBiddingDuration: parseInt(hours) },
      });
    }

    return settings;
  }

  /**
   * Get admin settings
   */
  async getAdminSettings() {
    let settings = await prisma.adminSetting.findFirst();
    if (!settings) {
      settings = await prisma.adminSetting.create({
        data: { defaultBiddingDuration: 24 },
      });
    }
    return settings;
  }

  /**
   * Get admin stats
   */
  async getAdminStats() {
    const [
      users,
      farmers,
      buyers,
      pendingKyc,
      crops,
      openCrops,
      soldCrops,
      bids
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'FARMER' } }),
      prisma.user.count({ where: { role: 'BUYER' } }),
      prisma.user.count({ where: { kycStatus: 'PENDING' } }),
      prisma.crop.count(),
      prisma.crop.count({ where: { status: 'ACTIVE' } }),
      prisma.crop.count({ where: { status: 'SOLD' } }),
      prisma.bid.count()
    ]);

    return {
      users,
      farmers,
      buyers,
      crops,
      openCrops,
      soldCrops,
      bids,
      pendingKyc
    };
  }
}

module.exports = new BiddingService();
