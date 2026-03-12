const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");
const { postQuote, getQuote, getQuotes } = require("../controllers/quote.controller");
const { convertQuote } = require("../controllers/quote.controller");
const { updateQuoteStatus } = require("../controllers/quote.controller");
const { putQuote } = require("../controllers/quote.controller");


router.use(authMiddleware, requireAdmin);

router.get("/", getQuotes);
router.get("/:id", getQuote);
router.post("/", postQuote);
router.post("/:id/convert", convertQuote);
router.patch('/:id/status', updateQuoteStatus);
router.put('/:id', putQuote); // 👈 esto faltaba




module.exports = router;
