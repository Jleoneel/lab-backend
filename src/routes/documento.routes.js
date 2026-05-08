const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");
const {
  getCategorias, postCategoria, putCategoria, deleteCategoria,
  postEnlace, putEnlace, deleteEnlace
} = require("../controllers/documento.controller");

router.use(authMiddleware);
router.get("/", getCategorias);

router.use(requireAdmin);
router.post("/categorias", postCategoria);
router.put("/categorias/:id", putCategoria);
router.delete("/categorias/:id", deleteCategoria);
router.post("/enlaces", postEnlace);
router.put("/enlaces/:id", putEnlace);
router.delete("/enlaces/:id", deleteEnlace);

module.exports = router;