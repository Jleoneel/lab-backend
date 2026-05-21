const router = require('express').Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/acuerdo.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer para archivos firmados
const uploadDir = path.join(__dirname, '../../uploads/acuerdos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storageFirmado = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `acuerdo-firmado-${Date.now()}${ext}`);
    }
});

// Multer para el template (temporal)
const storageTemplate = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/templates');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, `acuerdo_tmp_${Date.now()}.pdf`)
});

const uploadFirmado = multer({
    storage: storageFirmado,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const valid = /pdf|docx|doc/.test(path.extname(file.originalname).toLowerCase());
        cb(null, valid ? true : new Error('Solo PDF o Word'));
    }
});

const uploadTemplate = multer({
    storage: storageTemplate,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const valid = /pdf/.test(path.extname(file.originalname).toLowerCase());
        cb(null, valid ? true : new Error('Solo PDF'));
    }
});

router.use(authMiddleware);
router.use(requireAdmin);

router.get('/generar/:quoteId', ctrl.generarAcuerdo);
router.get('/cliente/:clientId', ctrl.getAcuerdosByCliente);
router.patch('/firmar/:clientId', ctrl.marcarFirmado);
router.post('/archivo/:acuerdoId', uploadFirmado.single('archivo'), ctrl.subirArchivoFirmado);
router.post('/template', uploadTemplate.single('template'), ctrl.subirTemplate);

module.exports = router;