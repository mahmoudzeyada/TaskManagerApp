const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose= require('mongoose');
const boom = require('@hapi/boom');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const Task = require('./tasks');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: 'Two users cannot share the same username ({VALUE})',
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw boom.badRequest('age must be positive number');
      };
    },

  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: 'this email :({VALUE}) used before',
    validate(value) {
      if (!validator.isEmail(value)) {
        throw boom.badRequest('Email is invalid');
      };
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
    validate: {
      validator: function(value) {
        const regexPassword = /password/ig;
        return !regexPassword.test(value);
      },
      message: (props) => `${props.value} it is contains password word`,
    },
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    },
  },
  ],
  avatar: {
    type: Buffer,

  },
}, {timestamps: true});


// Enable beautifying on this schema
userSchema.plugin(beautifyUnique);

// Setting virtual attribute for one to many relation ship to tasks
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner',
});
// Method on User for hiding sensitive parameters
userSchema.methods.toJSON= function() {
  user = this.toObject();
  delete user.password;
  delete user.tokens;
  delete user.avatar;
  return user;
};

// Method On User Instance For Creating JWT Tokens
userSchema.methods.generateAuthTokens = async function() {
  const user = this;
  const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({token});
  await user.save();
  return token;
};

// Static Method for comparing passwords
userSchema.statics.findByCardinalities = async (payload, password) => {
  let user = await User.findOne({name: payload});
  if (!user) {
    user = await User.findOne({email: payload});
    if (!user) {
      /* this hashing function used to make the time of checking username or
      email equals to time of hashing and checking password*/
      await bcrypt.compare(' ', password);
      throw boom.badRequest('unable to login');
    }
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw boom.badRequest('unable to login');
  }
  return user;
};

// Middleware for hashing password on every save and update
userSchema.pre('save', async function() {
  // eslint-disable-next-line no-invalid-this
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});

userSchema.pre('findOneAndUpdate', async function() {
  // eslint-disable-next-line no-invalid-this
  const modifiedFields = this.getUpdate().$set;
  if (modifiedFields['password']) {
    modifiedFields['password'] = await bcrypt
        .hash(modifiedFields['password'], 8);
  }
});

// Middleware for removing all related tasks
userSchema.pre('remove', async function() {
  // eslint-disable-next-line no-invalid-this
  const user = this;
  await Task.deleteMany({owner: user._id});
});

// Middleware for handling Key Deduplicate error
const handleE11000 = function(err, res, next) {
  console.log(err);
  if (err.errors.name && err.errors.name.kind == 'unique') {
    throw boom.badRequest(err.errors.name.message);
  } else if (err.errors.email && err.errors.email.kind == 'unique') {
    throw boom.badRequest(err.errors.email.message);
  }
  next();
};

userSchema.post('save', handleE11000);
userSchema.post('update', handleE11000);
userSchema.post('findOneAndUpdate', handleE11000);
userSchema.post('insertMany', handleE11000);


const User = mongoose.model('User', userSchema);

module.exports = User;
