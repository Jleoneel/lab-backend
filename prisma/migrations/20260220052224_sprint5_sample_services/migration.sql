-- CreateEnum
CREATE TYPE "SampleServiceStatus" AS ENUM ('PENDING', 'RUNNING', 'DONE');

-- CreateTable
CREATE TABLE "SampleService" (
    "id" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "status" "SampleServiceStatus" NOT NULL DEFAULT 'PENDING',
    "assignedTo" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SampleService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SampleService_sampleId_idx" ON "SampleService"("sampleId");

-- CreateIndex
CREATE INDEX "SampleService_serviceId_idx" ON "SampleService"("serviceId");

-- CreateIndex
CREATE INDEX "SampleService_status_idx" ON "SampleService"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SampleService_sampleId_serviceId_key" ON "SampleService"("sampleId", "serviceId");

-- AddForeignKey
ALTER TABLE "SampleService" ADD CONSTRAINT "SampleService_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleService" ADD CONSTRAINT "SampleService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
