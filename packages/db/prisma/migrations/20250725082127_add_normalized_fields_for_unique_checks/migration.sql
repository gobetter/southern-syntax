/*
  Warnings:

  - A unique constraint covering the columns `[titleEnNormalized]` on the table `Media` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "titleEnNormalized" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Media_titleEnNormalized_key" ON "Media"("titleEnNormalized");
