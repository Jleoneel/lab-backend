const { prisma } = require("../db/prisma");
const { changeStatusSchema } = require("../validators/sample.schema");
const { listSamplesByStatus, getSampleById, changeSampleStatus, getKanbanSamples } = require("../services/request.service");
const {listSampleServices, updateSampleServiceStatus, upsertResult, asignarAnalista} = require("../services/sampleService.service");
const { recalcAndUpdateSampleStatus } = require('../services/sampleStatus.recalc');
const { upload } = require("../middlewares/upload.middleware");


async function getSamples(req, res, next) {
  try {
    const status = req.query.status;
    const data = await listSamplesByStatus(status);
    res.json(data);
  } catch (e) { next(e); }
}

async function getSample(req, res, next) {
  try {
    const data = await getSampleById(req.params.id);
    if (!data) return res.status(404).json({ message: "Muestra no encontrada" });
    res.json(data);
  } catch (e) { next(e); }
}

async function patchSampleStatus(req, res, next) {
  try {
    const body = changeStatusSchema.parse(req.body);
    const updated = await changeSampleStatus(req.params.id, body.toStatus, req.user.sub, body.note);
    res.json(updated);
  } catch (e) { next(e); }
}

async function getSampleServices(req, res, next) {
  try {
    const { id } = req.params;
    const services = await listSampleServices(id);
    res.json(services);
  } catch (e) {
    next(e);
  }
}

async function updateServiceStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await updateSampleServiceStatus(id, status);
    res.json(updated);
  } catch (e) {
    next(e);
  }
}

async function postResult(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.sub ?? 'system';
    const files = req.files || []; // 👈 array de archivos

    const result = await upsertResult(id, req.body, userId, files);
    const updatedSS = await updateSampleServiceStatus(id, 'DONE');
    await recalcAndUpdateSampleStatus(updatedSS.sampleId, userId);

    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

async function emitReport(req, res, next) {
  try {
    const sampleId = parseInt(req.params.id, 10);
    if (isNaN(sampleId)) {
      return res.status(400).json({ message: 'ID de muestra inválido' });
    }

    const userId = req.user?.sub ?? 'system';

    const result = await prisma.$transaction(async (tx) => {
      const sample = await tx.sample.findUnique({
        where: { id: sampleId },
        select: { id: true, status: true, requestId: true }
      });

      if (!sample) {
        const e = new Error('Muestra no encontrada');
        e.statusCode = 404;
        throw e;
      }

      if (sample.status !== 'LISTO_PARA_INFORME') {
        const e = new Error('La muestra debe estar en LISTO_PARA_INFORME para emitir informe');
        e.statusCode = 400;
        throw e;
      }

      const updated = await tx.sample.update({
        where: { id: sampleId },
        data: { status: 'TERMINADO' }
      });

      await tx.sampleStatusHistory.create({
        data: {
          sampleId,
          fromStatus: 'LISTO_PARA_INFORME',
          toStatus: 'TERMINADO',
          note: 'Informe emitido',
          changedBy: userId // 👈 usar la variable extraída
        }
      });

      const pendingSamples = await tx.sample.count({
        where: {
          requestId: sample.requestId,
          status: { not: 'TERMINADO' }
        }
      });

      if (pendingSamples === 0) {
        await tx.request.update({
          where: { id: sample.requestId },
          data: { status: 'DONE' }
        });
      }

      return updated;
    });

    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function getKanban(req, res, next) {
  try {
    const data = await getKanbanSamples();
    res.json(data);
  } catch (e) {
    next(e);
  }
}

async function assignAnalista(req, res, next) {
  try {
    const { id } = req.params; // sampleServiceId
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ message: 'userId requerido' });

    const updated = await asignarAnalista(id, userId);
    res.json(updated);
  } catch (e) { next(e); }
}

module.exports = { getSamples, getSample, patchSampleStatus, getSampleServices, updateServiceStatus, postResult, emitReport, getKanban, assignAnalista };
