const prisma = require('./src/config/database');

async function check() {
  const crops = await prisma.crop.findMany({
    include: { farmer: true }
  });
  console.log(JSON.stringify(crops, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
