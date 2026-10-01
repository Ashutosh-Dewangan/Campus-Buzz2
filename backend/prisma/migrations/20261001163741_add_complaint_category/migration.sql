-- CreateEnum
CREATE TYPE "ComplaintCategory" AS ENUM ('HOSTEL', 'MESS_CAFETERIA', 'CAMPUS_WIFI', 'LIBRARY_FACILITIES', 'ACADEMIC', 'OTHER');

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "category" "ComplaintCategory" NOT NULL DEFAULT 'OTHER';
