'use strict';

const Jwt = require('@hapi/jwt');
const Joi = require('joi');
const Encrypt = require('@levraisebi/iut-encrypt');

module.exports = {
    method: 'post',
    path: '/user/login',
    options: {
        tags: ['api'],
        auth: false,
        validate: {
            payload: Joi.object({
                mail: Joi.string().required().email().example('john.doe@gmail.com').description('Mail of the user'),
                password: Joi.string().required().min(8).example('password').description('Password of the user').custom((value, helpers) => {
                    try {
                        return Encrypt.sha1(value);
                    } catch (err) {
                        return helpers.error('any.invalid');
                    }
                }),
            })
        },
        handler: async (request, h) => {
            const {User} = request.models();
            const {mail, password} = request.payload;
            const user = await User
                .query()
                .findOne({mail, password});
            if (!user) {
                return h.response({login: 'failed'}).code(401);
            }
            return {
                token: Jwt.token.generate({
                        aud: 'urn:audience:iut',
                        iss: 'urn:issuer:iut',
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'test@example.com',
                        scope: '' //Le scope du user
                    },
                    {
                        key: 'random_string', // La clé qui est définit dans lib/auth/strategies/jwt.js
                        algorithm: 'HS512'
                    },
                    {
                        ttlSec: 14400 // 4 hours
                    }
                )
            };
        }}};