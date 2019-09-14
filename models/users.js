const validator = require('validator');
const bcrypt = require('bcryptjs');
const mongoose= require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,

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
});

userSchema.pre('save', async function() {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});


const User = mongoose.model('User', userSchema);

module.exports = User;
