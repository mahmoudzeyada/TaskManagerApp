const boom = require('@hapi/boom');

// Error Handler warper fro async functions
const asyncMiddleWare = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (!err.isBoom) {
      return next(boom.badImplementation(err));
    }
    next(err);
  });
};

module.exports = asyncMiddleWare;
