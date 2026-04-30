const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { streamNotifications } = require("../controllers/notification.controller");

router.get("/stream", authMiddleware, streamNotifications);

module.exports = router;