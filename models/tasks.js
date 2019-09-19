const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const taskSchema = new Schema({
  description: {
    type: String,
    trim: true,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {timestamps: true});


const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
