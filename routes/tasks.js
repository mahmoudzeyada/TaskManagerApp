const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();

const auth = require('../middleware/auth');
const Task = require('../models/tasks');


// Creating Tasks endpoint
router.post('/tasks', auth, async (req, res, next) => {
  try {
    const task = new Task({
      ...req.body,
      owner: req.user._id,
    });
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    next(e);
  }
});

// Reading Tasks endpoint
router.get('/tasks', auth, async (req, res, next) => {
  try {
    const match = {};
    if (req.query.completed) {
      match.completed = req.query.completed === 'true';
    }
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
      },
    }).execPopulate();
    res.status(200).send(req.user.tasks);
  } catch (e) {
    next(e);
  }
});

// Reading Tasks by id endpoint
router.get('/tasks/:id', auth, async (req, res, next) => {
  try {
    const _id = req.params.id;
    const task = await Task.findOne({_id, owner: req.user.id});
    if (!task) {
      res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    next(e);
  }
});

// Updating Tasks endpoint
router.patch('/tasks/:id', auth, async (req, res, next) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidUpdates = updates.every(
        (update) => allowedUpdates.includes(update));
    if (!isValidUpdates) {
      return res.status(404).send('not valid updates');
    }
    const task = await Task.findOne({_id: req.params.id, owner: req.user.id});
    if (!task) {
      return res.status(404).send('not valid this task');
    }
    updates.forEach((update) => task[update] = req.body[update]);
    await task.save();
    return res.status(200).send(task);
  } catch (e) {
    next(e);
  }
});

// Deleting Tasks endpoint
router.delete('/tasks/:id', auth, async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete(
        {_id: req.params.id, owner: req.user.id});
    if (!task) {
      return res.status(404).send();
    }
    return res.status(200).send();
  } catch (e) {
    next(e);
  };
});

module.exports = router;
