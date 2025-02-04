'use strict';

const Joi = require('joi')
const Encrypt = require('@levraisebi/iut-encrypt');

module.exports = {
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
};