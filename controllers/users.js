const Users = require('../models/users');

module.exports.getUsers = (req, res) => {
  Users.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка.' }));
};

module.exports.getUser = (req, res) => {
  const { userId } = req.params;

  Users.findById(userId)
    .then((user) => res.send({ data: user }))
    .orFail(() => {
      const error = new Error('Нет карточки/пользователя по заданному id');
      error.statusCode = 404;
      throw error;
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Пользователь по указанному id не найден' });
      }
      if (err.name === 'Error') {
        return res.status(404).send({ message: 'Нет пользователя по заданному id.' });
      }
      return res.status(500).send({ message: 'Произошла ошибка.' });
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  Users.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Произошла ошибка валидации' });
      }
      return res.status(500).send({ message: 'Произошла ошибка.' });
    });
};

module.exports.updateUserInfo = (req, res) => {
  const { name, about } = req.body;

  Users.findByIdAndUpdate(req.user._id, { name, about }, {
    new: true,
    runValidators: true,
  })
    .orFail(() => {
      const error = new Error('Нет пользователя по заданному id');
      error.statusCode = 404;
      throw error;
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
      }
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Пользователь по указанному id не найден' });
      }
      if (err.name === 'Error') {
        return res.status(404).send({ message: 'Нет пользователя по заданному id.' });
      }
      return res.status(500).send({ message: 'Произошла ошибка.' });
    });
};

module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;

  Users.findByIdAndUpdate(req.user._id, { avatar }, {
    new: true,
    runValidators: true,
  })
    .orFail(() => {
      const error = new Error('Нет пользователя по заданному id');
      error.statusCode = 404;
      throw error;
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
      }
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Пользователь по указанному id не найден' });
      }
      if (err.name === 'Error') {
        return res.status(404).send({ message: 'Нет пользователя по заданному id.' });
      }
      return res.status(500).send({ message: 'Произошла ошибка.' });
    });
};
