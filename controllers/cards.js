const http2 = require('http2');
const Card = require('../models/card');
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} = require('../errors/errors');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(http2.constants.HTTP_STATUS_OK).send(cards))
    .catch((error) => {
      next(error);
    });
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((newCard) => {
      res.status(http2.constants.HTTP_STATUS_CREATED).send(newCard);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        throw new ValidationError(`Пожалуйста, проверьте правильность заполнения полей:
        ${Object.values(error.errors).map((err) => `${err.message.slice(5)}`).join(' ')}`);
      } else {
        next(error);
      }
    })
    .catch(next);
};

const deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError(`Карточка с указанным id: ${cardId} не найдена.`);
      } else if (card.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Нельзя удалить чужую карточку.');
      } else {
        Card.findByIdAndRemove(cardId)
          .then((removedCard) => res.status(http2.constants.HTTP_STATUS_OK).send(removedCard))
          .catch((error) => {
            next(error);
          });
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        throw new BadRequestError(`Карточка с указанным id: ${cardId} не существует в базе данных.`);
      } else {
        next(error);
      }
    });
};

const likeCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError(`Карточка с указанным id: ${cardId} не найдена.`);
      } else {
        Card.findByIdAndUpdate(
          req.params.cardId,
          { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
          { new: true },
        )
          .then((removedCard) => res.status(http2.constants.HTTP_STATUS_OK).send(removedCard))
          .catch((error) => {
            next(error);
          });
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        throw new BadRequestError(`Карточка с указанным id: ${cardId} не существует в базе данных.`);
      } else {
        next(error);
      }
    });
};

const dislikeCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError(`Карточка с указанным id: ${cardId} не найдена.`);
      } else {
        Card.findByIdAndUpdate(
          req.params.cardId,
          { $pull: { likes: req.user._id } }, // убрать _id из массива
          { new: true },
        )
          .then((removedCard) => res.status(http2.constants.HTTP_STATUS_OK).send(removedCard))
          .catch((error) => {
            next(error);
          });
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        throw new BadRequestError(`Карточка с указанным id: ${cardId} не существует в базе данных.`);
      } else {
        next(error);
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
