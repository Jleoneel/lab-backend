const { createClientSchema, updateClientSchema } = require("../validators/client.schema");
const { listClients, createClient, updateClient } = require("../services/client.service");

async function getClients(req, res, next) {
  try {
    const q = req.query.q?.trim();
    const data = await listClients(q);
    res.json(data);
  } catch (e) { next(e); }
}

async function postClient(req, res, next) {
  try {
    const body = createClientSchema.parse(req.body);
    const created = await createClient(body);
    res.status(201).json(created);
  } catch (e) { next(e); }
}

async function putClient(req, res, next) {
  try {
    const body = updateClientSchema.parse(req.body);
    const updated = await updateClient(req.params.id, body);
    res.json(updated);
  } catch (e) { next(e); }
}

module.exports = { getClients, postClient, putClient };
