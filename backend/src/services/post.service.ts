import prisma from "../lib/prisma";
import type { CreatePostInput } from "../validators/post.validators";

const interactionTypeMap = {
  "#foodsplit": "FOOD_SPLIT",
  "#cabsplit": "CAB_SPLIT",
  "#resell": "RESELL",
  "#lost": "LOST",
  "#found": "FOUND",
} as const;

export async function createCampusBuzzPost(
  userId: string,
  data: CreatePostInput,
  imageUrl: string,
) {
  const interactionHashtag = data.hashtags.find(
    (hashtag) => hashtag in interactionTypeMap,
  );

  if (!interactionHashtag) {
    throw new Error(
      "Invalid interaction hashtag",
    );
  }

  const interactionType =
    interactionTypeMap[
      interactionHashtag as keyof typeof interactionTypeMap
    ];

  const requiresChatRoom =
    interactionType === "FOOD_SPLIT" ||
    interactionType === "CAB_SPLIT" ||
    interactionType === "RESELL";

  const requiresExpiry =
    interactionType === "FOOD_SPLIT" ||
    interactionType === "CAB_SPLIT";

  const expiresAt = requiresExpiry
    ? data.expiresAt ??
      new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      )
    : null;

  return prisma.$transaction(async (tx) => {
    const hashtagRecords =
      await Promise.all(
        data.hashtags.map((hashtag) =>
          tx.hashtag.upsert({
            where: {
              name: hashtag,
            },
            update: {},
            create: {
              name: hashtag,
            },
          }),
        ),
      );

    const post = await tx.post.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl,

        feedType: "CAMPUS_BUZZ",
        interactionType,

        authorId: userId,

        contactName: data.contactName,
        contactPhone: data.contactPhone,

        expiresAt,

        hashtags: {
          create:
            hashtagRecords.map(
              (hashtag) => ({
                hashtagId: hashtag.id,
              }),
            ),
        },

        ...(requiresChatRoom
          ? {
              chatRoom: {
                create: {},
              },
            }
          : {}),
      },

      include: {
        hashtags: {
          include: {
            hashtag: true,
          },
        },

        chatRoom: true,

        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return post;
  });
}

export async function getCampusBuzzPosts() {
  return prisma.post.findMany({
    where: {
      feedType: "CAMPUS_BUZZ",
      status: "ACTIVE",

      OR: [
        {
          expiresAt: null,
        },
        {
          expiresAt: {
            gt: new Date(),
          },
        },
      ],
    },

    orderBy: {
      createdAt: "desc",
    },

    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      feedType: true,
      interactionType: true,
      expiresAt: true,
      status: true,
      createdAt: true,
      updatedAt: true,

      author: {
        select: {
          id: true,
          name: true,
        },
      },

      hashtags: {
        include: {
          hashtag: true,
        },
      },

      chatRoom: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          closedAt: true,
        },
      },
    },
  });
}

export async function getPostContact(
  postId: string,
) {
  return prisma.post.findFirst({
    where: {
      id: postId,
      feedType: "CAMPUS_BUZZ",
      status: "ACTIVE",
      interactionType: {
        in: [
          "RESELL",
          "LOST",
          "FOUND",
        ],
      },
    },

    select: {
      id: true,
      interactionType: true,
      contactName: true,
      contactPhone: true,
    },
  });
}