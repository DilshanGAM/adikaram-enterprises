/*
  Warnings:

  - Added the required column `default_cost` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "default_cost" DOUBLE PRECISION NOT NULL;
