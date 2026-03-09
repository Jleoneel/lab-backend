const { prisma } = require("../db/prisma");

function computeSampleStatusFromAnalyses(analysisStatuses) {
  if (analysisStatuses.length === 0) return null;

  const hasRunning = analysisStatuses.some((s) => s === "RUNNING");
  const allDone = analysisStatuses.every((s) => s === "DONE");

  if (allDone) return "LISTO_PARA_INFORME";
  if (hasRunning) return "EN_PROCESO";
  return "EN_COLA";
}

/**
 * Recalcula Sample.status basado en SampleService.status.
 * - No cambia si Sample está TERMINADO.
 * - Escribe historial si cambia el estado.
 */
async function recalcAndUpdateSampleStatus(sampleId, changedByUserId) {
  return prisma.$transaction(async (tx) => {
    const sample = await tx.sample.findUnique({
      where: { id: sampleId },
      select: { id: true, status: true },
    });

    if (!sample) return null;

    // No tocar automáticamente una muestra cerrada
    if (sample.status === "TERMINADO") return { sample, changed: false };

    const analyses = await tx.sampleService.findMany({
      where: { sampleId },
      select: { status: true },
    });

    const nextStatus = computeSampleStatusFromAnalyses(
      analyses.map((a) => a.status),
    );
    if (!nextStatus) return { sample, changed: false };

    // Si no cambió, no hacemos nada
    if (nextStatus === sample.status) return { sample, changed: false };

    // Actualiza Sample
    const updated = await tx.sample.update({
      where: { id: sampleId },
      data: { status: nextStatus },
    });

    // Historial (ajusta nombres de campos según tu modelo real)
    await tx.sampleStatusHistory.create({
      data: {
        sampleId,
        fromStatus: sample.status,
        toStatus: nextStatus,
        note: "Auto: estado recalculado por avance de análisis",
        changedBy: changedByUserId,
      },
    });

    // Después de actualizar Sample y escribir historial...

    // Si la muestra quedó TERMINADO, verificar si el Request está completo
    if (nextStatus === "TERMINADO" || sample.status === "TERMINADO") {
      const fullSample = await tx.sample.findUnique({
        where: { id: sampleId },
        select: { requestId: true },
      });

      const pendingSamples = await tx.sample.count({
        where: {
          requestId: fullSample.requestId,
          status: { not: "TERMINADO" },
        },
      });

      if (pendingSamples === 0) {
        await tx.request.update({
          where: { id: fullSample.requestId },
          data: { status: "DONE" },
        });
      }
    }

    return { sample: updated, changed: true };
  });
}

module.exports = { recalcAndUpdateSampleStatus };
