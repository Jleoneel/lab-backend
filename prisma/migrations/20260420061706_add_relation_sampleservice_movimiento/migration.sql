-- AddForeignKey
ALTER TABLE "MovimientoReactivo" ADD CONSTRAINT "MovimientoReactivo_sampleServiceId_fkey" FOREIGN KEY ("sampleServiceId") REFERENCES "SampleService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
