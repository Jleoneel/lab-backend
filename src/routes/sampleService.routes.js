const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");
const {
  postAssignServices,
  getSampleServices,
  patchSampleServiceStatus,
  postResult,
} = require("../controllers/sampleService.controller");

router.use(authMiddleware);

router.post("/samples/:id/services", requireAdmin, postAssignServices);
router.get("/samples/:id/services", requireAdmin, getSampleServices);

router.patch("/sample-services/:id/status", requireAdmin, patchSampleServiceStatus);
router.post("/sample-services/:id/result", requireAdmin, postResult);

module.exports = router;