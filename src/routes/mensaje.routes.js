const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { getMensajes, postMensaje, marcarLeido, marcarTodosLeidos } = require("../controllers/mensaje.controller");

router.use(authMiddleware);

router.get("/", getMensajes);
router.post("/", postMensaje);
router.patch("/:id/leer", marcarLeido);
router.patch("/leer-todos", marcarTodosLeidos);

module.exports = router;