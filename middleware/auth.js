const jwt = require('jsonwebtoken');

const User = require('../models/users');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decode = jwt.verify(token, 'thisisasecretKey');
    const user = await User.findOne({'_id': decode._id, 'tokens.token': token});
    if (!user) {
      throw new Error();
    }
    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    res.status(401).send({error: 'authentication cardinalities are wrong'});
  }
};

module.exports = auth;
