-- CreateTable
CREATE TABLE "MediaCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaTag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MediaToMediaCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MediaToMediaCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MediaToMediaTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MediaToMediaTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaCategory_slug_key" ON "MediaCategory"("slug");

-- CreateIndex
CREATE INDEX "MediaCategory_slug_idx" ON "MediaCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MediaTag_slug_key" ON "MediaTag"("slug");

-- CreateIndex
CREATE INDEX "MediaTag_slug_idx" ON "MediaTag"("slug");

-- CreateIndex
CREATE INDEX "_MediaToMediaCategory_B_index" ON "_MediaToMediaCategory"("B");

-- CreateIndex
CREATE INDEX "_MediaToMediaTag_B_index" ON "_MediaToMediaTag"("B");

-- CreateIndex
CREATE INDEX "Media_filename_idx" ON "Media"("filename");

-- CreateIndex
CREATE INDEX "Media_isSystem_idx" ON "Media"("isSystem");

-- AddForeignKey
ALTER TABLE "_MediaToMediaCategory" ADD CONSTRAINT "_MediaToMediaCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToMediaCategory" ADD CONSTRAINT "_MediaToMediaCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "MediaCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToMediaTag" ADD CONSTRAINT "_MediaToMediaTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToMediaTag" ADD CONSTRAINT "_MediaToMediaTag_B_fkey" FOREIGN KEY ("B") REFERENCES "MediaTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
