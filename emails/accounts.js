/* eslint-disable max-len */
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

const sendResetPasswordEmail = (token, {email, name}) => {
  sgMail.send({
    to: email,
    from: 'mahmoudzeyada440@gmail.com',
    subject: 'Reset Password Request!',
    text: `Hi ${name} receiving this e-mail because you requested a password reset for your user account at PythonAnywhere.
          Please go to the following page and choose a new password:
          http://${process.env.url}/forget_password/confirm/${token}/
          Your username, in case you've forgotten: ${name}
          Thanks for using our site!
          PS (this url we be valid for only 15 minutes if you did not send this request please just ignore it)`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail,
  sendResetPasswordEmail,
};
