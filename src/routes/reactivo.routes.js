const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");
const {
  getReactivos, getReactivo, postReactivo,
  putReactivo, postMovimiento, getMovimientos
} = require("../controllers/reactivo.controller");

router.use(authMiddleware, requireAdmin);

router.get("/", getReactivos);
router.get("/:id", getReactivo);
router.post("/", postReactivo);
router.put("/:id", putReactivo);
router.post("/movimientos", postMovimiento);
router.get("/:id/movimientos", getMovimientos);

module.exports = router;