const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const boom = require("@hapi/boom");
const cors = require("cors");

const tasksRouter = require("./routes/tasks");
const usersRouter = require("./routes/users");

require("./models/dbConnections");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(usersRouter);
app.use(tasksRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(boom.notFound("missing"));
});

// error handler
app.use(function(err, req, res, next) {
  if (err.isServer) {
    console.log(err);
  }
  return res.status(err.output.statusCode).json(err.output.payload);
});

module.exports = app;
