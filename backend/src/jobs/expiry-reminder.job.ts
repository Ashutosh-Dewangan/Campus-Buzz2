import prisma from "../lib/prisma";
import { createNotification } from "../services/notification.service";

const CHECK_INTERVAL_MS = 60_000;

const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const FIVE_MINUTES_MS = 5 * 60 * 1000;

export async function processExpiryReminders() {
  const now = new Date();

  const posts = await prisma.post.findMany({
    where: {
      status: "ACTIVE",
      interactionType: {
        in: ["FOOD_SPLIT", "CAB_SPLIT"],
      },
      expiresAt: {
        not: null,
        gt: now,
        lte: new Date(now.getTime() + THIRTY_MINUTES_MS),
      },
    },
    select: {
      id: true,
      title: true,
      authorId: true,
      expiresAt: true,
      expiryReminder30SentAt: true,
      expiryReminder5SentAt: true,
    },
  });

  let notificationCount = 0;

  for (const post of posts) {
    if (!post.expiresAt) {
      continue;
    }

    const remainingMs =
      post.expiresAt.getTime() - now.getTime();

    /*
     * 30-minute reminder
     *
     * This intentionally also catches posts whose custom
     * expiry is shorter than 30 minutes.
     */
    if (
      remainingMs <= THIRTY_MINUTES_MS &&
      post.expiryReminder30SentAt === null
    ) {
      await createNotification({
        userId: post.authorId,
        type: "EXPIRY_APPROACHING",
        title: "Your post expires in 30 minutes",
        description:
          `"${post.title}" is approaching its expiry time.`,
        link: `/buzz/${post.id}`,
      });

      await prisma.post.update({
        where: {
          id: post.id,
        },
        data: {
          expiryReminder30SentAt: now,
        },
      });

      notificationCount++;
    }

    /*
     * 5-minute reminder
     */
    if (
      remainingMs <= FIVE_MINUTES_MS &&
      post.expiryReminder5SentAt === null
    ) {
      await createNotification({
        userId: post.authorId,
        type: "EXPIRY_APPROACHING",
        title: "Your post expires in 5 minutes",
        description:
          `"${post.title}" will expire soon.`,
        link: `/buzz/${post.id}`,
      });

      await prisma.post.update({
        where: {
          id: post.id,
        },
        data: {
          expiryReminder5SentAt: now,
        },
      });

      notificationCount++;
    }
  }

  return notificationCount;
}

export function startExpiryReminderJob() {
  const run = async () => {
    try {
      const count = await processExpiryReminders();

      if (count > 0) {
        console.log(
          `Expiry reminder job sent ${count} notification(s).`,
        );
      }
    } catch (error) {
      console.error(
        "Expiry reminder job failed:",
        error,
      );
    }
  };

  void run();

  const interval = setInterval(() => {
    void run();
  }, CHECK_INTERVAL_MS);

  return () => clearInterval(interval);
}