/*
  Warnings:

  - You are about to drop the column `description` on the `Sample` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Sample" DROP COLUMN "description",
ADD COLUMN     "cantidadRecibida" TEXT,
ADD COLUMN     "objetivoAnalisis" TEXT;
