const { prisma } = require("../db/prisma");

// Categorías
async function getCategorias(req, res, next) {
  try {
    const categorias = await prisma.categoriaDocumento.findMany({
      orderBy: { orden: 'asc' },
      include: {
        enlaces: { orderBy: { orden: 'asc' } }
      }
    });
    res.json(categorias);
  } catch (e) { next(e); }
}

async function postCategoria(req, res, next) {
  try {
    const { nombre, orden } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ message: 'Nombre requerido' });
    const categoria = await prisma.categoriaDocumento.create({
      data: { nombre: nombre.trim(), orden: orden || 0 }
    });
    res.status(201).json(categoria);
  } catch (e) { next(e); }
}

async function putCategoria(req, res, next) {
  try {
    const { nombre, orden } = req.body;
    const categoria = await prisma.categoriaDocumento.update({
      where: { id: req.params.id },
      data: {
        ...(nombre ? { nombre: nombre.trim() } : {}),
        ...(orden != null ? { orden } : {})
      }
    });
    res.json(categoria);
  } catch (e) { next(e); }
}

async function deleteCategoria(req, res, next) {
  try {
    await prisma.categoriaDocumento.delete({ where: { id: req.params.id } });
    res.json({ message: 'Categoría eliminada' });
  } catch (e) { next(e); }
}

// Enlaces
async function postEnlace(req, res, next) {
  try {
    const { titulo, url, descripcion, categoriaId, orden } = req.body;
    if (!titulo?.trim() || !url?.trim() || !categoriaId) {
      return res.status(400).json({ message: 'Título, URL y categoría son obligatorios' });
    }
    const enlace = await prisma.enlaceDocumento.create({
      data: {
        titulo: titulo.trim(),
        url: url.trim(),
        descripcion: descripcion || null,
        categoriaId,
        orden: orden || 0
      }
    });
    res.status(201).json(enlace);
  } catch (e) { next(e); }
}

async function putEnlace(req, res, next) {
  try {
    const { titulo, url, descripcion, orden } = req.body;
    const enlace = await prisma.enlaceDocumento.update({
      where: { id: req.params.id },
      data: {
        ...(titulo ? { titulo: titulo.trim() } : {}),
        ...(url ? { url: url.trim() } : {}),
        ...(descripcion !== undefined ? { descripcion } : {}),
        ...(orden != null ? { orden } : {})
      }
    });
    res.json(enlace);
  } catch (e) { next(e); }
}

async function deleteEnlace(req, res, next) {
  try {
    await prisma.enlaceDocumento.delete({ where: { id: req.params.id } });
    res.json({ message: 'Enlace eliminado' });
  } catch (e) { next(e); }
}

module.exports = { getCategorias, postCategoria, putCategoria, deleteCategoria, postEnlace, putEnlace, deleteEnlace };