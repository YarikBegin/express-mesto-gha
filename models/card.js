const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const validationRegex = require('../utils/validationRegex');

const cardSchema = new Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  link: {
    type: String,
    required: true,
    validate: validationRegex,
  },
  owner: {
    type: Schema.Types.ObjectId,
    reference: 'user',
    required: true,
  },
  likes: {
    type: [
      {
        type: Schema.Types.ObjectId,
        reference: 'user',
      },
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('card', cardSchema);
