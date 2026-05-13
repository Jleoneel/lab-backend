const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");
const { getProduccion, getAnalistas, getServicios, getInventarioReport } = require("../controllers/report.controller");

router.use(authMiddleware);
router.use(requireAdmin);

router.get("/produccion", getProduccion);
router.get("/analistas", getAnalistas);
router.get("/servicios", getServicios);
router.get("/inventario", getInventarioReport);

module.exports = router;