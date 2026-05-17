const { prisma } = require('../db/prisma');

async function getAll(req, res, next) {
  try {
    const data = await prisma.categoriaReactivo.findMany({
      orderBy: { nombre: 'asc' }
    });
    res.json(data);
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const { nombre } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ message: 'Nombre requerido' });
    const data = await prisma.categoriaReactivo.create({
      data: { nombre: nombre.trim() }
    });
    res.status(201).json(data);
  } catch (e) {
    if (e.code === 'P2002') return res.status(400).json({ message: 'Ya existe esa categoría' });
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const { nombre, activo } = req.body;
    const data = await prisma.categoriaReactivo.update({
      where: { id: req.params.id },
      data: {
        ...(nombre && { nombre: nombre.trim() }),
        ...(activo !== undefined && { activo })
      }
    });
    res.json(data);
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    const count = await prisma.reactivo.count({ where: { categoriaId: req.params.id } });
    if (count > 0) return res.status(400).json({ message: `No se puede eliminar — tiene ${count} reactivo(s) asignado(s)` });
    await prisma.categoriaReactivo.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
}

module.exports = { getAll, create, update, remove };