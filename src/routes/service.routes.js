const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");
const { getServices, postService, putService } = require("../controllers/service.controller");

router.use(authMiddleware, requireAdmin);

router.get("/", getServices);
router.post("/", postService);
router.put("/:id", putService);

module.exports = router;
