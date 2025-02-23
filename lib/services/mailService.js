'use strict';

// Charger les variables d'environnement
require('dotenv').config();

const nodemailer = require('nodemailer');
const { Service } = require('@hapipal/schmervice');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,  // récupère MAIL_HOST depuis .env
    port: process.env.MAIL_PORT,  // récupère MAIL_PORT depuis .env
    secure: false,                // true pour 465, false pour autres ports
    auth: {
        user: process.env.MAIL_USER,  // récupère MAIL_USER depuis .env
        pass: process.env.MAIL_PASS   // récupère MAIL_PASS depuis .env
    }
});

module.exports = class MailService extends Service {
    constructor(server) {
        super(server);
    }

    async sendWelcomeEmail(email, firstName) {
        const mailOptions = {
            from: process.env.MAIL_USER,  // récupère l'email de l'expéditeur depuis .env
            to: email,                    // email du destinataire
            subject: 'Bienvenue chez nous!',
            text: `Bonjour ${firstName},\n\nMerci de vous être inscrit sur notre plateforme! Nous sommes heureux de vous avoir parmi nous.\n\nL'équipe.`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Email envoyé avec succès!');
        } catch (error) {
            console.error('Erreur d\'envoi d\'email:', error);
        }
    }
};
