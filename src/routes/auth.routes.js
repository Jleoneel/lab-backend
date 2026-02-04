const router = require("express").Router();
const { login, me } = require("../controllers/auth.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/login", login);
router.get("/me", authMiddleware, me);

module.exports = router;
