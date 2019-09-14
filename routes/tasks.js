const express = require('express');
const router = express.Router();

const Task = require('../models/tasks');


// Creating Tasks endpoint
router.post('/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Reading Tasks endpoint
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.status(200).send(tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Reading Tasks by id endpoint
router.get('/tasks/:id', async (req, res) => {
  try {
    const _id = req.params.id;
    const task = await Task.findById(_id);
    if (!task) {
      res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Updating Tasks endpoint
router.patch('/tasks/:id', async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidUpdates = updates.every(
        (update) => allowedUpdates.includes(update));
    if (!isValidUpdates) {
      return res.status(404).send('not valid updates');
    }
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).send('not valid this task');
    }
    updates.forEach((update) => task[update] = req.body[update]);
    await task.save();
    return res.status(200).send(task);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// Deleting Tasks endpoint
router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).send();
    }
    return res.status(200).send();
  } catch (e) {
    return res.status(500).send(e);
  };
});

module.exports = router;
