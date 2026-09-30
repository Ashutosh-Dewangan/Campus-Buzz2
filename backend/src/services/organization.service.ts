import prisma from "../lib/prisma";

export async function getOrganizations() {
  return prisma.organization.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      type: true,
      description: true,
    },
  });
}