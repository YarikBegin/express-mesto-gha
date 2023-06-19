const User = require('../models/user');

const getUsers = (req, res) => {
  User.find({}).then((users) => res.status(200).send(users)).catch((err) => {
    console.log(err);
  });
};

const getUserById = (req, res) => {
  const { userId } = req.params;

  User.findById(userId)
  .then((user) => {
    if(!user) {
        res.status(404).send({ message: `По указанному id: ${userId} пользователь не найден` });
    }
    else {
      res.status(200).send(user);
    }
  })
  .catch(() => {
    res.status(400).send({ message: `Переданы некорректные данные пользователя ${userId}` });
  });
};

const createUser = (req, res) => {
  const newUserData = req.body;

  User.create(newUserData)
  .then((newUser) => {
    res.status(201).send(newUser);
  })
  .catch((err) => {
    if(err.name === 'ValidationError') {
      res.status(400).send({
        message: 'Пожалуйста, проверьте правильность заполнения полей.'
      });
    }
    else {
      res.status(500).send({ message: 'Ошибка сервера' });
    }
  });
};

const updateUserById = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true})
  .then((user) => {
    if(!user) {
      res.status(404).send({ message: `По указанному id: ${userId} пользователь не найден` });
    }
    else {
      res.status(200).send(user);
    }
  })
  .catch((err) => {
    if(err.name === 'ValidationError') {
      res.status(400).send({
        message: 'Пожалуйста, проверьте правильность заполнения полей.'
      });
    }
    else {
      res.status(500).send({ message: 'Ошибка сервера' });
    }
  });
};

const updateAvatarById = (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
  .then((user) => {
    if (!user) {
      res.status(404).send({ message: `По указанному id: ${userId} пользователь не найден` });
    }
    else {
      res.status(200).send(user);
    }
  })
  .catch((err) => {
    console.log(err);
  });
};

module.exports = { getUsers, getUserById, createUser, updateUserById, updateAvatarById };