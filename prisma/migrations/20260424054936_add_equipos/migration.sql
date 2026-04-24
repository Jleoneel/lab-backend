-- CreateEnum
CREATE TYPE "EstadoEquipo" AS ENUM ('ACTIVO', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO', 'DADO_DE_BAJA');

-- CreateTable
CREATE TABLE "Equipo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "modelo" TEXT,
    "marca" TEXT,
    "serie" TEXT,
    "codigoInventario" TEXT NOT NULL,
    "ubicacion" TEXT,
    "fechaAdquisicion" TIMESTAMP(3),
    "fechaMantenimiento" TIMESTAMP(3),
    "fechaCalibracion" TIMESTAMP(3),
    "estado" "EstadoEquipo" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Equipo_serie_key" ON "Equipo"("serie");

-- CreateIndex
CREATE UNIQUE INDEX "Equipo_codigoInventario_key" ON "Equipo"("codigoInventario");
