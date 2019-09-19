const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose= require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('age must be positive number');
      };
    },

  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
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
});

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
  return user;
};

// Method On User Instance For Creating JWT Tokens
userSchema.methods.generateAuthTokens = async function() {
  const user = this;
  const token = jwt.sign({_id: user._id.toString()}, 'thisisasecretKey');
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
      throw new Error('unable to login');
    }
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('unable to login');
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


const User = mongoose.model('User', userSchema);

module.exports = User;
