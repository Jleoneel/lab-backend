const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");
const { getClients, postClient, putClient } = require("../controllers/client.controller");

router.use(authMiddleware, requireAdmin);

router.get("/", getClients);
router.post("/", postClient);
router.put("/:id", putClient);

module.exports = router;
