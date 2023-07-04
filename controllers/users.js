const http2 = require('http2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} = require('../errors/errors');

const SALT_ROUNDS = 10;
const JWT_SECRET = 'unique-secret-key';

const getUsers = (req, res, next) => {
  User.find({}).then((users) => res.status(http2.constants.HTTP_STATUS_OK).send(users))
    .catch((error) => {
      next(error);
    });
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        next(new NotFoundError(`Пользователь по указанному id: ${userId} не найден.`));
      } else {
        res.status(http2.constants.HTTP_STATUS_OK).send(user);
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequestError(`Получение пользователя с некорректным id: ${userId}.`));
      } else {
        next(error);
      }
    });
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        next(new NotFoundError(`Пользователь по указанному id: ${userId} не найден.`));
      } else {
        res.status(http2.constants.HTTP_STATUS_OK).send(user);
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequestError(`Получение пользователя с некорректным id: ${userId}.`));
      } else {
        next(error);
      }
    });
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((newUser) => {
      res.status(http2.constants.HTTP_STATUS_CREATED).send({
        name: newUser.name, about: newUser.about, avatar: newUser.avatar, email: newUser.email,
      });
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new ValidationError(`Пожалуйста, проверьте правильность заполнения полей: ${Object.values(error.errors).map((err) => `${err.message.slice(5)}`).join(' ')}`));
      } else if (error.code === 11000) {
        next(new ConflictError('Пользователь с таким email существует'));
      } else {
        next(error);
      }
    });
};

const updateUserById = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        next(new NotFoundError(`Пользователь по указанному id: ${userId} не найден.`));
      } else {
        res.status(http2.constants.HTTP_STATUS_OK).send(user);
      }
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new ValidationError(`Пожалуйста, проверьте правильность заполнения полей: ${Object.values(error.errors).map((err) => `${err.message.slice(5)}`).join(' ')}`));
      } else {
        next(error);
      }
    });
};

const updateAvatarById = (req, res, next) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError(`Пользователь по указанному id: ${userId} не найден.`);
      } else {
        res.status(http2.constants.HTTP_STATUS_OK).send(user);
      }
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        throw new ValidationError(`Пожалуйста, проверьте правильность заполнения полей: ${Object.values(error.errors).map((err) => `${err.message.slice(5)}`).join(' ')}`);
      } else {
        next(error);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Не передан email или пароль.');
  }
  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Такого пользователя не существует.');
      }
      return bcrypt.compare(password, user.password)
        .then((correctPassword) => {
          if (!correctPassword) {
            throw new UnauthorizedError('Неверный пользователь или пароль.');
          }
          const token = jwt.sign(
            { _id: user._id },
            JWT_SECRET,
            { expiresIn: '7d' },
          );
          return res.send({ jwt: token });
        });
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = {
  getUsers,
  getCurrentUser,
  getUserById,
  createUser,
  updateUserById,
  updateAvatarById,
  login,
};
