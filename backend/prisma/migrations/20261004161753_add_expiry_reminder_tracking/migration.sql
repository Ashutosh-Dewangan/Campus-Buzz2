/*
  Warnings:

  - You are about to drop the column `expiryReminderSentAt` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "expiryReminderSentAt",
ADD COLUMN     "expiryReminder30SentAt" TIMESTAMP(3),
ADD COLUMN     "expiryReminder5SentAt" TIMESTAMP(3);
