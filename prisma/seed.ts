import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("LIC@427", 10);

  const admin = await prisma.employee.upsert({
    where: { email: "dipenjayg132@gmail.com" },
    update: {},
    create: {
      email: "dipenjayg132@gmail.com",
      password: hashedPassword,
      firstName: "Dipenjay",
      lastName: "Ghosh",
      role: "ADMIN",
      department: "IT",
      position: "System Administrator",
      isActive: true,
    },
  });

  // Create sample departments
  await prisma.department.upsert({
    where: { name: "IT" },
    update: {},
    create: {
      name: "IT",
      description: "Information Technology Department",
      managerId: admin.id,
      employeeCount: 1,
    },
  });

  await prisma.department.upsert({
    where: { name: "HR" },
    update: {},
    create: {
      name: "HR",
      description: "Human Resources Department",
      managerId: admin.id,
      employeeCount: 0,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
