const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();

const User = require('../models/users');
const auth = require('../middleware/auth');

// Account details endpoint
router.get('/users/me', auth, async (req, res, next) => {
  try {
    res.status(200).send(req.user);
  } catch (e) {
    next(e);
  }
});


// Login endpoint
router.post('/login', async (req, res, next) => {
  try {
    const payload = req.body.payload;
    const password = req.body.password;
    if (!(payload && password)) {
      return res.status(404).send('pls provide password and username/email');
    }
    const user = await User.findByCardinalities(payload, password);
    const token = await user.generateAuthTokens();
    return res.status(200).send({user, token});
  } catch (e) {
    return next(e);
  }
}),

// creating Users endpoint
router.post('/users', async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthTokens();
    res.status(201).send({user, token});
  } catch (e) {
    return next(e);
  }
});

// Updating Users endpoint
router.patch('/users/:id', async (req, res, next) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'password', 'age', 'email'];
    const isValidUpdates = updates.every(
        (update) => allowedUpdates.includes(update));
    if (!isValidUpdates) {
      return res.status(404).send('not valid updates');
    }
    const user = await User.findById(req.params.id, {});
    if (!user) {
      return res.status(404).send();
    }
    updates.forEach((update) => user[update] = req.body[update]);
    await user.save();
    return res.status(200).send(user);
  } catch (e) {
    return next(e);
  }
});

// Deleting Users Account endpoint
router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    return res.status(200).send();
  } catch (e) {
    return next(e);
  };
});

module.exports = router;
