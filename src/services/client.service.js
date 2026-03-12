const { prisma } = require("../db/prisma");

async function listClients(q) {
  const where = q
    ? { name: { contains: q, mode: "insensitive" } }
    : undefined;

  return prisma.client.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {  quotes: true, requests: true }
      }
    }
  });
}

async function createClient(data) {
  return prisma.client.create({ data });
}

async function updateClient(id, data) {
  return prisma.client.update({ where: { id }, data });
}

module.exports = { listClients, createClient, updateClient };
