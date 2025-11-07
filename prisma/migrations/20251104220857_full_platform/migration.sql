/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `JobMatch` table. All the data in the column will be lost.
  - You are about to drop the column `budget` on the `JobRequest` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `JobRequest` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `JobRequest` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ServiceOffer` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `ServiceOffer` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `ServiceOffer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ServiceOffer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,trade]` on the table `ServiceOffer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `trade` to the `JobRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zone` to the `JobRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trade` to the `ServiceOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workPhotoUrl` to the `ServiceOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearsExperience` to the `ServiceOffer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JobMatch" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "JobRequest" DROP COLUMN "budget",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "trade" "Trade" NOT NULL,
ADD COLUMN     "zone" "Zone" NOT NULL;

-- AlterTable
ALTER TABLE "ServiceOffer" DROP COLUMN "description",
DROP COLUMN "price",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "trade" "Trade" NOT NULL,
ADD COLUMN     "workPhotoUrl" TEXT NOT NULL,
ADD COLUMN     "yearsExperience" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOffer_userId_trade_key" ON "ServiceOffer"("userId", "trade");
