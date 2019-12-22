const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

const errorFunction = err => {
  if (err) {
    throw new Error(err);
  } else {
    console.info(err);
  }
};

const sendWelcomeEmail = (name, email) => {
  transporter.sendMail(
    {
      to: email,
      from: process.env.EMAIL,
      subject: "Thanks for joining in !",
      text: `Welcome to the app ${name}. 
    let me know how you get along with the app`
    },
    errorFunction
  );
};

const sendCancellationEmail = (name, email) => {
  transporter.sendMail(
    {
      to: email,
      from: process.env.EMAIL,
      subject: "Sorry for seeing you go !",
      text: `Hi ${name},can you send us a feed back why you deleted your account`
    },
    errorFunction
  );
};

const sendResetPasswordEmail = (token, { email, name }) => {
  transporter.sendMail(
    {
      to: email,
      from: process.env.EMAIL,
      subject: "Reset Password Request!",
      text: `Hi ${name} receiving this e-mail because you requested a password reset for your user account at PythonAnywhere.
          Please go to the following page and choose a new password:
          http://${process.env.url}/reset-password/${token}/
          Your username, in case you've forgotten: ${name}
          Thanks for using our site!
          PS (this url we be valid for only 15 minutes if you did not send this request please just ignore it)`
    },
    errorFunction
  );
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail,
  sendResetPasswordEmail
};
