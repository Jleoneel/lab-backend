const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");
const { getRazones, postRazon, putRazon, deleteRazon } = require("../controllers/razon.controller");

router.use(authMiddleware);
router.get("/", getRazones);

router.use(requireAdmin);
router.post("/", postRazon);
router.put("/:id", putRazon);
router.delete("/:id", deleteRazon);

module.exports = router;