-- AlterTable
ALTER TABLE "JobMatch" ADD COLUMN     "completedByOfferer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "completedByRequester" BOOLEAN NOT NULL DEFAULT false;
