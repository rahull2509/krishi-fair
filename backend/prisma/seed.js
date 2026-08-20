const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing to avoid duplicates in MongoDB
  await prisma.crop.deleteMany();
  await prisma.adminSetting.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@krishifare.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@krishifare.com',
      phone: '9999999999',
      password: adminPassword,
      role: 'ADMIN',
      kycStatus: 'VERIFIED',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create sample Farmer
  const farmerPassword = await bcrypt.hash('Farmer@123', 10);
  const farmer = await prisma.user.upsert({
    where: { email: 'ramu@farmer.com' },
    update: {},
    create: {
      name: 'Ramu Kisan',
      email: 'ramu@farmer.com',
      phone: '9876543210',
      password: farmerPassword,
      role: 'FARMER',
      kycStatus: 'VERIFIED',
    },
  });
  console.log('✅ Farmer created:', farmer.email);

  // Create sample Buyer
  const buyerPassword = await bcrypt.hash('Buyer@123', 10);
  const buyer = await prisma.user.upsert({
    where: { email: 'suresh@buyer.com' },
    update: {},
    create: {
      name: 'Suresh Trader',
      email: 'suresh@buyer.com',
      phone: '9876543211',
      password: buyerPassword,
      role: 'BUYER',
      aadharNumber: '123456789012',
      gstNumber: '22AAAAA0000A1Z5',
      panNumber: 'ABCDE1234F',
      kycStatus: 'VERIFIED',
    },
  });
  console.log('✅ Buyer created:', buyer.email);

  // Create sample crops
  const crops = await Promise.all([
    prisma.crop.create({
      data: {
        title: 'Organic Wheat - Premium Quality',
        description: 'Freshly harvested organic wheat from Punjab fields. No pesticides used.',
        category: 'Grain',
        variety: 'HD-2967',
        quantity: 100,
        unit: 'quintal',
        basePrice: 2500,
        minBidPrice: 2200,
        imageIds: '[]',
        status: 'ACTIVE',
        allowBidding: true,
        biddingEndsAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        location: 'Amritsar Mandi',
        state: 'Punjab',
        district: 'Amritsar',
        farmerId: farmer.id,
      },
    }),
    prisma.crop.create({
      data: {
        title: 'Fresh Tomatoes - Grade A',
        description: 'High quality tomatoes, perfect red color, farm fresh.',
        category: 'Vegetable',
        variety: 'Hybrid',
        quantity: 50,
        unit: 'quintal',
        basePrice: 1800,
        minBidPrice: 1500,
        imageIds: '[]',
        status: 'ACTIVE',
        allowBidding: true,
        biddingEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        location: 'Nashik Mandi',
        state: 'Maharashtra',
        district: 'Nashik',
        farmerId: farmer.id,
      },
    }),
    prisma.crop.create({
      data: {
        title: 'Basmati Rice - Direct from Farm',
        description: 'Premium basmati rice, long grain, aromatic. Direct from Haryana farms.',
        category: 'Grain',
        variety: 'Pusa Basmati 1121',
        quantity: 200,
        unit: 'quintal',
        basePrice: 3500,
        minBidPrice: 3200,
        imageIds: '[]',
        status: 'ACTIVE',
        allowBidding: false,
        location: 'Karnal Mandi',
        state: 'Haryana',
        district: 'Karnal',
        farmerId: farmer.id,
      },
    }),
  ]);
  console.log(`✅ ${crops.length} crops created`);

  // Create admin settings
  await prisma.adminSetting.create({
    data: {
      defaultBiddingDuration: 24,
      platformFeePercent: 2.0,
    },
  });
  console.log('✅ Admin settings created');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
