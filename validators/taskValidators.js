const joi = require('@hapi/joi');

const taskUpdateSchema = joi.object({
  description: joi.string(),
  completed: joi.boolean(),
});

module.exports = taskUpdateSchema;
