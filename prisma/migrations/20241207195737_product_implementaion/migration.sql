-- CreateTable
CREATE TABLE "Product" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "container_type" TEXT NOT NULL,
    "uom" TEXT NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "flavor" TEXT NOT NULL,
    "default_labeled_price" DOUBLE PRECISION NOT NULL,
    "product_image" TEXT NOT NULL DEFAULT '/default.jpg',

    CONSTRAINT "Product_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_key_key" ON "Product"("key");
