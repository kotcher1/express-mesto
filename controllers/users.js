const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../models/users');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/not-found-error');
const ConflictError = require('../errors/conflict-error');

module.exports.getUsers = (req, res, next) => {
  Users.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.getUserInfo = (req, res, next) => {
  Users.findById(req.user._id)
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному id не найден');
    })
    .then((user) => res.send({ data: user }))
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  const { userId } = req.params;

  Users.findById(userId)
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному id не найден');
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Пользователь по указанному id не найден'));
      }
      return next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => Users.create({
      name, about, avatar, email, password: hash,
    }))
    .then(() => res.send({
      data: {
        name, about, avatar, email,
      },
    }))
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictError('Пользователь с данным email уже существует'));
      }
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Произошла ошибка валидации'));
      }
      return next(err);
    });
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;

  Users.findByIdAndUpdate(req.user._id, { name, about }, {
    new: true,
    runValidators: true,
  })
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному id не найден');
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении профиля.'));
      }
      if (err.name === 'CastError') {
        return next(new BadRequestError('Пользователь по указанному id не найден'));
      }
      return next(err);
    });
};

module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;

  Users.findByIdAndUpdate(req.user._id, { avatar }, {
    new: true,
    runValidators: true,
  })
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному id не найден');
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении аватара.'));
      }
      if (err.name === 'CastError') {
        return next(new BadRequestError('Пользователь по указанному id не найден'));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return Users.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.cookie('jwt', token, {
        maxAge: 3600000,
        httpOnly: true,
      })
        .end();
    })
    .catch(next);
};
