-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "titleSort" TEXT;

-- CreateIndex
CREATE INDEX "Media_titleSort_idx" ON "Media"("titleSort");
