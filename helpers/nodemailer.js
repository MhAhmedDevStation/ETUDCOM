const nodemailer = require('nodemailer');
const { SERVER_PORT } = require('../config');

const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'isitcom.rnu@gmail.com',
        pass: 'dhwjvnhbqifwuggq'
    }
});

module.exports.sendConfirmationEmail = (email, token) => {
    transport
        .sendMail({
            from: 'isitcom.rnu@gmail.com',
            to: email,
            subject: 'Confirmer votre compte',
            html: `
            <h2> cliquez sur le lien donné pour activer votre compte </h2>
            <p>${process.env.SERVER_URL}${SERVER_PORT}${process.env.API_URL}/users/auth/email-activate/${token}</p>
            `
        })
        .catch((err) => console.log(err));
};
module.exports.sendforgotPasswordEmail = (email, token) => {
    transport
        .sendMail({
            from: 'isitcom.rnu@gmail.com',
            to: email,
            subject: ' Réinitialisation du mot de passe ',
            html: `
          <h2> veuillez cliquer sur le lien donné pour réinitialiser votre mot de passe </h2>
          <p>${process.env.CLIENT_URL}/auth/resetpassword/${token}</p>
          `
        })
        .catch((err) => console.log(err));
};
module.exports.sendVerificationEmail = (email, token) => {
    transport
        .sendMail({
            from: 'isitcom.rnu@gmail.com',
            to: email,
            subject: 'Vérifier votre compte',
            html: `
            <h2> Veuillez vérifier que vos données personnelles sont correctes si elles ne sont pas correctes, veuillez les modifier  </h2>
            `
        })
        .catch((err) => console.log(err));
};
