/*
  Warnings:

  - You are about to drop the column `razon` on the `MovimientoReactivo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MovimientoReactivo" DROP COLUMN "razon",
ADD COLUMN     "razonId" TEXT;

-- DropEnum
DROP TYPE "RazonMovimiento";

-- CreateTable
CREATE TABLE "RazonConsumo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RazonConsumo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RazonConsumo_nombre_key" ON "RazonConsumo"("nombre");

-- AddForeignKey
ALTER TABLE "MovimientoReactivo" ADD CONSTRAINT "MovimientoReactivo_razonId_fkey" FOREIGN KEY ("razonId") REFERENCES "RazonConsumo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
