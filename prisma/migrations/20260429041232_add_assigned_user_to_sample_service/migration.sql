-- AlterTable
ALTER TABLE "SampleService" ADD COLUMN     "assignedToId" TEXT;

-- CreateIndex
CREATE INDEX "SampleService_assignedToId_idx" ON "SampleService"("assignedToId");

-- AddForeignKey
ALTER TABLE "SampleService" ADD CONSTRAINT "SampleService_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
