const router = require('express').Router();
const userRoutes = require('./users');
const cardRoutes = require('./cards');

router.use('/users', userRoutes);
router.use('/cards', cardRoutes);
router.use('*', (_req, res) => {
  res.status(404).json({ message: 'Неверный путь' });
});
module.exports = router;
