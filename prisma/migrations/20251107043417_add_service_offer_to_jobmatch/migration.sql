-- AlterTable
ALTER TABLE "JobMatch" ADD COLUMN     "serviceOfferId" TEXT;

-- AddForeignKey
ALTER TABLE "JobMatch" ADD CONSTRAINT "JobMatch_serviceOfferId_fkey" FOREIGN KEY ("serviceOfferId") REFERENCES "ServiceOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
