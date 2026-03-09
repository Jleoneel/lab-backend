const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");
const { getRequests, getRequestById, getRequest, getRequestSamples } = require("../controllers/request.controller");

router.use(authMiddleware, requireAdmin);
router.get("/", getRequests);
router.get("/:id", getRequestById);
router.get("/:id", getRequest);
router.get("/:id/samples", getRequestSamples);


module.exports = router;