const { prisma } = require("../db/prisma");

async function getLabInfo(req, res, next) {
  try {
    const responsible = await prisma.user.findFirst({
      where: { role: 'ADMIN', isActive: true },
      select: { fullName: true, email: true }
    });

    res.json({
      labName: 'Laboratorio CABA - FCZ UTM',
      responsible: responsible?.fullName || 'Responsable del Laboratorio',
      responsibleEmail: responsible?.email || ''
    });
  } catch (e) {
    next(e);
  }
}

async function getIva(req, res, next) {
  try {
    let config = await prisma.configuracionSistema.findUnique({
      where: { clave: 'iva_percent' }
    });

    // Si no existe, crearlo con 15% por defecto (IVA Ecuador 2024)
    if (!config) {
      config = await prisma.configuracionSistema.create({
        data: { clave: 'iva_percent', valor: '15' }
      });
    }

    res.json({ iva: parseFloat(config.valor) });
  } catch (e) {
    next(e);
  }
}

async function updateIva(req, res, next) {
  try {
    const { iva } = req.body;
    const ivaNum = parseFloat(iva);

    if (isNaN(ivaNum) || ivaNum < 0 || ivaNum > 100) {
      return res.status(400).json({ message: 'IVA inválido (0-100)' });
    }

    const config = await prisma.configuracionSistema.upsert({
      where: { clave: 'iva_percent' },
      update: { valor: String(ivaNum) },
      create: { clave: 'iva_percent', valor: String(ivaNum) }
    });

    res.json({ iva: parseFloat(config.valor) });
  } catch (e) {
    next(e);
  }
}

module.exports = { getLabInfo, getIva, updateIva };
