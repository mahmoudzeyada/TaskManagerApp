const express = require('express');
const boom = require('@hapi/boom');
// eslint-disable-next-line new-cap
const router = express.Router();

const auth = require('../middleware/auth');
const Task = require('../models/tasks');
const asyncMiddleWare = require('../middleware/errorHandling');
const {
  taskUpdateSchema,
  taskCreateSchema,
} = require('../validators/taskValidators');


// Creating Tasks endpoint
router.post('/tasks', auth, asyncMiddleWare(async (req, res) => {
  const {error, value} = taskCreateSchema.validate({...req.body});
  if (error) {
    throw boom.badRequest(error);
  }
  const task = new Task({
    ...value,
    owner: req.user._id,
  });
  await task.save();
  res.status(201).send(task);
}));

// Reading Tasks endpoint
router.get('/tasks', auth, asyncMiddleWare(async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }
  if (req.query.sortBy) {
    const query = req.query.sortBy.split(':');
    sort[query[0]] = query[1] === 'desc' ? -1 : 1;
  }
  await req.user.populate({
    path: 'tasks',
    match,
    options: {
      limit: parseInt(req.query.limit),
      skip: parseInt(req.query.skip),
      sort,
    },
  }).execPopulate();
  res.status(200).send(req.user.tasks);
}));

// Reading Tasks by id endpoint
router.get('/tasks/:id', auth, asyncMiddleWare(async (req, res) => {
  const _id = req.params.id;
  const task = await Task.findOne({_id, owner: req.user.id});
  if (!task) {
    throw boom.notFound('this task not found');
  }
  res.send(task);
}));

// Updating Tasks endpoint
router.patch('/tasks/:id', auth, asyncMiddleWare(async (req, res) => {
  const updates = Object.keys(req.body);
  const {error, value} = taskUpdateSchema.validate({...req.body});
  if (error) {
    throw boom.badRequest(error);
  }
  const task = await Task.findOne({_id: req.params.id, owner: req.user.id});
  if (!task) {
    throw boom.notFound('this task not found');
  }
  updates.forEach((update) => task[update] = value[update]);
  await task.save();
  return res.status(200).send(task);
}));

// Deleting Tasks endpoint
router.delete('/tasks/:id', auth, asyncMiddleWare(async (req, res) => {
  const task = await Task.findOneAndDelete(
      {_id: req.params.id, owner: req.user.id});
  if (!task) {
    throw boom.notFound('this task not found');
  }
  return res.status(200).send();
}));

module.exports = router;
