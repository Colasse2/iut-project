'use strict';

require('dotenv').config();
const nodemailer = require('nodemailer');
const { Service } = require('@hapipal/schmervice');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

module.exports = class MailService extends Service {
    constructor(server) {
        super(server);
    }

    async sendWelcomeEmail(email, firstName) {
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
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

    async sendMovieNotificationEmail(email, movie) {
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: `Nouveau film ajouté : ${movie.title}`,
            text: `Bonjour, un nouveau film intitulé "${movie.title}" a été ajouté sur notre plateforme. Découvrez-le maintenant!\n\nRésumé: ${movie.description}\n\nL'équipe.`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Email de notification envoyé avec succès!');
        } catch (error) {
            console.error('Erreur d\'envoi d\'email:', error);
        }
    }

    async sendCsvEmail(email, csv) {
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Export de films',
            text: 'Veuillez trouver ci-joint le fichier CSV contenant les films exportés.',
            attachments: [
                {
                    filename: 'movies.csv',
                    content: csv
                }
            ]
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Email avec CSV envoyé avec succès!');
        } catch (error) {
            console.error('Erreur d\'envoi d\'email avec CSV:', error);
        }
    }
};