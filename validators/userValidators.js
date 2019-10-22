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

const updatingUserSchema = joi.object({
  name: joi.string()
      .alphanum()
      .min(5)
      .max(30),
  age: joi.number()
      .greater(0)
      .integer(),
  email: joi.string()
      .email({minDomainSegments: 2}),
});

const resetPasswordSchema = joi.object({
  oldPassword: joi.string()
      .pattern(/^[a-zA-Z0-9]{3,30}$/)
      .required(),
  newPassword: joi.string()
      .pattern(/^[a-zA-Z0-9]{3,30}$/)
      .required(),

});

const verifyingEmailSchema = joi.object({
  email: joi.string()
      .email({minDomainSegments: 2})
      .required(),
});

const confirmingResetPasswordSchema = joi.object({
  password: joi.string()
      .pattern(/^[a-zA-Z0-9]{3,30}$/)
      .required(),
  token: joi.string()
      .required(),
});

module.exports = {
  creatingUserSchema,
  updatingUserSchema,
  resetPasswordSchema,
  verifyingEmailSchema,
  confirmingResetPasswordSchema,
};


