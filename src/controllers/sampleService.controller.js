const { prisma } = require("../db/prisma"); // AJUSTA si tu ruta es distinta
const { z } = require("zod");
const { assignServicesSchema } = require("../validators/sampleService.shema");
const {
  assignServicesToSample,
  listSampleServices,
  updateSampleServiceStatus,
  upsertResult,
} = require("../services/sampleService.service");
const {
  recalcAndUpdateSampleStatus,
} = require("../services/sampleStatus.recalc");

const patchStatusSchema = z.object({
  status: z.enum(["PENDING", "RUNNING", "DONE"]),
});

const resultSchema = z.object({
  resultText: z.string().optional().nullable(),
  resultNumber: z
    .union([z.number(), z.string().regex(/^\d+(\.\d+)?$/)])
    .optional()
    .nullable(),
  unit: z.string().optional().nullable(),
  isFinal: z.boolean().optional(),
});

async function postAssignServices(req, res, next) {
  try {
    const body = assignServicesSchema.parse(req.body);
    const data = await assignServicesToSample(req.params.id, body.serviceIds);
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
}

async function getSampleServices(req, res, next) {
  try {
    const data = await listSampleServices(req.params.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
}

async function patchSampleServiceStatus(req, res, next) {
  try {
    const body = patchStatusSchema.parse(req.body);

    const updatedSS = await updateSampleServiceStatus(
      req.params.id,
      body.status,
    );

    await recalcAndUpdateSampleStatus(updatedSS.sampleId, req.user?.sub);

    const sample = await prisma.sample.findUnique({
      where: { id: updatedSS.sampleId },
      include: { request: { include: { client: true } }, history: true },
    });

    return res.json({ sampleService: updatedSS, sample });
  } catch (e) {
    return next(e); // SOLO next. NO res.json aquí.
  }
}

async function postResult(req, res, next) {
  try {
    const body = resultSchema.parse(req.body);

    // 1. Guardar el resultado
    const data = await upsertResult(req.params.id, body, req.user.sub);

    // 2. Marcar el SampleService como DONE automáticamente
    const updatedSS = await updateSampleServiceStatus(req.params.id, "DONE");

    // 3. Recalcular estado de la muestra (y del request si aplica)
    await recalcAndUpdateSampleStatus(updatedSS.sampleId, req.user?.sub);

    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  postAssignServices,
  getSampleServices,
  patchSampleServiceStatus,
  postResult,
};
