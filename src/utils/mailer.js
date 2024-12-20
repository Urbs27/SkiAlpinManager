const nodemailer = require('nodemailer');
const config = require('../config/env');

const transporter = nodemailer.createTransport({
    service: config.mail.service,
    auth: {
        user: config.mail.user,
        pass: config.mail.pass
    }
});

const sendEmail = async (to, subject, text, html) => {
    const mailOptions = {
        from: config.mail.user,
        to,
        subject,
        text,
        html
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-Mail gesendet an: ${to}`);
    } catch (error) {
        console.error('Fehler beim Senden der E-Mail:', error);
    }
};

module.exports = {
    sendEmail
};