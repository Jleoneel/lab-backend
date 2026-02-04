const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");
const { postRequest } = require("../controllers/request.controller");

router.use(authMiddleware, requireAdmin);
router.post("/", postRequest);

module.exports = router;
