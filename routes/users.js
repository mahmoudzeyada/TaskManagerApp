const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const boom = require('@hapi/boom');

const asyncMiddleWare = require('../middleware/errorHandling');
const User = require('../models/users');
const auth = require('../middleware/auth');
const {sendWelcomeEmail, sendCancellationEmail} = require('../emails/accounts');
const {creatingUserSchema} = require('../validators/userValidators');


// Login endpoint
router.post('/login', asyncMiddleWare(async (req, res) => {
  const payload = req.body.payload;
  const password = req.body.password;
  if (!(payload && password)) {
    throw boom.badRequest('pls provide email/username and password');
  }
  const user = await User.findByCardinalities(payload, password);
  const token = await user.generateAuthTokens();
  return res.status(200).send({user, token});
}));


// Logout endpoint
router.post('/logout', auth, asyncMiddleWare(async (req, res) => {
  // removing the token for the current session form db
  req.user.tokens = req.user.tokens.filter((subDoc) => {
    return subDoc.token !== req.token;
  });
  await req.user.save();
  res.status(200).send();
}
));


// Logout-all endpoint
router.post('/logoutall', auth, asyncMiddleWare(async (req, res, next) => {
  req.user.tokens = [];
  await req.user.save();
  res.status(200).send();
}));


// Creating Users endpoint
router.post('/users', asyncMiddleWare(async (req, res) => {
  const {error, value} = creatingUserSchema.validate({...req.body});
  if (error) {
    throw boom.badRequest(error);
  }
  const user = new User(value);
  await user.save();
  const token = await user.generateAuthTokens();
  sendWelcomeEmail(user.name, user.email);
  res.status(201).send({user, token});
}));

// Account details endpoint
router.get('/users/me', auth, async (req, res) => {
  res.status(200).send(req.user);
});

// Updating Users endpoint
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'password', 'age', 'email'];
  const isValidUpdates = updates.every(
      (update) => allowedUpdates.includes(update));
  if (!isValidUpdates) {
    throw boom.badRequest('not valid updates');
  }
  updates.forEach((update) => req.user[update] = req.body[update]);
  await req.user.save();
  return res.status(200).send(req.user);
});

// Deleting Users Account endpoint
router.delete('/users/me', auth, async (req, res) => {
  sendCancellationEmail(req.user.name, req.user.email);
  await req.user.remove();
  return res.status(200).send();
});

// Configuration for uploading files
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


// Uploading avatar endpoint
router.post('/users/me/avatar', auth, upload.single('avatar'),
    async (req, res) => {
      const buffer = await sharp(req.file.buffer)
          .resize({width: 250, hight: 250}).png().toBuffer();
      req.user.avatar = buffer;
      await req.user.save();
      res.send();
    }, (error, req, res, next) => {
      res.status(400).send({error: error.message});
    });


// Deleting avatar endpoint
router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  return res.status(200).send();
});


// Retrieving users avatar by id
router.get('/users/:id/avatar', async (req, res) => {
  const _id = req.params.id;
  const user = await User.findById(_id);
  if (!user || !user.avatar) {
    throw boom.badRequest();
  }
  res.set('Content-type', 'image/png');
  return res.status(200).send(user.avatar);
});

module.exports = router;
