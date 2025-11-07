/*
  Warnings:

  - The values [ALBAÑIL] on the enum `Trade` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- AlterEnum
BEGIN;
CREATE TYPE "Trade_new" AS ENUM ('PLOMERO', 'ELECTRICISTA', 'CARPINTERO', 'MECANICO', 'PINTOR', 'SOLDADOR', 'ALBANIL');
ALTER TABLE "WorkerProfile" ALTER COLUMN "specialties" TYPE "Trade_new"[] USING ("specialties"::text::"Trade_new"[]);
ALTER TABLE "JobPosting" ALTER COLUMN "tradeRequired" TYPE "Trade_new"[] USING ("tradeRequired"::text::"Trade_new"[]);
ALTER TYPE "Trade" RENAME TO "Trade_old";
ALTER TYPE "Trade_new" RENAME TO "Trade";
DROP TYPE "Trade_old";
COMMIT;
