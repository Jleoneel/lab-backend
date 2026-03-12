const { prisma } = require("../db/prisma");

async function listServices(q) {
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { code: { contains: q, mode: "insensitive" } },
        ],
      }
    : undefined;

  return prisma.service.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { quoteItems: true, sampleLinks: true} 
      }
    }
  });
}

async function createService(data) {
  const payload = {
    ...data,
    priceExternal: String(data.priceExternal),
    priceStudent: String(data.priceStudent),
  };
  return prisma.service.create({ data: payload });
}

async function updateService(id, data) {
  const payload = { ...data };
  if (payload.priceExternal != null) payload.priceExternal = String(payload.priceExternal);
  if (payload.priceStudent != null) payload.priceStudent = String(payload.priceStudent);

  return prisma.service.update({ where: { id }, data: payload });
}

module.exports = { listServices, createService, updateService };
