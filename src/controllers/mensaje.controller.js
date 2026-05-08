const { prisma } = require("../db/prisma");

async function getMensajes(req, res, next) {
  try {
    const userId = req.user?.sub;
    const mensajes = await prisma.mensaje.findMany({
      where: { toId: userId },
      include: { from: { select: { id: true, fullName: true, role: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(mensajes);
  } catch (e) { next(e); }
}

async function postMensaje(req, res, next) {
  try {
    const fromId = req.user?.sub;
    const { toId, contenido } = req.body;

    if (!toId || !contenido?.trim()) {
      return res.status(400).json({ message: 'Destinatario y contenido son obligatorios' });
    }

    const destinatario = await prisma.user.findUnique({ where: { id: toId } });
    if (!destinatario) return res.status(404).json({ message: 'Usuario no encontrado' });

    const mensaje = await prisma.mensaje.create({
      data: { fromId, toId, contenido: contenido.trim() },
      include: { from: { select: { id: true, fullName: true, role: true } } }
    });
    res.status(201).json(mensaje);
  } catch (e) { next(e); }
}

async function marcarLeido(req, res, next) {
  try {
    const userId = req.user?.sub;
    const { id } = req.params;

    const mensaje = await prisma.mensaje.findUnique({ where: { id } });
    if (!mensaje) return res.status(404).json({ message: 'Mensaje no encontrado' });
    if (mensaje.toId !== userId) return res.status(403).json({ message: 'No autorizado' });

    const updated = await prisma.mensaje.update({
      where: { id },
      data: { leido: true }
    });
    res.json(updated);
  } catch (e) { next(e); }
}

async function marcarTodosLeidos(req, res, next) {
  try {
    const userId = req.user?.sub;
    await prisma.mensaje.updateMany({
      where: { toId: userId, leido: false },
      data: { leido: true }
    });
    res.json({ message: 'Todos marcados como leídos' });
  } catch (e) { next(e); }
}

module.exports = { getMensajes, postMensaje, marcarLeido, marcarTodosLeidos };