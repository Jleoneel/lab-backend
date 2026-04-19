const { prisma } = require("../db/prisma");

// Listar reactivos
async function getReactivos(req, res, next) {
  try {
    const { q, categoria } = req.query;
    const where = {
      ...(q ? { nombre: { contains: q, mode: "insensitive" } } : {}),
      ...(categoria ? { categoria } : {}),
    };

    const reactivos = await prisma.reactivo.findMany({
      where,
      orderBy: { nombre: "asc" },
      include: {
        _count: { select: { movimientos: true } }
      }
    });
    res.json(reactivos);
  } catch (e) { next(e); }
}

// Obtener un reactivo
async function getReactivo(req, res, next) {
  try {
    const reactivo = await prisma.reactivo.findUnique({
      where: { id: req.params.id },
      include: {
        movimientos: {
          orderBy: { createdAt: "desc" },
          take: 20
        }
      }
    });
    if (!reactivo) return res.status(404).json({ message: "Reactivo no encontrado" });
    res.json(reactivo);
  } catch (e) { next(e); }
}

// Crear reactivo
async function postReactivo(req, res, next) {
  try {
    const { codigo, nombre, categoria, unidad, stockMinimo } = req.body;

    if (!codigo || !nombre || !categoria || !unidad) {
      return res.status(400).json({ message: "Campos obligatorios faltantes" });
    }

    const reactivo = await prisma.reactivo.create({
      data: {
        codigo,
        nombre,
        categoria,
        unidad,
        stockMinimo: stockMinimo ? parseFloat(stockMinimo) : 0,
        stockActual: 0,
      }
    });
    res.status(201).json(reactivo);
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(400).json({ message: "El código ya existe" });
    }
    next(e);
  }
}

// Actualizar reactivo
async function putReactivo(req, res, next) {
  try {
    const { nombre, categoria, unidad, stockMinimo, isActive } = req.body;
    const reactivo = await prisma.reactivo.update({
      where: { id: req.params.id },
      data: {
        nombre,
        categoria,
        unidad,
        stockMinimo: stockMinimo != null ? parseFloat(stockMinimo) : undefined,
        isActive: isActive != null ? isActive : undefined,
      }
    });
    res.json(reactivo);
  } catch (e) { next(e); }
}

// Registrar movimiento (ingreso o consumo)
async function postMovimiento(req, res, next) {
  try {
    const { reactivoId, tipo, razon, cantidad, sampleServiceId, observaciones } = req.body;
    const userId = req.user?.sub ?? 'system';

    if (!reactivoId || !tipo || !cantidad) {
      return res.status(400).json({ message: "Campos obligatorios faltantes" });
    }

    const cantidadNum = parseFloat(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      return res.status(400).json({ message: "Cantidad inválida" });
    }

    const reactivo = await prisma.reactivo.findUnique({ where: { id: reactivoId } });
    if (!reactivo) return res.status(404).json({ message: "Reactivo no encontrado" });

    // Verificar stock suficiente para consumo
    if (tipo === 'CONSUMO' && parseFloat(reactivo.stockActual) < cantidadNum) {
      return res.status(400).json({ message: "Stock insuficiente" });
    }

    // Calcular nuevo stock
    const nuevoStock = tipo === 'INGRESO'
      ? parseFloat(reactivo.stockActual) + cantidadNum
      : parseFloat(reactivo.stockActual) - cantidadNum;

    // Transacción: crear movimiento + actualizar stock
    const [movimiento] = await prisma.$transaction([
      prisma.movimientoReactivo.create({
        data: {
          reactivoId,
          tipo,
          razon: razon || 'ANALISIS',
          cantidad: String(cantidadNum),
          sampleServiceId: sampleServiceId || null,
          registradoPor: userId,
          observaciones: observaciones || null,
        },
        include: { reactivo: true }
      }),
      prisma.reactivo.update({
        where: { id: reactivoId },
        data: { stockActual: String(nuevoStock) }
      })
    ]);

    res.status(201).json(movimiento);
  } catch (e) { next(e); }
}

// Obtener movimientos de un reactivo
async function getMovimientos(req, res, next) {
  try {
    const movimientos = await prisma.movimientoReactivo.findMany({
      where: { reactivoId: req.params.id },
      orderBy: { createdAt: "desc" },
      include: { reactivo: true }
    });
    res.json(movimientos);
  } catch (e) { next(e); }
}

module.exports = { getReactivos, getReactivo, postReactivo, putReactivo, postMovimiento, getMovimientos };