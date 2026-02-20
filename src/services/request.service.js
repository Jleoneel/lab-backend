const { prisma } = require("../db/prisma");

function pad(n, len = 4) {
  return String(n).padStart(len, "0");
}

function ymd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

async function nextRequestNumber() {
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `RQ-${ymd()}-${rand}`;
}

async function generateSampleCode(requestNumber, index) {
  return `${requestNumber}-S${pad(index, 2)}`;
}

async function createRequest({ clientId, quoteId = null, samples = [] }, userId) {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    const err = new Error("Cliente no existe");
    err.statusCode = 400;
    throw err;
  }

  if (quoteId) {
    const q = await prisma.quote.findUnique({ where: { id: quoteId } });
    if (!q) {
      const err = new Error("Cotización no existe");
      err.statusCode = 400;
      throw err;
    }
  }

  if (!samples.length) {
    const err = new Error("Debes registrar al menos 1 muestra");
    err.statusCode = 400;
    throw err;
  }

  const requestNumber = await nextRequestNumber();

  // Crear Request + Samples + Historial inicial EN_COLA
  const created = await prisma.request.create({
    data: {
      requestNumber,
      clientId,
      quoteId,
      status: "OPEN",
      samples: {
        create: samples.map((s, idx) => ({
          sampleCode: `${requestNumber}-S${pad(idx + 1, 2)}`,
          sampleName: s.sampleName ?? null,
          description: s.description ?? null,
          status: "EN_COLA",
          history: {
            create: [{
              fromStatus: null,
              toStatus: "EN_COLA",
              changedBy: userId,
              note: "Recepción de muestra"
            }]
          }
        })),
      },
    },
    include: { client: true, samples: { include: { history: true } } },
  });

  return created;
}

async function listSamplesByStatus(status) {
  return prisma.sample.findMany({
    where: status ? { status } : undefined,
    orderBy: { receivedAt: "desc" },
    include: {
      request: { include: { client: true } },
    },
  });
}

async function getSampleById(id) {
  return prisma.sample.findUnique({
    where: { id },
    include: {
      request: { include: { client: true } },
      history: { orderBy: { changedAt: "desc" } },
    },
  });
}

async function changeSampleStatus(sampleId, toStatus, userId, note) {
  const sample = await prisma.sample.findUnique({ where: { id: sampleId } });
  if (!sample) {
    const err = new Error("Muestra no encontrada");
    err.statusCode = 404;
    throw err;
  }

  // Reglas simples de transición (puedes endurecer luego)
  const allowed = {
    EN_COLA: ["EN_PROCESO"],
    EN_PROCESO: ["LISTO_PARA_INFORME", "EN_COLA"],
    LISTO_PARA_INFORME: ["TERMINADO", "EN_PROCESO"],
    TERMINADO: [],
  };

  if (!allowed[sample.status].includes(toStatus)) {
    const err = new Error(`Transición inválida: ${sample.status} → ${toStatus}`);
    err.statusCode = 400;
    throw err;
  }

  if (toStatus === "LISTO_PARA_INFORME") {
  const total = await prisma.sampleService.count({ where: { sampleId } });
  if (total === 0) {
    const err = new Error("No puedes pasar a LISTO_PARA_INFORME sin análisis asignados");
    err.statusCode = 400;
    throw err;
  }

  const pending = await prisma.sampleService.count({
    where: { sampleId, status: { not: "DONE" } },
  });

  if (pending > 0) {
    const err = new Error("No puedes pasar a LISTO_PARA_INFORME: hay análisis pendientes");
    err.statusCode = 400;
    throw err;
  }
}

  const updated = await prisma.sample.update({
    where: { id: sampleId },
    data: {
      status: toStatus,
      history: {
        create: [{
          fromStatus: sample.status,
          toStatus,
          changedBy: userId,
          note: note ?? null,
        }],
      },
    },
    include: {
      request: { include: { client: true } },
      history: { orderBy: { changedAt: "desc" } },
    },
  });

  return updated;
}

module.exports = {
  createRequest,
  listSamplesByStatus,
  getSampleById,
  changeSampleStatus,
};
