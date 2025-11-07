/*
  Warnings:

  - A unique constraint covering the columns `[matchId,raterId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Rating_matchId_raterId_key" ON "Rating"("matchId", "raterId");
