/*
  Warnings:

  - You are about to drop the column `categoryId` on the `JobRequest` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `JobRequest` table. All the data in the column will be lost.
  - You are about to drop the column `deadline` on the `JobRequest` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `JobRequest` table. All the data in the column will be lost.
  - You are about to drop the column `deadline` on the `ServiceOffer` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `ServiceOffer` table. All the data in the column will be lost.
  - You are about to drop the column `requestId` on the `ServiceOffer` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ServiceOffer` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `JobRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `ServiceOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ServiceOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "JobRequest" DROP CONSTRAINT "JobRequest_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "JobRequest" DROP CONSTRAINT "JobRequest_clientId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceOffer" DROP CONSTRAINT "ServiceOffer_providerId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceOffer" DROP CONSTRAINT "ServiceOffer_requestId_fkey";

-- DropIndex
DROP INDEX "Rating_raterId_matchId_key";

-- AlterTable
ALTER TABLE "JobRequest" DROP COLUMN "categoryId",
DROP COLUMN "clientId",
DROP COLUMN "deadline",
DROP COLUMN "status",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ServiceOffer" DROP COLUMN "deadline",
DROP COLUMN "providerId",
DROP COLUMN "requestId",
DROP COLUMN "status",
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar",
DROP COLUMN "role",
DROP COLUMN "updatedAt",
ADD COLUMN     "idPhotoUrl" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "zone" "Zone" NOT NULL;

-- DropTable
DROP TABLE "Category";

-- AddForeignKey
ALTER TABLE "ServiceOffer" ADD CONSTRAINT "ServiceOffer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequest" ADD CONSTRAINT "JobRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
