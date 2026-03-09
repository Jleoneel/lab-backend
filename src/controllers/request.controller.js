const { prisma } = require("../db/prisma");
const { get } = require("../routes/request.routes");
const {
  createRequest,
  listRequests,
  getSampleById,
  changeSampleStatus,
  listSamplesByStatus,
  getSamplesByRequestId,
} = require("../services/request.service");

async function getRequests(req, res, next) {
  try {
    const q = req.query.q?.trim();
    const take = req.query.take ? Number(req.query.take) : 20;
    const data = await listRequests({ q, take });
    res.json(data);
  } catch (e) {
    next(e);
  }
}

async function getRequest(req, res, next) {
  try {
    const { id } = req.params;
    const request = await getRequestById(id);
    if (!request) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }
    res.json(request);
  } catch (e) {
    next(e);
  }
}

// Si necesitas obtener una request por ID (para el detalle)
async function getRequestById(req, res, next) {
  try {
    const { id } = req.params;
    const request = await prisma.request.findUnique({
      where: { id: parseInt(id) },
      include: { client: true, samples: true },
    });
    if (!request) return res.status(404).json({ message: "Solicitud no encontrada" });
    res.json(request);
  } catch (e) {
    next(e);
  }
}

async function getRequestSamples(req, res, next) {
  try {
    const { id } = req.params;
    const samples = await getSamplesByRequestId(id);
    res.json(samples);
  } catch (e) {
    next(e);
  }
}

// Aquí puedes agregar otros controladores (crear, actualizar, etc.)

module.exports = {
  getRequests,
  getRequestById,
  getRequestSamples,
  getRequest,
};