const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const defaultImagePath = "uploads/defaultTask.png";

const taskSchema = new Schema(
  {
    description: {
      type: String,
      trim: true,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: defaultImagePath
    },
    completed: {
      type: Boolean,
      default: false
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
