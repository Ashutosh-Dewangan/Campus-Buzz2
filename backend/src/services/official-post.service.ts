import { Prisma } from "../generated/prisma/browser";
import prisma from "../lib/prisma";
import type { CreateOfficialPostInput } from "../validators/official-post.validators";

function formatCampusDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to format event date");
  }

  return `${year}-${month}-${day}`;
}

function formatCampusTime(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;

  if (!hour || !minute) {
    throw new Error("Unable to format event time");
  }

  return `${hour}:${minute}`;
}

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
  const posts = await prisma.officialPost.findMany({
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

      event: {
        select: {
          id: true,
          name: true,
          startAt: true,
          venue: true,
        },
      },
    },
  });

  return posts.map((post) => ({
    ...post,
    event: post.event
      ? {
          id: post.event.id,
          name: post.event.name,
          date: formatCampusDate(post.event.startAt),
          time: formatCampusTime(post.event.startAt),
          venue: post.event.venue,
        }
      : null,
  }));
}

export async function deleteOfficialPost(
  userId: string,
  role: string,
  officialPostId: string,
) {
  const post = await prisma.officialPost.findUnique({
    where: {
      id: officialPostId,
    },
    select: {
      id: true,
      organizationId: true,
    },
  });

  if (!post) {
    throw new Error("Official post not found");
  }

  if (role !== "ADMIN") {
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        organizationId: post.organizationId,
        status: "ACTIVE",
      },
    });

    if (!membership) {
      throw new Error(
        "You are not an active member of this organization",
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.event.updateMany({
      where: {
        linkedOfficialPostId: officialPostId,
      },
      data: {
        linkedOfficialPostId: null,
      },
    });

    await tx.officialPost.delete({
      where: {
        id: officialPostId,
      },
    });
  });
}