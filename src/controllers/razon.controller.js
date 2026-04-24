const { prisma } = require("../db/prisma");

async function getRazones(req, res, next) {
  try {
    const razones = await prisma.razonConsumo.findMany({
      where: { isActive: true },
      orderBy: { nombre: 'asc' }
    });
    res.json(razones);
  } catch (e) { next(e); }
}

async function postRazon(req, res, next) {
  try {
    const { nombre } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ message: 'Nombre requerido' });

    const razon = await prisma.razonConsumo.create({
      data: { nombre: nombre.trim() }
    });
    res.status(201).json(razon);
  } catch (e) {
    if (e.code === 'P2002') return res.status(400).json({ message: 'Ya existe esa razón' });
    next(e);
  }
}

async function putRazon(req, res, next) {
  try {
    const { nombre, isActive } = req.body;
    const razon = await prisma.razonConsumo.update({
      where: { id: req.params.id },
      data: {
        ...(nombre ? { nombre: nombre.trim() } : {}),
        ...(isActive != null ? { isActive } : {})
      }
    });
    res.json(razon);
  } catch (e) { next(e); }
}

async function deleteRazon(req, res, next) {
  try {
    // Soft delete
    await prisma.razonConsumo.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });
    res.json({ message: 'Razón eliminada' });
  } catch (e) { next(e); }
}

module.exports = { getRazones, postRazon, putRazon, deleteRazon };