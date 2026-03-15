const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { getLabInfo } = require("../controllers/settings.controller");

router.use(authMiddleware);
router.get("/lab-info", getLabInfo);

module.exports = router;