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

module.exports = { getLabInfo };