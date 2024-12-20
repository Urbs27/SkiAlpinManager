const express = require('express');
const path = require('path');
const compression = require('compression');

module.exports = (app) => {
  app.use(compression());
  app.use('/static', express.static(path.join(__dirname, '../../public'), {
    maxAge: '1d',
    etag: true
  }));
  app.use('/assets/courses', express.static(path.join(__dirname, '../../assets/courses'), {
    maxAge: '7d'
  }));
  app.use('/assets/athletes', express.static(path.join(__dirname, '../../assets/athletes'), {
    maxAge: '1d'
  }));
  app.use('/assets/weather', express.static(path.join(__dirname, '../../assets/weather'), {
    maxAge: '30d'
  }));
  app.use('/assets/partners', express.static(path.join(__dirname, '../../assets/partners'), {
    maxAge: '30d'
  }));
}; 