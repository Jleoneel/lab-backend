const { prisma } = require("../db/prisma");

async function assignServicesToSample(sampleId, serviceIds) {
  const numericId =
    typeof sampleId === "string" ? parseInt(sampleId, 10) : sampleId;
  if (isNaN(numericId)) {
    const e = new Error("ID de muestra inválido");
    e.statusCode = 400;
    throw e;
  }
  const sample = await prisma.sample.findUnique({ where: { id: numericId } });
  if (!sample) {
    const e = new Error("Muestra no encontrada");
    e.statusCode = 404;
    throw e;
  }

  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds }, isActive: true },
    select: { id: true },
  });
  if (services.length !== serviceIds.length) {
    const e = new Error("Uno o más análisis no existen o están inactivos");
    e.statusCode = 400;
    throw e;
  }

  for (const serviceId of serviceIds) {
    // Contar cuántas repeticiones ya existen
    const existing = await prisma.sampleService.count({
      where: { sampleId: numericId, serviceId },
    });
    await prisma.sampleService.create({
      data: {
        sampleId: numericId,
        serviceId,
        repeticion: existing + 1,
        status: "PENDING",
      },
    });
  }

  return prisma.sampleService.findMany({
    where: { sampleId: numericId },
    include: {
      service: true,
      result: {
        include: { archivos: true }, // 👈 faltaba esto
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

async function listSampleServices(sampleId) {
  const numericId =
    typeof sampleId === "string" ? parseInt(sampleId, 10) : sampleId;
  if (isNaN(numericId)) {
    const e = new Error("ID de muestra inválido");
    e.statusCode = 400;
    throw e;
  }
  const sample = await prisma.sample.findUnique({ where: { id: numericId } });
  if (!sample) {
    const e = new Error("Muestra no encontrada");
    e.statusCode = 404;
    throw e;
  }
  return prisma.sampleService.findMany({
    where: { sampleId: numericId },
    include: {
      service: true,
      result: {
        include: { archivos: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

async function updateSampleServiceStatus(id, status) {
  // SampleService.id es UUID, NO se hace parseInt
  const ss = await prisma.sampleService.findUnique({ where: { id } });
  if (!ss) {
    const e = new Error("Análisis de muestra no encontrado");
    e.statusCode = 404;
    throw e;
  }

  const data = { status };
  if (status === "RUNNING" && !ss.startedAt) data.startedAt = new Date();
  if (status === "DONE") data.finishedAt = new Date();

  return prisma.sampleService.update({
    where: { id },
    data,
    include: {
      service: true,
      result: {
        include: { archivos: true },
      },
      sample: true,
    },
  });
}

async function upsertResult(sampleServiceId, payload, userId, files = []) {
  const ss = await prisma.sampleService.findUnique({
    where: { id: sampleServiceId },
  });
  if (!ss) {
    const e = new Error("Análisis de muestra no encontrado");
    e.statusCode = 404;
    throw e;
  }

  const data = {
    resultText: payload.resultText ?? null,
    resultNumber:
      payload.resultNumber != null && payload.resultNumber !== ""
        ? String(payload.resultNumber)
        : null,
    unit: payload.unit ?? null,
    isFinal: payload.isFinal === true || payload.isFinal === "true",
    observaciones: payload.observaciones ?? null,
    recordedBy: userId,
  };

  const result = await prisma.result.upsert({
    where: { sampleServiceId },
    create: { sampleServiceId, ...data },
    update: { ...data, recordedAt: new Date() },
  });

  // Guardar archivos si hay nuevos
  if (files.length > 0) {
    await prisma.resultFile.createMany({
      data: files.map((f) => ({
        resultId: result.id,
        filename: f.originalname,
        path: `/uploads/evidencias/sample-${ss.sampleId}/${f.filename}`,
      })),
    });
  }

  return prisma.result.findUnique({
    where: { id: result.id },
    include: { archivos: true },
  });
}

module.exports = {
  assignServicesToSample,
  listSampleServices,
  updateSampleServiceStatus,
  upsertResult,
};
