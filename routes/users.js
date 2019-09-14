const express = require('express');
const router = express.Router();

const User = require('../models/users');

// creating Users endpoint
router.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Updating Users endpoint
router.patch('/users/:id', async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'password', 'age', 'email'];
    const isValidUpdates = updates.every(
        (update) => allowedUpdates.includes(update));
    if (!isValidUpdates) {
      return res.status(404).send('not valid updates');
    }

    const _id = req.params.id;
    const user = await User.findByIdAndUpdate(
        _id, req.body, {new: true, runValidators: true});
    if (!user) {
      return res.status(404).send();
    }
    return res.status(200).send(user);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// Deleting Users Account endpoint
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    return res.status(200).send();
  } catch (e) {
    return res.status(500).send();
  };
});

module.exports = router;
