const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { getLabInfo, getIva, updateIva } = require("../controllers/settings.controller");

router.use(authMiddleware);
router.get("/lab-info", getLabInfo);
router.get("/iva", getIva);
router.put("/iva", updateIva);        
module.exports = router;