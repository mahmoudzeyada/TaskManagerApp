const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const multer = require('multer');

const User = require('../models/users');
const auth = require('../middleware/auth');


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


// Logout endpoint
router.post('/logout', auth, async (req, res, next) => {
  try {
    // removing the token for the current session form db
    req.user.tokens = req.user.tokens.filter((subDoc) => {
      return subDoc.token !== req.token;
    });
    await req.user.save();
    res.status(200).send();
  } catch (e) {
    next(e);
  }
});


// Logout-all endpoint
router.post('/logoutall', auth, async (req, res, next) => {
  try {
    // removing all authentications token from db
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send();
  } catch (e) {
    next(e);
  }
});


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

// Account details endpoint
router.get('/users/me', auth, async (req, res, next) => {
  try {
    res.status(200).send(req.user);
  } catch (e) {
    next(e);
  }
});

// Updating Users endpoint
router.patch('/users/me', auth, async (req, res, next) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'password', 'age', 'email'];
    const isValidUpdates = updates.every(
        (update) => allowedUpdates.includes(update));
    if (!isValidUpdates) {
      return res.status(404).send('not valid updates');
    }
    updates.forEach((update) => req.user[update] = req.body[update]);
    await req.user.save();
    return res.status(200).send(req.user);
  } catch (e) {
    return next(e);
  }
});

// Deleting Users Account endpoint
router.delete('/users/me', auth, async (req, res, next) => {
  try {
    await req.user.remove();
    return res.status(200).send();
  } catch (e) {
    return next(e);
  };
});

// Upload Avatars
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(undefined, true);
    }
    return cb(new Error('the file must be jpg,jpeg or png'));
  },
});

router.post('/users/me/avatar', auth, upload.single('avatar'),
    async (req, res) => {
      req.user.avatar = req.file.buffer;
      await req.user.save();
      res.send();
    }, (error, req, res, next) => {
      res.status(400).send({error: error.message});
    });

module.exports = router;
