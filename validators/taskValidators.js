const joi = require("@hapi/joi");

const taskUpdateSchema = joi.object({
  description: joi.string(),
  completed: joi.boolean(),
  content: joi.string().required(),
  dueBy: joi.date().required()
});
const taskCreateSchema = joi.object({
  description: joi.string().required(),
  completed: joi.boolean(),
  content: joi.string().required(),
  dueBy: joi.date().required()
});

module.exports = { taskUpdateSchema, taskCreateSchema };
