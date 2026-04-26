const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");
const { getEquipos, getEquipo, postEquipo, putEquipo } = require("../controllers/equipo.controller");

router.use(authMiddleware, requireAdmin);

router.get("/", getEquipos);
router.get("/:id", getEquipo);
router.post("/", postEquipo);
router.put("/:id", putEquipo);

module.exports = router;