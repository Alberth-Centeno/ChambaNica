/*
  Warnings:

  - You are about to drop the column `offerId` on the `JobMatch` table. All the data in the column will be lost.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "JobMatch" DROP CONSTRAINT "JobMatch_offerId_fkey";

-- AlterTable
ALTER TABLE "JobMatch" DROP COLUMN "offerId",
ADD COLUMN     "offerUserId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'TRABAJADOR';

-- AddForeignKey
ALTER TABLE "JobMatch" ADD CONSTRAINT "JobMatch_offerUserId_fkey" FOREIGN KEY ("offerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
