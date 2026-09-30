/*
  Warnings:

  - You are about to drop the column `linkedPostId` on the `Event` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[linkedOfficialPostId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_linkedPostId_fkey";

-- DropIndex
DROP INDEX "Event_linkedPostId_key";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "linkedPostId",
ADD COLUMN     "linkedOfficialPostId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Event_linkedOfficialPostId_key" ON "Event"("linkedOfficialPostId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_linkedOfficialPostId_fkey" FOREIGN KEY ("linkedOfficialPostId") REFERENCES "OfficialPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
