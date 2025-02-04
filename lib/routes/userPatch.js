'use strict';

const Joi = require('joi');
const {date} = require("joi");

async function updateUserInDatabase(id, payload) {
    const user = {
        id: id,
        firstName: 'John',
        lastName: 'Doe',
        updatedAt: new Date(),
        password: 'password',
        mail: 'john11.doe@gmail.com'

    }
    return user;

}

module.exports = {
    method: 'PATCH',
    path: '/user/{id}',
    options: {
        tags: ['api'],
        validate: {
            params: Joi.object({
                id: Joi.number().integer().required()
            }),
            payload: Joi.object({
                id: Joi.number().integer().example(1).description('Id of the user'),
                firstName: Joi.string().min(3).example('John').description('Firstname of the user'),
                lastName: Joi.string().min(3).example('Doe').description('Lastname of the user'),
                password: Joi.string().min(8).example('password').description('Password of the user'),
                mail: Joi.string().email().example('john.doe@gmail.com').description('Mail of the user')
            }).min(1) // S'assurer qu'au moins un champ est fourni
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
        },

    }
};

