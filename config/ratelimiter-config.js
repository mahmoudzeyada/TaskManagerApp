const express = require('express');
const boom = require('@hapi/boom');
const app = express();
const client = require('../models/redis-database');
const limiter = require('express-limiter')(app, client);

const lookupMethod = function(req, res, opts, next) {
  opts.lookup = 'query.email';
  opts.total = 5;
  opts.expire = 1000*60*5;
  return next();
};

module.exports = limiter({
  path: '/users/forget_password',
  method: 'put',
  lookup: lookupMethod,
  onRateLimited: function(req, res, next) {
    next(
        boom.tooManyRequests(
            'you have exceeded your request limit pls try in 15 mins'));
  },
});
