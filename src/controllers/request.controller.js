const { createRequestSchema } = require("../validators/request.schema");
const { createRequest } = require("../services/request.service");

async function postRequest(req, res, next) {
  try {
    const body = createRequestSchema.parse(req.body);
    const created = await createRequest(body, req.user.sub);
    res.status(201).json(created);
  } catch (e) { next(e); }
}

module.exports = { postRequest };
