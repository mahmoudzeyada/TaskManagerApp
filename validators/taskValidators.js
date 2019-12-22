const joi = require("@hapi/joi");

const taskUpdateSchema = joi.object({
  description: joi.string(),
  completed: joi.boolean()
});
const taskCreateSchema = joi.object({
  description: joi.string().required(),
  completed: joi.boolean(),
  content: joi.string().required()
});

module.exports = { taskUpdateSchema, taskCreateSchema };
