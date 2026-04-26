const { prisma } = require("../db/prisma");

async function getEquipos(req, res, next) {
  try {
    const { q, estado } = req.query;
    const where = {
      ...(q ? {
        OR: [
          { nombre: { contains: q, mode: "insensitive" } },
          { codigoInventario: { contains: q, mode: "insensitive" } },
          { marca: { contains: q, mode: "insensitive" } },
        ]
      } : {}),
      ...(estado ? { estado } : {}),
    };

    const equipos = await prisma.equipo.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });
    res.json(equipos);
  } catch (e) { next(e); }
}

async function getEquipo(req, res, next) {
  try {
    const equipo = await prisma.equipo.findUnique({
      where: { id: req.params.id }
    });
    if (!equipo) return res.status(404).json({ message: "Equipo no encontrado" });
    res.json(equipo);
  } catch (e) { next(e); }
}

async function postEquipo(req, res, next) {
  try {
    const {
      nombre, modelo, marca, serie, codigoInventario,
      ubicacion, fechaAdquisicion, fechaMantenimiento,
      fechaCalibracion, estado
    } = req.body;

    if (!nombre || !codigoInventario) {
      return res.status(400).json({ message: "Nombre y código de inventario son obligatorios" });
    }

    const equipo = await prisma.equipo.create({
      data: {
        nombre,
        modelo: modelo || null,
        marca: marca || null,
        serie: serie || null,
        codigoInventario,
        ubicacion: ubicacion || null,
        fechaAdquisicion: fechaAdquisicion ? new Date(fechaAdquisicion) : null,
        fechaMantenimiento: fechaMantenimiento ? new Date(fechaMantenimiento) : null,
        fechaCalibracion: fechaCalibracion ? new Date(fechaCalibracion) : null,
        estado: estado || 'ACTIVO'
      }
    });
    res.status(201).json(equipo);
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(400).json({ message: "El código de inventario o serie ya existe" });
    }
    next(e);
  }
}

async function putEquipo(req, res, next) {
  try {
    const {
      nombre, modelo, marca, serie, codigoInventario,
      ubicacion, fechaAdquisicion, fechaMantenimiento,
      fechaCalibracion, estado
    } = req.body;

    const equipo = await prisma.equipo.update({
      where: { id: req.params.id },
      data: {
        ...(nombre ? { nombre } : {}),
        ...(modelo !== undefined ? { modelo } : {}),
        ...(marca !== undefined ? { marca } : {}),
        ...(serie !== undefined ? { serie } : {}),
        ...(codigoInventario ? { codigoInventario } : {}),
        ...(ubicacion !== undefined ? { ubicacion } : {}),
        ...(fechaAdquisicion !== undefined ? { fechaAdquisicion: fechaAdquisicion ? new Date(fechaAdquisicion) : null } : {}),
        ...(fechaMantenimiento !== undefined ? { fechaMantenimiento: fechaMantenimiento ? new Date(fechaMantenimiento) : null } : {}),
        ...(fechaCalibracion !== undefined ? { fechaCalibracion: fechaCalibracion ? new Date(fechaCalibracion) : null } : {}),
        ...(estado ? { estado } : {}),
      }
    });
    res.json(equipo);
  } catch (e) { next(e); }
}

module.exports = { getEquipos, getEquipo, postEquipo, putEquipo };