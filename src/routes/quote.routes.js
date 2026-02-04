const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");
const { postQuote, getQuote, getQuotes } = require("../controllers/quote.controller");

router.use(authMiddleware, requireAdmin);

router.get("/", getQuotes);
router.get("/:id", getQuote);
router.post("/", postQuote);

module.exports = router;
