'use strict';

const Joi = require('joi');
const Jwt = require('@hapi/jwt');
const Encrypt = require('@levraisebi/iut-encrypt');

async function updateUserInDatabase(id, payload) {
    return {
        id: id,
        firstName: 'John',
        lastName: 'Doe',
        updatedAt: new Date(),
        password: 'password',
        mail: 'john11.doe@gmail.com',
        scope: 'user'
    };
}

module.exports = [
    {
        method: 'DELETE',
        path: '/user/{id}',
        options: {
            tags: ['api'],
            auth: {
                scope: ['admin']
            },
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                })
            },
            handler: async (request, h) => {
                const { User } = request.models();
                const { id } = request.params;
                await User.query().deleteById(id);
                return h.response().code(204);
            }
        }
    },
    {
        method: 'PATCH',
        path: '/user/{id}',
        options: {
            tags: ['api'],
            auth: {
                scope: ['admin']
            },
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                }),
                payload: Joi.object({
                    firstName: Joi.string().min(3).example('John').description('Firstname of the user'),
                    lastName: Joi.string().min(3).example('Doe').description('Lastname of the user'),
                    password: Joi.string().min(8).example('password').description('Password of the user'),
                    mail: Joi.string().email().example('john.doe@gmail.com').description('Mail of the user'),
                    scope: Joi.string().valid('user', 'admin').description('Scope of the user')
                }).min(1)
            },
            handler: async (request, h) => {
                const { id } = request.params;
                const payload = request.payload;
                try {
                    const updatedUser = await updateUserInDatabase(id, payload);
                    if (!updatedUser) {
                        return h.response({ message: 'User not found' }).code(404);
                    }
                    return h.response({ message: 'User updated successfully', user: updatedUser }).code(200);
                } catch (error) {
                    console.error(error);
                    return h.response({ message: 'Internal Server Error' }).code(500);
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/users',
        options: {
            tags: ['api'],
            auth: {
                scope: ['user', 'admin']
            },
        },
        handler: async (request, h) => {
            const { User } = request.models();
            const users = await User.query();
            return users;
        }
    },
    {
        method: 'POST',
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
                    })
                })
            },
            handler: async (request, h) => {
                const { User } = request.models();
                const { mail, password } = request.payload;
                const user = await User.query().findOne({ mail, password });
                if (!user) {
                    return h.response({ login: 'failed' }).code(401);
                }
                return {
                    token: Jwt.token.generate({
                        aud: 'urn:audience:iut',
                        iss: 'urn:issuer:iut',
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'test@example.com',
                        scope: 'admin'
                    }, {
                        key: 'random_string',
                        algorithm: 'HS512'
                    }, {
                        ttlSec: 14400
                    })
                };
            }
        }
    },
    {
        method: 'post',
        path: '/user',
        options: {
            tags:['api'],
            auth: false,
            validate: {
                payload: Joi.object({

                    firstName: Joi.string().required().min(3).example('John').description('Firstname of the user'),
                    lastName: Joi.string().required().min(3).example('Doe').description('Lastname of the user'),
                    password: Joi.string().required().min(8).example('password').description('Password of the user').custom((value, helpers) => {
                        return Encrypt.sha1(value);
                    }),
                    mail: Joi.string().required().email().example('john.doe@gmail.com').description('Mail of the user'),
                    username : Joi.string().required().min(3).example('johndoe').description('Username of the user')
                })
            }
        },
        handler: async (request, h) => {

            const { userService } = request.services();

            return userService.create(request.payload);
        }
    }
];
