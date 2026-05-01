import "dotenv/config";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const categories = [
  { name: "Elektronik", slug: "elektronik", icon: "cpu" },
  { name: "Fashion", slug: "fashion", icon: "shirt" },
  { name: "Kendaraan", slug: "kendaraan", icon: "car" },
  { name: "Properti", slug: "properti", icon: "home" },
  { name: "Hobi", slug: "hobi", icon: "gamepad-2" },
  { name: "Rumah Tangga", slug: "rumah-tangga", icon: "sofa" },
  { name: "Pekerjaan", slug: "pekerjaan", icon: "briefcase" },
  { name: "Lainnya", slug: "lainnya", icon: "package" },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Seed categories
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ Seeded ${categories.length} categories`);

  // Seed admin user
  const hashedPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@jualinaja.id" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@jualinaja.id",
      password: hashedPassword,
      role: Role.ADMIN,
      phone: "08111234567",
    },
  });
  console.log(`✅ Admin user: ${admin.email} / password: admin123456`);

  // Seed demo user
  const demoHash = await bcrypt.hash("demo123456", 12);
  const demo = await prisma.user.upsert({
    where: { email: "demo@jualinaja.id" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@jualinaja.id",
      password: demoHash,
      phone: "08211234567",
    },
  });
  console.log(`✅ Demo user: ${demo.email} / password: demo123456`);

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
