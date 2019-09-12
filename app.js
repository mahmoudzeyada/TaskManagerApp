const  createError = require('http-errors');
const  express = require('express');
const  path = require('path');
const  cookieParser = require('cookie-parser');
const  logger = require('morgan');

const  indexRouter = require('./routes/index');
const  usersRouter = require('./routes/users');

require('./models/dbConnections');
const User = require('./models/users');
const Task = require('./models/tasks');


const  app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// creating Users endpoint
app.post('/users', (req, res) => {
  const user = new User(req.body);
  user.save().then(() => {
    res.status(201).send(user);
  }).catch((err) => {
    res.status(400).send(err);
  });
});


// creating Tasks endpoint
app.post('/tasks', (req, res) => {
  const task = new Task(req.body);
  task.save().then(() => {
    res.status(201).send(task);
  }).catch((err) => {
    res.status(400).send(err);
  });
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
