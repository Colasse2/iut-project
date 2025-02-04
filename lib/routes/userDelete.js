'use strict';

const Joi = require('joi')

module.exports = {
    method: 'DELETE',
    path: '/user/{id}',
    options: {
        tags: ['api'],
        validate: {
            params: Joi.object({
                id: Joi.number().integer().required()
            })
        },
        handler: async (request, h) => {
            const { User } = request.models()
            const { id } = request.params
            await User.query().deleteById(id)
            return h.response().code(204)
        }
    }
}