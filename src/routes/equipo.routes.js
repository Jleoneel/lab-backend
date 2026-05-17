const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");
const { getEquipos, getEquipo, postEquipo, putEquipo } = require("../controllers/equipo.controller");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads/equipos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `equipo-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const valid = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(null, valid ? true : new Error('Solo imágenes jpg, png, webp'));
  }
});

router.use(authMiddleware, requireAdmin);
router.get("/", getEquipos);
router.get("/:id", getEquipo);
router.post("/", upload.single('foto'), postEquipo); 
router.put("/:id", upload.single('foto'), putEquipo);   


module.exports = router;