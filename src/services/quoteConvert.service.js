const { prisma } = require("../db/prisma");

function nextRequestNumber() {
  // Simple por ahora. Si ya tienes correlativo real, reemplázalo.
  return `REQ-${Date.now()}`;
}

// Reemplaza la función nextSampleCode actual
async function generateSampleCode(tx) {
  const year = new Date().getFullYear();
  const prefix = `UTM-LAB-${year}-`;

  // Buscar el último código de este año
  const last = await tx.sample.findFirst({
    where: { sampleCode: { startsWith: prefix } },
    orderBy: { sampleCode: "desc" },
    select: { sampleCode: true },
  });

  let nextNumber = 1;
  if (last) {
    const lastNumber = parseInt(last.sampleCode.replace(prefix, ""), 10);
    if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(4, "0")}`;
}

async function convertQuoteToRequest(quoteId, { samples }, userId) {
  const numericId =
    typeof quoteId === "string" ? parseInt(quoteId, 10) : quoteId;
  if (isNaN(numericId)) {
    const err = new Error("ID de cotización inválido");
    err.statusCode = 400;
    throw err;
  }

  // Reemplaza la validación anterior de samples
  if (!Array.isArray(samples) || samples.length === 0) {
    const err = new Error("Debes enviar al menos 1 muestra.");
    err.statusCode = 400;
    throw err;
  }

  // Validar que cada muestra tenga serviceIds
  const invalidSamples = samples.filter(
    (s) => !Array.isArray(s.serviceIds) || s.serviceIds.length === 0,
  );
  if (invalidSamples.length > 0) {
    const err = new Error(
      "Cada muestra debe tener al menos un análisis asignado.",
    );
    err.statusCode = 400;
    throw err;
  }

  return prisma.$transaction(async (tx) => {
    // 1) Traer cotización + items (usando numericId)
    const quote = await tx.quote.findUnique({
      where: { id: numericId },
      include: {
        items: {
          include: { service: true }, // 👈 agregar esto
        },
      },
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
      const err = new Error(
        "No puedes convertir una cotización sin análisis (items).",
      );
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
    // Validar que no se excedan las cantidades cotizadas
    const serviceCount = {};
    for (const sample of samples) {
      for (const serviceId of sample.serviceIds) {
        serviceCount[serviceId] = (serviceCount[serviceId] || 0) + 1;
      }
    }

    for (const item of quote.items) {
      const usado = serviceCount[item.serviceId] || 0;
      if (usado > item.quantity) {
        const err = new Error(
          `El análisis "${item.service?.name || item.serviceId}" fue asignado ${usado} veces pero la cotización solo contempla ${item.quantity}.`,
        );
        err.statusCode = 400;
        throw err;
      }
    }

    // 3) Crear Samples (Muestras)
    const createdSamples = [];
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      const sampleCode = await generateSampleCode(tx); // 👈 async ahora
      const created = await tx.sample.create({
        data: {
          requestId: request.id,
          sampleCode,
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
    // ✅ DESPUÉS — cada muestra recibe sus propios análisis
    for (let i = 0; i < samples.length; i++) {
      const sampleData = samples[i];
      const createdSample = createdSamples[i];

      // Validar que los serviceIds enviados pertenecen a la cotización
      const validServiceIds = quote.items.map((item) => item.serviceId);
      const serviceIdsToAssign = sampleData.serviceIds?.filter((id) =>
        validServiceIds.includes(id),
      );

      if (!serviceIdsToAssign || serviceIdsToAssign.length === 0) {
        const err = new Error(
          `La muestra "${sampleData.sampleName}" debe tener al menos un análisis asignado.`,
        );
        err.statusCode = 400;
        throw err;
      }

      for (const serviceId of serviceIdsToAssign) {
        await tx.sampleService.create({
          data: {
            sampleId: createdSample.id,
            serviceId,
            status: "PENDING",
            assignedTo: null,
          },
        });
      }
    }

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
