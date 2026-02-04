const { loginSchema } = require("../validators/auth.schema");
const { loginService, meService } = require("../services/auth.service");

async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginService(data.email, data.password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await meService(req.user.sub);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { login, me };
