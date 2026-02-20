const { z } = require("zod");
const { assignServicesSchema } = require("../validators/sampleService.shema");
const {
  assignServicesToSample,
  listSampleServices,
  updateSampleServiceStatus,
  upsertResult,
} = require("../services/sampleService.service");

const patchStatusSchema = z.object({
  status: z.enum(["PENDING", "RUNNING", "DONE"]),
});

const resultSchema = z.object({
  resultText: z.string().optional().nullable(),
  resultNumber: z.union([z.number(), z.string().regex(/^\d+(\.\d+)?$/)]).optional().nullable(),
  unit: z.string().optional().nullable(),
  isFinal: z.boolean().optional(),
});

async function postAssignServices(req, res, next) {
  try {
    const body = assignServicesSchema.parse(req.body);
    const data = await assignServicesToSample(req.params.id, body.serviceIds);
    res.status(201).json(data);
  } catch (e) { next(e); }
}

async function getSampleServices(req, res, next) {
  try {
    const data = await listSampleServices(req.params.id);
    res.json(data);
  } catch (e) { next(e); }
}

async function patchSampleServiceStatus(req, res, next) {
  try {
    const body = patchStatusSchema.parse(req.body);
    const data = await updateSampleServiceStatus(req.params.id, body.status);
    res.json(data);
  } catch (e) { next(e); }
}

async function postResult(req, res, next) {
  try {
    const body = resultSchema.parse(req.body);
    const data = await upsertResult(req.params.id, body, req.user.sub);
    res.status(201).json(data);
  } catch (e) { next(e); }
}

module.exports = {
  postAssignServices,
  getSampleServices,
  patchSampleServiceStatus,
  postResult,
};