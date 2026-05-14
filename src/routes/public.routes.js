const router = require("express").Router();
const { getSamplePublic } = require("../controllers/public.controller");

// Sin authMiddleware — acceso público
router.get("/samples/:sampleCode", getSamplePublic);

module.exports = router;