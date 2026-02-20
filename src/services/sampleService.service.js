const { prisma } = require("../db/prisma");

async function assignServicesToSample(sampleId, serviceIds) {
  const sample = await prisma.sample.findUnique({ where: { id: sampleId } });
  if (!sample) { const e = new Error("Muestra no encontrada"); e.statusCode = 404; throw e; }

  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds }, isActive: true },
    select: { id: true },
  });
  if (services.length !== serviceIds.length) {
    const e = new Error("Uno o más análisis no existen o están inactivos");
    e.statusCode = 400; throw e;
  }

  await prisma.sampleService.createMany({
    data: serviceIds.map(serviceId => ({
      sampleId,
      serviceId,
      status: "PENDING",
    })),
    skipDuplicates: true,
  });

  return prisma.sampleService.findMany({
    where: { sampleId },
    include: { service: true, result: true },
    orderBy: { createdAt: "asc" },
  });
}

async function listSampleServices(sampleId) {
  const sample = await prisma.sample.findUnique({ where: { id: sampleId } });
  if (!sample) { const e = new Error("Muestra no encontrada"); e.statusCode = 404; throw e; }

  return prisma.sampleService.findMany({
    where: { sampleId },
    include: { service: true, result: true },
    orderBy: { createdAt: "asc" },
  });
}

async function updateSampleServiceStatus(id, status) {
  const ss = await prisma.sampleService.findUnique({ where: { id } });
  if (!ss) { const e = new Error("Análisis de muestra no encontrado"); e.statusCode = 404; throw e; }

  const data = { status };
  if (status === "RUNNING" && !ss.startedAt) data.startedAt = new Date();
  if (status === "DONE") data.finishedAt = new Date();

  return prisma.sampleService.update({
    where: { id },
    data,
    include: { service: true, result: true, sample: true },
  });
}

async function upsertResult(sampleServiceId, payload, userId) {
  const ss = await prisma.sampleService.findUnique({ where: { id: sampleServiceId } });
  if (!ss) { const e = new Error("Análisis de muestra no encontrado"); e.statusCode = 404; throw e; }

  const data = {
    resultText: payload.resultText ?? null,
    resultNumber: payload.resultNumber != null ? String(payload.resultNumber) : null,
    unit: payload.unit ?? null,
    isFinal: payload.isFinal ?? false,
    recordedBy: userId,
  };

  // upsert por unique(sampleServiceId)
  return prisma.result.upsert({
    where: { sampleServiceId },
    create: { sampleServiceId, ...data },
    update: { ...data, recordedAt: new Date() },
  });
}

module.exports = {
  assignServicesToSample,
  listSampleServices,
  updateSampleServiceStatus,
  upsertResult,
};