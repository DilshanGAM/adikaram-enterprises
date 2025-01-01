import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = '123'; 
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email: "shashika@adikaram.com",
      name: "Shashika Adikaram",
      phone: "1234567890",
      whatsapp: "1234567890",
      address: "Maharagama, Sri Lanka",
      title: "System Administrator",
      role: "admin",
      password: hashedPassword,
      status: "active",
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