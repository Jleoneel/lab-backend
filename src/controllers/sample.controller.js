const { changeStatusSchema } = require("../validators/sample.schema");
const { listSamplesByStatus, getSampleById, changeSampleStatus } = require("../services/request.service");

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

module.exports = { getSamples, getSample, patchSampleStatus };
