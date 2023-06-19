const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');

const { PORT = 3000 } = process.env.PORT || 4000;

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
}).then(() => {
  console.log('connected to db');
});

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '64904c78043e253881fcd3b3',
  };
  next();
});
app.use(routes);
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Неверный путь' });
});
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
