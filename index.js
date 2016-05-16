#! /usr/bin/env node
require('babel-register', {
  ignore: false,
  only: /frot\/app.js/,
});
require('./app');
