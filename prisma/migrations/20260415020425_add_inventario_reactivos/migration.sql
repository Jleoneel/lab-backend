-- CreateEnum
CREATE TYPE "CategoriaReactivo" AS ENUM ('SUJETOS_FISCALIZACION', 'FUERZAS_ARMADAS', 'QUIMICA', 'BIOLOGIA_MOLECULAR', 'MICROBIOLOGIA');

-- CreateEnum
CREATE TYPE "UnidadReactivo" AS ENUM ('LITROS', 'KILOGRAMOS');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('INGRESO', 'CONSUMO');

-- CreateEnum
CREATE TYPE "RazonMovimiento" AS ENUM ('INICIO', 'ANALISIS', 'PREPARACION_SOLUCION', 'LIMPIEZA', 'VENCIMIENTO', 'OTRO');

-- CreateTable
CREATE TABLE "Reactivo" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" "CategoriaReactivo" NOT NULL,
    "unidad" "UnidadReactivo" NOT NULL,
    "stockActual" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "stockMinimo" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reactivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoReactivo" (
    "id" TEXT NOT NULL,
    "reactivoId" TEXT NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "razon" "RazonMovimiento" NOT NULL DEFAULT 'ANALISIS',
    "cantidad" DECIMAL(65,30) NOT NULL,
    "sampleServiceId" TEXT,
    "registradoPor" TEXT NOT NULL,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoReactivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reactivo_codigo_key" ON "Reactivo"("codigo");

-- CreateIndex
CREATE INDEX "Reactivo_nombre_idx" ON "Reactivo"("nombre");

-- CreateIndex
CREATE INDEX "Reactivo_categoria_idx" ON "Reactivo"("categoria");

-- CreateIndex
CREATE INDEX "MovimientoReactivo_reactivoId_idx" ON "MovimientoReactivo"("reactivoId");

-- CreateIndex
CREATE INDEX "MovimientoReactivo_createdAt_idx" ON "MovimientoReactivo"("createdAt");

-- CreateIndex
CREATE INDEX "MovimientoReactivo_tipo_idx" ON "MovimientoReactivo"("tipo");

-- AddForeignKey
ALTER TABLE "MovimientoReactivo" ADD CONSTRAINT "MovimientoReactivo_reactivoId_fkey" FOREIGN KEY ("reactivoId") REFERENCES "Reactivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
