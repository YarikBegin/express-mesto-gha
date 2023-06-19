const router = require('express').Router();
const {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCardById,
} = require('../controllers/cards');

router.get('/', getCards);
router.delete('/:cardId', deleteCardById);
router.post('/', createCard);
router.put('/:cardId/likes', likeCard);
router.delete('/:cardId/likes', dislikeCardById);

module.exports = router;
