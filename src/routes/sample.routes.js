const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/role.middleware");
const {
  getSamples,
  getSample,
  patchSampleStatus,
  getSampleServices,
  updateServiceStatus,
  emitReport,
  postResult,
  getKanban
} = require("../controllers/sample.controller");
const { upload } = require("../middlewares/upload.middleware");


router.patch('/sample-services/:id/status', updateServiceStatus);
router.post('/sample-services/:id/result', upload.array('archivos', 10), postResult);
router.post('/:id/emit-report', emitReport);
router.get('/kanban', getKanban);
router.get('/:id', getSample);

// Después las genéricas con :id
router.get('/', getSamples);
router.get('/:id', getSample);
router.patch('/:id/status', patchSampleStatus);
router.get('/:id/services', getSampleServices);


module.exports = router;
