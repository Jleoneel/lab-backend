const { prisma } = require("../db/prisma");

async function getSamplePublic(req, res, next) {
  try {
    const { sampleCode } = req.params;

    const sample = await prisma.sample.findUnique({
      where: { sampleCode },
      include: {
        request: {
          include: {
            client: {
              select: { name: true, city: true }
            }
          }
        },
        services: {
          include: {
            service: { select: { name: true, code: true } }
          }
        }
      }
    });

    if (!sample) return res.status(404).json({ message: 'Muestra no encontrada' });

    // Calcular progreso
    const total = sample.services.length;
    const completados = sample.services.filter(s => s.status === 'DONE').length;
    const progreso = total > 0 ? Math.round((completados / total) * 100) : 0;

    // Solo info pública
    res.json({
      sampleCode: sample.sampleCode,
      sampleName: sample.sampleName,
      status: sample.status,
      receivedAt: sample.receivedAt,
      cliente: sample.request?.client?.name,
      ciudad: sample.request?.client?.city,
      progreso,
      totalAnalisis: total,
      analisisCompletados: completados,
      servicios: sample.services.map(s => ({
        id: s.id,
        nombre: s.service?.name,
        codigo: s.service?.code,
        status: s.status,
        repeticion: s.repeticion
      }))
    });
  } catch (e) { next(e); }
}

module.exports = { getSamplePublic };