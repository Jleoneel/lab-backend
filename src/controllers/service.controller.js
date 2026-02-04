const { createServiceSchema, updateServiceSchema } = require("../validators/service.schema");
const { listServices, createService, updateService } = require("../services/service.service");

async function getServices(req, res, next) {
  try {
    const q = req.query.q?.trim();
    const data = await listServices(q);
    res.json(data);
  } catch (e) { next(e); }
}

async function postService(req, res, next) {
  try {
    const body = createServiceSchema.parse(req.body);
    const created = await createService(body);
    res.status(201).json(created);
  } catch (e) { next(e); }
}

async function putService(req, res, next) {
  try {
    const body = updateServiceSchema.parse(req.body);
    const updated = await updateService(req.params.id, body);
    res.json(updated);
  } catch (e) { next(e); }
}

module.exports = { getServices, postService, putService };
