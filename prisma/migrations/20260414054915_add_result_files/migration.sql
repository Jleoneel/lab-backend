/*
  Warnings:

  - You are about to drop the column `archivoEvidencia` on the `Result` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Result" DROP COLUMN "archivoEvidencia";

-- CreateTable
CREATE TABLE "ResultFile" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResultFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ResultFile" ADD CONSTRAINT "ResultFile_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE CASCADE ON UPDATE CASCADE;
