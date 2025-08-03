/*
  Warnings:

  - A unique constraint covering the columns `[nameEnNormalized]` on the table `MediaCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nameEnNormalized]` on the table `MediaTag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[titleEnNormalized]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nameEnNormalized]` on the table `PostCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nameEnNormalized]` on the table `PostTag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[titleEnNormalized]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nameEnNormalized]` on the table `ProductCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nameEnNormalized]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nameEnNormalized` to the `MediaCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameEnNormalized` to the `MediaTag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleEnNormalized` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameEnNormalized` to the `PostCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameEnNormalized` to the `PostTag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleEnNormalized` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameEnNormalized` to the `ProductCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameEnNormalized` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MediaCategory" ADD COLUMN     "nameEnNormalized" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MediaTag" ADD COLUMN     "nameEnNormalized" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "titleEnNormalized" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PostCategory" ADD COLUMN     "nameEnNormalized" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PostTag" ADD COLUMN     "nameEnNormalized" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "titleEnNormalized" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN     "nameEnNormalized" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "nameEnNormalized" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MediaCategory_nameEnNormalized_key" ON "MediaCategory"("nameEnNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "MediaTag_nameEnNormalized_key" ON "MediaTag"("nameEnNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "Post_titleEnNormalized_key" ON "Post"("titleEnNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "PostCategory_nameEnNormalized_key" ON "PostCategory"("nameEnNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "PostTag_nameEnNormalized_key" ON "PostTag"("nameEnNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "Product_titleEnNormalized_key" ON "Product"("titleEnNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_nameEnNormalized_key" ON "ProductCategory"("nameEnNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "Role_nameEnNormalized_key" ON "Role"("nameEnNormalized");
