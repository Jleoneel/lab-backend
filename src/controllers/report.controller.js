const { prisma } = require("../db/prisma");

async function getProduccion(req, res, next) {
  try {
    const { desde, hasta } = req.query;
    const fechaDesde = desde
      ? new Date(desde + "T00:00:00-05:00")
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const fechaHasta = hasta ? new Date(hasta + "T23:59:59-05:00") : new Date();

    // Muestras por día
    const muestras = await prisma.sample.findMany({
      where: { createdAt: { gte: fechaDesde, lte: fechaHasta } },
      include: {
        request: { include: { client: true } },
        services: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Agrupar por día
    const porDia = {};
    muestras.forEach((m) => {
      const dia = m.createdAt.toISOString().split("T")[0];
      porDia[dia] = (porDia[dia] || 0) + 1;
    });

    // Solicitudes en el período
    const solicitudes = await prisma.request.findMany({
      where: { createdAt: { gte: fechaDesde, lte: fechaHasta } },
      include: { client: true },
    });

    // Cotizaciones convertidas
    const convertidas = await prisma.quote.count({
      where: {
        status: "CONVERTED",
        updatedAt: { gte: fechaDesde, lte: fechaHasta },
      },
    });

    // KPIs
    const kpis = {
      totalMuestras: muestras.length,
      totalSolicitudes: solicitudes.length,
      cotizacionesConvertidas: convertidas,
      clientesAtendidos: new Set(solicitudes.map((s) => s.clientId)).size,
      analisisCompletados: muestras.reduce(
        (acc, m) => acc + m.services.filter((s) => s.status === "DONE").length,
        0,
      ),
    };

    res.json({
      kpis,
      porDia,
      muestras: muestras.map((m) => ({
        id: m.id,
        sampleCode: m.sampleCode,
        sampleName: m.sampleName,
        status: m.status,
        cliente: m.request?.client?.name,
        createdAt: m.createdAt,
        totalAnalisis: m.services.length,
        analisisCompletados: m.services.filter((s) => s.status === "DONE")
          .length,
      })),
    });
  } catch (e) {
    next(e);
  }
}

async function getAnalistas(req, res, next) {
  try {
    const { desde, hasta } = req.query;
    const fechaDesde = desde
      ? new Date(desde + "T00:00:00-05:00")
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const fechaHasta = hasta ? new Date(hasta + "T23:59:59-05:00") : new Date();

    const analistas = await prisma.user.findMany({
      where: { role: "ANALYST", isActive: true },
      include: {
        analysesAssigned: {
          where: { createdAt: { gte: fechaDesde, lte: fechaHasta } },
        },
      },
    });

    const data = analistas.map((a) => ({
      id: a.id,
      nombre: a.fullName,
      asignados: a.analysesAssigned.length,
      completados: a.analysesAssigned.filter((s) => s.status === "DONE").length,
      enProceso: a.analysesAssigned.filter((s) => s.status === "RUNNING")
        .length,
      pendientes: a.analysesAssigned.filter((s) => s.status === "PENDING")
        .length,
      cumplimiento:
        a.analysesAssigned.length > 0
          ? Math.round(
              (a.analysesAssigned.filter((s) => s.status === "DONE").length /
                a.analysesAssigned.length) *
                100,
            )
          : 0,
    }));

    res.json(data);
  } catch (e) {
    next(e);
  }
}

async function getServicios(req, res, next) {
  try {
    const { desde, hasta } = req.query;
    const fechaDesde = desde
      ? new Date(desde + "T00:00:00-05:00")
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const fechaHasta = hasta ? new Date(hasta + "T23:59:59-05:00") : new Date();

    const servicios = await prisma.sampleService.findMany({
      where: { createdAt: { gte: fechaDesde, lte: fechaHasta } },
      include: { service: true },
    });

    // Agrupar por servicio
    const porServicio = {};
    servicios.forEach((s) => {
      const nombre = s.service?.name || "Desconocido";
      porServicio[nombre] = (porServicio[nombre] || 0) + 1;
    });

    // Top 10 ordenado
    const top = Object.entries(porServicio)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }));

    res.json(top);
  } catch (e) {
    next(e);
  }
}

async function getInventarioReport(req, res, next) {
  try {
    const { desde, hasta } = req.query;
    const fechaDesde = desde
      ? new Date(desde + "T00:00:00-05:00")
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const fechaHasta = hasta ? new Date(hasta + "T23:59:59-05:00") : new Date();

    const movimientos = await prisma.movimientoReactivo.findMany({
      where: { createdAt: { gte: fechaDesde, lte: fechaHasta } },
      include: { reactivo: true, razon: true },
      orderBy: { createdAt: "desc" },
    });

    // Resumen por reactivo
    const porReactivo = {};
    movimientos.forEach((m) => {
      const nombre = m.reactivo?.nombre || "Desconocido";
      if (!porReactivo[nombre]) {
        porReactivo[nombre] = {
          nombre,
          ingresos: 0,
          consumos: 0,
          unidad: m.reactivo?.unidad,
        };
      }
      if (m.tipo === "INGRESO")
        porReactivo[nombre].ingresos += parseFloat(m.cantidad);
      else porReactivo[nombre].consumos += parseFloat(m.cantidad);
    });

    const resumen = Object.values(porReactivo).sort(
      (a, b) => b.consumos - a.consumos,
    );

    res.json({ resumen, totalMovimientos: movimientos.length });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getProduccion,
  getAnalistas,
  getServicios,
  getInventarioReport,
};
