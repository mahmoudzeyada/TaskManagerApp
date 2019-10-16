/* eslint-disable no-invalid-this */
const mongoose = require('mongoose');
const crypto = require('crypto');

const Schema = mongoose.Schema;

// Schema for saving users their tokens for getting passwords
const passwordChangeSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  visited: {
    type: Boolean,
    default: false,
  },

}, {timestamps: true});

// Method for generating tokens for users
passwordChangeSchema.statics.generateTokens = function() {
  return crypto.randomBytes(20).toString('hex');
};

// Method for find by token and returning user
passwordChangeSchema.statics.findByToken = async function(token) {
  token = crypto.createHash('sha256')
      .update(token).digest('base64');
  const entry = await PasswordChange.findOne({token: token});
  return entry.owner;
};

// Hook for hashing tokens for improving security
passwordChangeSchema.pre('save', async function() {
  const entry = this;
  if (entry.isModified('token')) {
    entry.token = crypto.createHash('sha256')
        .update(entry.token).digest('base64');
  }
});

const PasswordChange = mongoose.model('PasswordChange', passwordChangeSchema);

module.exports = PasswordChange;

