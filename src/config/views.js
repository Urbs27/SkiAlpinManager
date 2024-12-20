const express = require('express');
const path = require('path');

module.exports = (app) => {
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../../views'));
  app.set('view cache', process.env.NODE_ENV === 'production');

  app.locals.disciplines = {
    SL: 'Slalom',
    GS: 'Riesenslalom',
    SG: 'Super-G',
    DH: 'Abfahrt'
  };

  app.locals.formatTime = (time) => {
    if (!time) return '--:--';
    return (time / 100).toFixed(2);
  };

  app.locals.formatDiff = (diff) => {
    if (!diff) return '';
    return diff > 0 ? `+${(diff / 100).toFixed(2)}` : (diff / 100).toFixed(2);
  };
}; 