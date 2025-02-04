'use strict';

const Joi = require('joi')

module.exports = {
    method: 'get',
    path: '/users',
    options: {
        tags: ['api']
    },
    handler: async (request, h) => {
        const { User } = request.models();

        const users = await User.query();

        return users;
    },
};
