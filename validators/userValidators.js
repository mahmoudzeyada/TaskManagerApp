const joi = require('@hapi/joi');

const creatingUserSchema = joi.object({
  name: joi.string()
      .alphanum()
      .min(5)
      .max(30)
      .required(),
  age: joi.number()
      .greater(0)
      .integer()
      .required(),
  password: joi.string()
      .pattern(/^[a-zA-Z0-9]{3,30}$/)
      .required(),
  email: joi.string()
      .email({minDomainSegments: 2})
      .required(),
});


module.exports = {creatingUserSchema};


