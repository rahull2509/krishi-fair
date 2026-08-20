const cron = require('node-cron');
const prisma = require('../config/database');

/**
 * Cron job to expire bidding listings
 * Runs every 5 minutes
 */
const startBiddingCron = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();

      // Find expired crops with active bidding
      const expiredCrops = await prisma.crop.findMany({
        where: {
          status: 'ACTIVE',
          allowBidding: true,
          biddingEndsAt: {
            lte: now,
          },
        },
        include: {
          bids: {
            where: { status: 'PENDING' },
            orderBy: { amount: 'desc' },
          },
        },
      });

      for (const crop of expiredCrops) {
        if (crop.bids.length > 0) {
          // Auto-close bidding — don't auto-accept, just mark as expired
          await prisma.bid.updateMany({
            where: {
              cropId: crop.id,
              status: 'PENDING',
            },
            data: { status: 'EXPIRED' },
          });

          await prisma.crop.update({
            where: { id: crop.id },
            data: { status: 'EXPIRED' },
          });

          console.log(`⏰ Bidding expired for crop: ${crop.title} (${crop.bids.length} bids expired)`);
        } else {
          // No bids — just expire the listing
          await prisma.crop.update({
            where: { id: crop.id },
            data: { status: 'EXPIRED' },
          });

          console.log(`⏰ Crop listing expired (no bids): ${crop.title}`);
        }
      }

      if (expiredCrops.length > 0) {
        console.log(`✅ Processed ${expiredCrops.length} expired listings`);
      }
    } catch (error) {
      console.error('❌ Cron job error:', error.message);
    }
  });

  console.log('⏰ Bidding expiration cron job started (every 5 minutes)');
};

module.exports = { startBiddingCron };
