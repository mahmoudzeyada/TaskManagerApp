const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const boom = require('@hapi/boom');
const bcrypt = require('bcryptjs');

const asyncMiddleWare = require('../middleware/errorHandling');
const User = require('../models/users');
const auth = require('../middleware/auth');
const {sendWelcomeEmail, sendCancellationEmail} = require('../emails/accounts');
const {
  creatingUserSchema,
  updatingUserSchema,
  resetPasswordSchema,
} = require('../validators/userValidators');


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
router.get('/users/me', auth, asyncMiddleWare(async (req, res) => {
  res.status(200).send(req.user);
}));

// Updating Users endpoint
router.patch('/users/me', auth, asyncMiddleWare(async (req, res) => {
  const {error, value} = updatingUserSchema.validate({...req.body});
  if (error) {
    throw boom.badRequest(error);
  }
  const updates = Object.keys(value);
  updates.forEach((update) => req.user[update] = value[update]);
  await req.user.save();
  return res.status(200).send(req.user);
}));

// Deleting Users Account endpoint
router.delete('/users/me', auth, asyncMiddleWare(async (req, res) => {
  sendCancellationEmail(req.user.name, req.user.email);
  await req.user.remove();
  return res.status(200).send();
}));

// Configuration for uploading files
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(undefined, true);
    }
    return cb(boom.badRequest('the file must be jpg,jpeg or png'));
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
    }
);


// Deleting avatar endpoint
router.delete('/users/me/avatar', auth, asyncMiddleWare(async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  return res.status(200).send();
}));


// Retrieving users avatar by id
router.get('/users/:id/avatar', asyncMiddleWare(async (req, res) => {
  const _id = req.params.id;
  const user = await User.findById(_id);
  if (!user || !user.avatar) {
    throw boom.badRequest();
  }
  res.set('Content-type', 'image/png');
  return res.status(200).send(user.avatar);
}));


// Reset password endpoint for authenticated users
router.put('/users/me/reset_password', auth,
    asyncMiddleWare(async (req, res) => {
      const {error, value} = resetPasswordSchema.validate({...req.body});
      if (error) {
        throw boom.badRequest(error);
      }
      const isMatch = await bcrypt.compare(value.oldPassword,
          req.user.password);
      if (!isMatch) {
        throw boom.badRequest('there is not the old password');
      }
      req.user.password = value.newPassword;
      await req.user.save();
      return res.status(202).send();
    }));

module.exports = router;
