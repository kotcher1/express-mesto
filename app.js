const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const usersRoutes = require('./routes/users');
const cardsRoutes = require('./routes/cards');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use((req, res, next) => {
  req.user = {
    _id: '61916a1ac39ad9aeee1af4dc',
  };
  next();
});

app.use('', cardsRoutes);

app.use('', usersRoutes);

app.use((req, res) => {
  res.status(404).send({ message: 'Произошла ошибка.' });
});

app.listen(PORT, () => {
});
