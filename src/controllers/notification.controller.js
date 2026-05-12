const { prisma } = require("../db/prisma");

async function streamNotifications(req, res) {
  const userId = req.user?.sub;
  const role = req.user?.role;

  // Headers SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  const sendNotifications = async () => {
    try {
      let notifications = [];

      if (role === "ANALYST") {
        // Análisis pendientes asignados al analista
        const pendientes = await prisma.sampleService.findMany({
          where: { assignedToId: userId, status: "PENDING" },
          include: {
            service: true,
            sample: { include: { request: { include: { client: true } } } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        });

        notifications = pendientes.map((a) => ({
          id: a.id,
          tipo: "ANALISIS_PENDIENTE",
          titulo: "Análisis pendiente",
          mensaje: `${a.service?.name} — ${a.sample?.sampleCode}`,
          cliente: a.sample?.request?.client?.name,
          fecha: a.createdAt,
        }));
      } else if (role === "ADMIN") {
        const hoy = new Date();
        const en15dias = new Date(hoy.getTime() + 15 * 24 * 60 * 60 * 1000);

        // Calibraciones próximas y vencidas
        const equipos = await prisma.equipo.findMany({
          where: { fechaCalibracion: { lte: en15dias } },
        });

        const notifEquipos = equipos
          .filter((e) => e.fechaCalibracion)
          .map((e) => {
            const dias = Math.ceil(
              (new Date(e.fechaCalibracion) - hoy) / (1000 * 60 * 60 * 24),
            );
            return {
              id: `equipo-${e.id}`,
              tipo: dias < 0 ? "CALIBRACION_VENCIDA" : "CALIBRACION_PROXIMA",
              titulo: dias < 0 ? "Calibración vencida" : "Calibración próxima",
              mensaje: `${e.nombre} — ${dias < 0 ? `venció hace ${Math.abs(dias)} día(s)` : `vence en ${dias} día(s)`}`,
              fecha: e.fechaCalibracion,
            };
          });

        //Stock bajo
        const reactivos = await prisma.reactivo.findMany({
          where: { isActive: true },
        });

        const notifStock = reactivos
          .filter(
            (r) =>
              parseFloat(r.stockMinimo) > 0 &&
              parseFloat(r.stockActual) <= parseFloat(r.stockMinimo),
          )
          .map((r) => ({
            id: `reactivo-${r.id}`,
            tipo: "STOCK_BAJO",
            titulo: "Stock bajo mínimo",
            mensaje: `${r.nombre} — ${parseFloat(r.stockActual)} ${r.unidad === "LITROS" ? "L" : "KG"} disponibles`,
            fecha: r.updatedAt,
          }));

        const listasParaInforme = await prisma.sample.findMany({
          where: { status: "LISTO_PARA_INFORME" },
          include: { request: { include: { client: true } } },
          orderBy: { updatedAt: "desc" },
          take: 10,
        });

        const notifInformes = listasParaInforme.map((s) => ({
          id: `informe-${s.id}`,
          tipo: "LISTO_INFORME",
          titulo: "Muestra lista para informe",
          mensaje: `${s.sampleCode} — ${s.sampleName || "Sin nombre"}`,
          cliente: s.request?.client?.name,
          fecha: s.updatedAt,
        }));

        notifications = [...notifInformes, ...notifEquipos, ...notifStock];
      }

      const mensajesNoLeidos = await prisma.mensaje.findMany({
        where: { toId: userId, leido: false },
        include: { from: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      const notifMensajes = mensajesNoLeidos.map((m) => ({
        id: `mensaje-${m.id}`,
        tipo: "MENSAJE",
        titulo: `Mensaje de ${m.from.fullName}`,
        mensaje:
          m.contenido.length > 60
            ? m.contenido.substring(0, 60) + "..."
            : m.contenido,
        fecha: m.createdAt,
        mensajeId: m.id,
      }));

      notifications = [...notifMensajes, ...notifications];

      const data = JSON.stringify({
        count: notifications.length,
        notifications,
      });

      res.write(`data: ${data}\n\n`);
    } catch (error) {
      console.error("SSE notification error:", error);
    }
  };

  // Enviar inmediatamente
  await sendNotifications();

  // Refrescar cada 30 segundos
  const interval = setInterval(sendNotifications, 10000);

  // Limpiar al desconectar
  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
}

module.exports = { streamNotifications };
