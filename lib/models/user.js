'use strict';

const Joi = require('joi');
const { Model } = require('@hapipal/schwifty');
const Movie = require('./Movie');

module.exports = class User extends Model {
    static get tableName() {
        return 'user';

    }

    static get joiSchema() {
        return Joi.object({
            id: Joi.number().integer().greater(0),
            firstName: Joi.string().min(3).example('John').description('Firstname of the user'),
            lastName: Joi.string().min(3).example('Doe').description('Lastname of the user'),
            mail: Joi.string().email(),
            password: Joi.string(),
            username: Joi.string(),
            roles: Joi.array().items(Joi.string()).default(['user']),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        });
    }

    $beforeInsert(queryContext) {
        this.updatedAt = new Date();
        this.createdAt = this.updatedAt;
        if (!this.roles) {
            this.roles = ['user'];
        }
    }

    $beforeUpdate(opt, queryContext) {
        this.updatedAt = new Date();
    }

    static get jsonAttributes() {
        return ['roles'];
    }

    static get relationMappings() {
        return {
            favorites: {
                relation: Model.ManyToManyRelation,
                modelClass: Movie,
                join: {
                    from: 'user.id',
                    through: {
                        from: 'user_movies.userId',
                        to: 'user_movies.movieId'
                    },
                    to: 'movies.id'
                }
            }
        };
    }
};
