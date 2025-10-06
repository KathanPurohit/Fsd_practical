const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Welcome to our site');
});

module.exports = app;