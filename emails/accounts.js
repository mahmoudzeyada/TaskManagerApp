const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');

const sendWelcomeEmail = (name, email) => {
  sgMail.send({
    to: email,
    from: 'mahmoudzeyada440@gmail.com',
    subject: 'Thanks for joining in !',
    text: `Welcome to the app ${name}. 
    let me know how you get along with the app`,
  });
};

exports.sendWelcomeEmail = sendWelcomeEmail;

