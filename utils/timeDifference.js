const moment = require('moment');

// overriding default function for always calculating time diff in minutes
moment.fn.fromNow = function(a) {
  const duration = moment().diff(this, 'minutes');
  return duration;
};

const timeDifference = (date) => {
  const diff = moment(date, 'YYYYMMDD').fromNow();
  console.log(diff);
  if (diff > 15) {
    return false;
  }
  return true;
};


module.exports = timeDifference;
