import prisma from "../lib/prisma";
import type { CreateOfficialPostInput } from "../validators/official-post.validators";

export async function createOfficialPost(
  userId: string,
  data: CreateOfficialPostInput,
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      role: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "ADMIN") {
    const membership =
      await prisma.membership.findFirst({
        where: {
          userId,
          organizationId: data.organizationId,
          status: "ACTIVE",
        },
      });

    if (!membership) {
      throw new Error(
        "You are not an active member of this organization",
      );
    }
  }

  const organization =
    await prisma.organization.findUnique({
      where: {
        id: data.organizationId,
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

  if (!organization) {
    throw new Error("Organization not found");
  }

  return prisma.officialPost.create({
    data: {
      title: data.title,
      content: data.content,
      link: data.link,
      formUrl: data.formUrl,

      authorId: userId,
      organizationId: data.organizationId,
    },

    include: {
      organization: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },

      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function getOfficialPosts() {
  return prisma.officialPost.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      organization: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },

      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}