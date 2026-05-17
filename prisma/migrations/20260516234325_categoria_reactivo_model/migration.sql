/*
  Warnings:

  - You are about to drop the column `categoria` on the `Reactivo` table. All the data in the column will be lost.
  - Added the required column `categoriaId` to the `Reactivo` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Reactivo_categoria_idx";

-- AlterTable
ALTER TABLE "Reactivo" DROP COLUMN "categoria",
ADD COLUMN     "categoriaId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "CategoriaReactivo";

-- CreateTable
CREATE TABLE "CategoriaReactivo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoriaReactivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaReactivo_nombre_key" ON "CategoriaReactivo"("nombre");

-- CreateIndex
CREATE INDEX "Reactivo_categoriaId_idx" ON "Reactivo"("categoriaId");

-- AddForeignKey
ALTER TABLE "Reactivo" ADD CONSTRAINT "Reactivo_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaReactivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
