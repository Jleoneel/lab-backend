-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "acuerdoFirmado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fechaAcuerdo" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AcuerdoConfidencialidad" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "clientId" TEXT NOT NULL,
    "quoteId" INTEGER NOT NULL,
    "creadoPor" TEXT NOT NULL,
    "archivoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcuerdoConfidencialidad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcuerdoConfidencialidad_codigo_key" ON "AcuerdoConfidencialidad"("codigo");

-- AddForeignKey
ALTER TABLE "AcuerdoConfidencialidad" ADD CONSTRAINT "AcuerdoConfidencialidad_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcuerdoConfidencialidad" ADD CONSTRAINT "AcuerdoConfidencialidad_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
