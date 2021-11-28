const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const usersSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (v) => /https*:\/\/[a-z0-9-._~:/?#[\]@!$&'()*+,;=]{1,}/gi.test(v),
      message: (props) => `${props.value} невалидный адрес`,
    },

  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, 'Невалидный Email'],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
});

usersSchema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неправильные почта или пароль'));
          }
          return user;
        });
    });
};

module.exports = mongoose.model('users', usersSchema);
