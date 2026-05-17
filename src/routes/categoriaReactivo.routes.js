const router = require('express').Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/categoriaReactivo.controller');

router.use(authMiddleware);
router.use(requireAdmin);

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;