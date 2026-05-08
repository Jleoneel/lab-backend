const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");
const { createUser, updateUser, resetPassword, getAnalistas, getUsers, changeMyPassword } = require("../controllers/user.controller");

router.use(authMiddleware, requireAdmin);

router.post("/", createUser);
router.put("/:id", updateUser);
router.patch("/:id/reset-password", resetPassword);
router.get("/", getUsers);
router.get("/analistas", getAnalistas);
router.patch('/me/password', changeMyPassword);
module.exports = router;