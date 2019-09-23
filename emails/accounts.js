const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (name, email) => {
  sgMail.send({
    to: email,
    from: 'mahmoudzeyada440@gmail.com',
    subject: 'Thanks for joining in !',
    text: `Welcome to the app ${name}. 
    let me know how you get along with the app`,
  });
};

const sendCancellationEmail = (name, email) => {
  sgMail.send({
    to: email,
    from: 'mahmoudzeyada440@gmail.com',
    subject: 'Sorry for seeing you go !',
    text: `Hi ${name},can you send us a feed back why you deleted your account`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail,
};