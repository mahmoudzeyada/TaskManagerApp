const jwt = require('jsonwebtoken');
const boom = require('@hapi/boom');

const jwtPromise = {
  verify(token, secret) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, function(error, decoded) {
        if (error) {
          reject(boom.badRequest(error));
        }
        resolve(decoded);
      });
    });
  },
};

module.exports = jwtPromise;
