import "dotenv/config";
import prisma from "./lib/prisma";

async function main() {
  console.log("Seeding development data...");

  const student = await prisma.user.upsert({
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
        userId: student.id,
        organizationId: roboticsClub.id,
      },
    },
    update: {
      status: "ACTIVE",
    },
    create: {
      userId: student.id,
      organizationId: roboticsClub.id,
      status: "ACTIVE",
    },
  });

  console.log("Seed completed.");
  console.log("Student:", student.instituteEmail);
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