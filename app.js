const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');

const { PORT = 3000 } = process.env.PORT || 4000;

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
}).then(() => {
  // eslint-disable-next-line no-console
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
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`server is running on port ${PORT}`);
});
