import prisma from "../lib/prisma";
const EXPIRY_CHECK_INTERVAL_MS = 60_000;
export async function processExpiredPosts() {
  const now = new Date();
  const expiredPosts = await prisma.post.findMany({
    where: {
      status: "ACTIVE",
      interactionType: {
        in: ["FOOD_SPLIT", "CAB_SPLIT"],
      },
      expiresAt: {
        not: null,
        lte: now,
      },
    },
    select: {
      id: true,
    },
  });
  if (expiredPosts.length === 0) {
    return 0;
  }
  const postIds = expiredPosts.map((post) => post.id);
  const result = await prisma.$transaction(async (tx) => {
    const closedPosts = await tx.post.updateMany({
      where: {
        id: { in: postIds },
        status: "ACTIVE",
        interactionType: {
          in: ["FOOD_SPLIT", "CAB_SPLIT"],
        },
        expiresAt: {
          not: null,
          lte: now,
        },
      },
      data: {
        status: "CLOSED",
      },
    });
    await tx.chatRoom.updateMany({
      where: {
        postId: { in: postIds },
        status: "OPEN",
      },
      data: {
        status: "CLOSED",
        closedAt: now,
      },
    });
    return closedPosts.count;
  });
  return result;
}
export function startPostExpiryJob() {
  const run = async () => {
    try {
      const count = await processExpiredPosts();
      if (count > 0) {
        console.log(
          `Post expiry job closed ${count} expired post(s).`,
        );
      }
    } catch (error) {
      console.error(
        "Post expiry job failed:",
        error,
      );
    }
  };
  // Run once immediately when the server starts.
  void run();
  // Then check every minute.
  const interval = setInterval(() => {
    void run();
  }, EXPIRY_CHECK_INTERVAL_MS);
  return () => clearInterval(interval);
}