/*
  Warnings:

  - The primary key for the `Quote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Quote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Request` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Request` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `quoteId` column on the `Request` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Sample` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Sample` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `quoteId` on the `QuoteItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `requestId` on the `Sample` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `sampleId` on the `SampleService` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `sampleId` on the `SampleStatusHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "QuoteStatus" ADD VALUE 'CONVERTED';

-- DropForeignKey
ALTER TABLE "QuoteItem" DROP CONSTRAINT "QuoteItem_quoteId_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_quoteId_fkey";

-- DropForeignKey
ALTER TABLE "Sample" DROP CONSTRAINT "Sample_requestId_fkey";

-- DropForeignKey
ALTER TABLE "SampleService" DROP CONSTRAINT "SampleService_sampleId_fkey";

-- DropForeignKey
ALTER TABLE "SampleStatusHistory" DROP CONSTRAINT "SampleStatusHistory_sampleId_fkey";

-- AlterTable
ALTER TABLE "Quote" DROP CONSTRAINT "Quote_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Quote_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "QuoteItem" DROP COLUMN "quoteId",
ADD COLUMN     "quoteId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Request" DROP CONSTRAINT "Request_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "quoteId",
ADD COLUMN     "quoteId" INTEGER,
ADD CONSTRAINT "Request_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Sample" DROP CONSTRAINT "Sample_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "requestId",
ADD COLUMN     "requestId" INTEGER NOT NULL,
ADD CONSTRAINT "Sample_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "SampleService" DROP COLUMN "sampleId",
ADD COLUMN     "sampleId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SampleStatusHistory" DROP COLUMN "sampleId",
ADD COLUMN     "sampleId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "QuoteItem_quoteId_idx" ON "QuoteItem"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "Request_quoteId_key" ON "Request"("quoteId");

-- CreateIndex
CREATE INDEX "Request_quoteId_idx" ON "Request"("quoteId");

-- CreateIndex
CREATE INDEX "Sample_requestId_idx" ON "Sample"("requestId");

-- CreateIndex
CREATE INDEX "SampleService_sampleId_idx" ON "SampleService"("sampleId");

-- CreateIndex
CREATE UNIQUE INDEX "SampleService_sampleId_serviceId_key" ON "SampleService"("sampleId", "serviceId");

-- CreateIndex
CREATE INDEX "SampleStatusHistory_sampleId_idx" ON "SampleStatusHistory"("sampleId");

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sample" ADD CONSTRAINT "Sample_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleStatusHistory" ADD CONSTRAINT "SampleStatusHistory_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleService" ADD CONSTRAINT "SampleService_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE CASCADE ON UPDATE CASCADE;
