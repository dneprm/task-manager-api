const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'mariya.turko@isky.solutions',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}! Let me know how you get along with the app.`
    });
};

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'mariya.turko@isky.solutions',
        subject: 'Good bye!',
        text: `Dear ${name}! Please, let us know if there is anything we could have done to keep you onboard!`
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
};