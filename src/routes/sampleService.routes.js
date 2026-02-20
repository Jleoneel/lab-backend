const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");
const {
  postAssignServices,
  getSampleServices,
  patchSampleServiceStatus,
  postResult,
} = require("../controllers/sampleService.controller");

router.use(authMiddleware, requireAdmin);

router.post("/samples/:id/services", postAssignServices);
router.get("/samples/:id/services", getSampleServices);

router.patch("/sample-services/:id/status", patchSampleServiceStatus);
router.post("/sample-services/:id/result", postResult);

module.exports = router;