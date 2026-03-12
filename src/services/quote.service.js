const { prisma } = require("../db/prisma");

function to2(n) {
  return Math.round(n * 100) / 100;
}

function generateQuoteNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `COT-${y}${m}${day}-${rand}`;
}

async function createQuote({
  clientId,
  priceList,
  ivaPercent = 0,
  validUntil,
  items,
}) {
  // 1) validar cliente
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    const err = new Error("Cliente no existe");
    err.statusCode = 400;
    throw err;
  }

  // 2) traer servicios en lote
  const serviceIds = items.map((i) => i.serviceId);
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds }, isActive: true },
    select: {
      id: true,
      priceExternal: true,
      priceStudent: true,
      name: true,
      code: true,
    },
  });

  const map = new Map(services.map((s) => [s.id, s]));
  for (const it of items) {
    if (!map.has(it.serviceId)) {
      const err = new Error("Uno o más servicios no existen o están inactivos");
      err.statusCode = 400;
      throw err;
    }
  }

  const ivaPct = Number(ivaPercent ?? 0);
  if (Number.isNaN(ivaPct) || ivaPct < 0 || ivaPct > 100) {
    const err = new Error("ivaPercent inválido (0-100)");
    err.statusCode = 400;
    throw err;
  }

  // 3) calcular totales en centavos
  let subtotal = 0;
  const computedItems = items.map((it) => {
    const s = map.get(it.serviceId);
    const unit =
      priceList === "ESTUDIANTE"
        ? Number(s.priceStudent)
        : Number(s.priceExternal);
    const line = unit * it.quantity;
    subtotal += line;
    return {
      serviceId: it.serviceId,
      quantity: it.quantity,
      unitPriceApplied: to2(unit),
      lineSubtotal: to2(line),
    };
  });

  subtotal = to2(subtotal);
  const ivaAmount = to2(subtotal * (ivaPct / 100));
  const total = to2(subtotal + ivaAmount);

  // 4) guardar transacción
  const quoteNumber = generateQuoteNumber();

  const created = await prisma.quote.create({
    data: {
      quoteNumber,
      clientId,
      priceList,
      ivaPercent: String(to2(ivaPct)),
      subtotal: String(subtotal),
      ivaAmount: String(ivaAmount),
      total: String(total),
      validUntil: validUntil ? new Date(validUntil) : null,
      items: {
        create: computedItems.map((ci) => ({
          serviceId: ci.serviceId,
          quantity: ci.quantity,
          unitPriceApplied: String(ci.unitPriceApplied),
          lineSubtotal: String(ci.lineSubtotal),
        })),
      },
    },
    include: {
      client: true,
      items: { include: { service: true } },
    },
  });

  return created;
}

async function getQuoteById(id) {
  const numericId = typeof id === "string" ? parseInt(id, 10) : id;

  if (isNaN(numericId)) {
    throw new Error("ID inválido");
  }

  return prisma.quote.findUnique({
    where: { id: numericId },
    include: {
      client: true,
      items: {
        include: { service: true },
      },
    },
  });
}

async function listQuotes({ q, take = 20 }) {
  return prisma.quote.findMany({
    where: q
      ? { quoteNumber: { contains: q, mode: "insensitive" } }
      : undefined,
    orderBy: { createdAt: "desc" },
    take,
    include: { client: true },
  });
}

async function updateQuote(id, { clientId, priceList, ivaPercent, validUntil, items }) {
  const numericId = parseInt(id, 10);
  
  const quote = await prisma.quote.findUnique({ where: { id: numericId } });
  if (!quote) {
    const err = new Error("Cotización no encontrada");
    err.statusCode = 404;
    throw err;
  }
  if (quote.status !== 'DRAFT') {
    const err = new Error("Solo se pueden editar cotizaciones en borrador");
    err.statusCode = 400;
    throw err;
  }

  const serviceIds = items.map(i => i.serviceId);
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds }, isActive: true },
    select: { id: true, priceExternal: true, priceStudent: true }
  });
  const map = new Map(services.map(s => [s.id, s]));

  const ivaPct = Number(ivaPercent ?? 0);
  let subtotal = 0;
  const computedItems = items.map(it => {
    const s = map.get(it.serviceId);
    const unit = priceList === 'ESTUDIANTE' ? Number(s.priceStudent) : Number(s.priceExternal);
    const line = unit * it.quantity;
    subtotal += line;
    return {
      serviceId: it.serviceId,
      quantity: it.quantity,
      unitPriceApplied: to2(unit),
      lineSubtotal: to2(line),
    };
  });

  subtotal = to2(subtotal);
  const ivaAmount = to2(subtotal * (ivaPct / 100));
  const total = to2(subtotal + ivaAmount);

  return prisma.quote.update({
    where: { id: numericId },
    data: {
      clientId,
      priceList,
      ivaPercent: String(to2(ivaPct)),
      subtotal: String(subtotal),
      ivaAmount: String(ivaAmount),
      total: String(total),
      validUntil: validUntil ? new Date(validUntil) : null,
      items: {
        deleteMany: {},  // eliminar items anteriores
        create: computedItems.map(ci => ({
          serviceId: ci.serviceId,
          quantity: ci.quantity,
          unitPriceApplied: String(ci.unitPriceApplied),
          lineSubtotal: String(ci.lineSubtotal),
        }))
      }
    },
    include: { client: true, items: { include: { service: true } } }
  });
}

module.exports = { createQuote, getQuoteById, listQuotes, updateQuote };

