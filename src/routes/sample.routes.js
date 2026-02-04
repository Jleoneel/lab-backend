const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");
const {
  getSamples,
  getSample,
  patchSampleStatus,
} = require("../controllers/sample.controller");

router.use(authMiddleware, requireAdmin);
router.get("/", getSamples);
router.get("/:id", getSample);
router.patch("/:id/status", patchSampleStatus);

module.exports = router;
