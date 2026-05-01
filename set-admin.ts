import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'atharadzradara@gmail.com';
  const hashed = await bcrypt.hash('12345678', 12);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: Role.ADMIN,
      password: hashed,
      emailVerified: new Date()
    },
    create: {
      email,
      name: 'Admin',
      password: hashed,
      role: Role.ADMIN,
      emailVerified: new Date()
    }
  });
  
  console.log("User updated successfully:", user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
