const { prisma } = require("../db/prisma");

function nextRequestNumber() {
  // Simple por ahora. Si ya tienes correlativo real, reemplázalo.
  return `REQ-${Date.now()}`;
}

function nextSampleCode(index) {
  // Simple por ahora. Si ya tienes QR/código real, reemplázalo.
  return `S-${Date.now()}-${index + 1}`;
}

async function convertQuoteToRequest(quoteId, { samples }, userId) {
   const numericId = typeof quoteId === 'string' ? parseInt(quoteId, 10) : quoteId;
  if (isNaN(numericId)) {
    const err = new Error("ID de cotización inválido");
    err.statusCode = 400;
    throw err;
  }

  if (!Array.isArray(samples) || samples.length === 0) {
    const err = new Error("Debes enviar al menos 1 muestra para convertir la cotización.");
    err.statusCode = 400;
    throw err;
  }

  return prisma.$transaction(async (tx) => {
    // 1) Traer cotización + items (usando numericId)
    const quote = await tx.quote.findUnique({
      where: { id: numericId },
      include: { items: true },
    });

    if (!quote) {
      const err = new Error("Cotización no encontrada.");
      err.statusCode = 404;
      throw err;
    }

    // Evitar doble conversión
    if (quote.status === "CONVERTED") {
  const err = new Error("Esta cotización ya fue convertida.");
  err.statusCode = 409;
  throw err;
}

    if (!quote.items || quote.items.length === 0) {
      const err = new Error("No puedes convertir una cotización sin análisis (items).");
      err.statusCode = 400;
      throw err;
    }

    // 2) Crear Request (Solicitud)
    const request = await tx.request.create({
      data: {
        requestNumber: nextRequestNumber(),
        clientId: quote.clientId,
        quoteId: quote.id,
        status: "OPEN", // ajusta a tu enum real si es distinto
      },
    });

    // 3) Crear Samples (Muestras)
    const createdSamples = [];
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      const created = await tx.sample.create({
        data: {
          requestId: request.id,
          sampleCode: nextSampleCode(i),
          sampleName: s.sampleName || `Muestra ${i + 1}`,
          description: s.description || null,
          receivedAt: new Date(),
          status: "EN_COLA",
        },
      });
      createdSamples.push(created);
    }

    // 4) Copiar QuoteItems → SampleService para cada muestra
    // (cada muestra hereda los análisis cotizados)
    for (const sample of createdSamples) {
      for (const item of quote.items) {
        await tx.sampleService.create({
          data: {
            sampleId: sample.id,
            serviceId: item.serviceId,
            status: "PENDING",
            assignedTo: null,
          },
        });
      }
    }

    // 5) Marcar cotización como convertida
    // 5) Marcar cotización como convertida
await tx.quote.update({
  where: { id: quote.id },
  data: {
    status: "CONVERTED", // Cambiar de "CONVERTIDA" a "CONVERTED"
    updatedAt: new Date(),
  },
});

    // (Opcional) auditoría/bitácora del usuario que convirtió:
    // aquí no tienes tabla de audit para Quote, así que lo dejamos.

    return {
      requestId: request.id,
      sampleIds: createdSamples.map((s) => s.id),
    };
  });
}

module.exports = { convertQuoteToRequest };