/*
  Warnings:

  - A unique constraint covering the columns `[sampleId,serviceId,repeticion]` on the table `SampleService` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "SampleService_sampleId_serviceId_key";

-- AlterTable
ALTER TABLE "SampleService" ADD COLUMN     "repeticion" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "SampleService_sampleId_serviceId_repeticion_key" ON "SampleService"("sampleId", "serviceId", "repeticion");
