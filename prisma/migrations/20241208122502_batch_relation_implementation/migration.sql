-- CreateTable
CREATE TABLE "Batch" (
    "batch_id" SERIAL NOT NULL,
    "product_key" TEXT NOT NULL,
    "uom" INTEGER NOT NULL,
    "packs" INTEGER NOT NULL,
    "loose" INTEGER NOT NULL,
    "mfd" TIMESTAMP(3) NOT NULL,
    "exp" TIMESTAMP(3) NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "labeled_price" DOUBLE PRECISION NOT NULL,
    "purchase_invoice_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedBy" TEXT NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("batch_id")
);

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_product_key_fkey" FOREIGN KEY ("product_key") REFERENCES "Product"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
