-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "sampleServiceId" TEXT NOT NULL,
    "resultText" TEXT,
    "resultNumber" DECIMAL(65,30),
    "unit" TEXT,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "recordedBy" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Result_sampleServiceId_key" ON "Result"("sampleServiceId");

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_sampleServiceId_fkey" FOREIGN KEY ("sampleServiceId") REFERENCES "SampleService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
