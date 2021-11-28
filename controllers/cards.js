const jwt = require('jsonwebtoken');
const Cards = require('../models/cards');
const NotFoundError = require('../errors/not-found-error');

module.exports.getCards = (req, res, next) => {
  Cards.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Cards.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные при создании карточки.' });
      }
      return next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  const decoded = jwt.verify(req.cookies.jwt, 'some-secret-key');

  Cards.findById(cardId)
    .then((card) => {
      if (card && decoded._id === card.owner) {
        card.remove();
        res.send({ data: card });
        return;
      }
      throw new NotFoundError('Карточка с указанным _id не найдена.');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Передан несуществующий id карточки.' });
      }
      if (err.name === 'Error') {
        return res.status(404).send({ message: 'Карточка с указанным _id не найдена.' });
      }
      return next(err);
    });
};

module.exports.likeCard = (req, res, next) => {
  Cards.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new NotFoundError('Нет карточки/пользователя по заданному id');
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Передан несуществующий id карточки.' });
      }
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные для постановки лайка.' });
      }
      if (err.name === 'Error') {
        return res.status(404).send({ message: 'Нет карточки по заданному id' });
      }
      return next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Cards.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new NotFoundError('Нет карточки/пользователя по заданному id');
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Передан несуществующий id карточки.' });
      }
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные для постановки лайка.' });
      }
      if (err.name === 'Error') {
        return res.status(404).send({ message: 'Нет карточки по заданному id' });
      }
      return next(err);
    });
};
