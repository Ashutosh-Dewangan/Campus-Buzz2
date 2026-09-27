import "dotenv/config";
import prisma from "./lib/prisma";

async function main() {
  console.log("Seeding development data...");

  const student1 = await prisma.user.upsert({
    where: {
      instituteEmail: "student@campusbuzz.test",
    },
    update: {},
    create: {
        rollNumber: "STUDENT001",
        instituteEmail: "student@campusbuzz.test",
        name: "Development Student",
        passwordHash: "NOT_USED_FOR_LOGIN",
        role: "STUDENT",
      },
  });
  await prisma.user.upsert({
    where: {
      rollNumber: "STUDENT002",
    },
    update: {},
    create: {
      name: "Development Student 2",
      rollNumber: "STUDENT002",
      instituteEmail: "student2@campusbuzz.test",
      passwordHash: "NOT_USED_FOR_LOGIN",
      role: "STUDENT",
    },
  });
  const admin = await prisma.user.upsert({
    where: {
      instituteEmail: "admin@campusbuzz.test",
    },
    update: {},
    create: {
        rollNumber: "ADMIN001",
        instituteEmail: "admin@campusbuzz.test",
        name: "Development Admin",
        passwordHash: "NOT_USED_FOR_LOGIN",
        role: "ADMIN",
      },
  });

  const roboticsClub = await prisma.organization.upsert({
    where: {
      id: "00000000-0000-0000-0000-000000000001",
    },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Robotics Club",
      type: "CLUB",
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: student1.id,
        organizationId: roboticsClub.id,
      },
    },
    update: {
      status: "ACTIVE",
    },
    create: {
      userId: student1.id,
      organizationId: roboticsClub.id,
      status: "ACTIVE",
    },
  });

  console.log("Seed completed.");
  console.log("Student:", student1.instituteEmail);
  console.log("Admin:", admin.instituteEmail);
  console.log("Organization:", roboticsClub.name);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });