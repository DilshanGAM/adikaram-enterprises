import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: "shashika@adikaram.com",
      name: "Shashika Adikaram",
      phone: "1234567890",
      whatsapp: "1234567890",
      address: "Maharagama, Sri Lanka",
      title: "System Administrator",
      role: "admin",
      password: "$2y$12$W3ulNwQG7ssME77.nA.SQO7E5gUL3yC9i9ZmMA1a6Fg2/9BHV1HqC",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
