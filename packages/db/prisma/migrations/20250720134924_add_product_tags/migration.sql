-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "productTagId" TEXT;

-- CreateTable
CREATE TABLE "ProductTag" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "nameEnNormalized" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductTag_slug_key" ON "ProductTag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTag_nameEnNormalized_key" ON "ProductTag"("nameEnNormalized");

-- CreateIndex
CREATE INDEX "ProductTag_slug_idx" ON "ProductTag"("slug");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productTagId_fkey" FOREIGN KEY ("productTagId") REFERENCES "ProductTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
