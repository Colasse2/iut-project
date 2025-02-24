const { Model } = require('objection');
const User = require('./User');

class Movie extends Model {
    static get tableName() {
        return 'movies';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['title', 'description', 'releaseDate', 'director'],
            properties: {
                id: { type: 'integer' },
                title: { type: 'string', minLength: 3 },
                description: { type: 'string', minLength: 10 },
                releaseDate: { type: 'string' },
                director: { type: 'string', minLength: 3 },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
            }
        };
    }

    static get relationMappings() {
        return {
            favorites: {
                relation: Model.ManyToManyRelation,
                modelClass: User,
                join: {
                    from: 'movies.id',
                    through: {
                        from: 'user_movies.movieId',
                        to: 'user_movies.userId'
                    },
                    to: 'user.id'
                }
            }
        };
    }

    $beforeInsert(queryContext) {
        const currentDate = new Date();
        this.updatedAt = currentDate.toISOString().split('T')[0] + ' ' + currentDate.toTimeString().split(' ')[0]; // Format to 'YYYY-MM-DD HH:MM:SS'
        this.createdAt = this.updatedAt;

        if (this.releaseDate) {
            if (this.releaseDate instanceof Date) {
                this.releaseDate = this.releaseDate.toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD'
            } else {
                this.releaseDate = new Date(this.releaseDate).toISOString().split('T')[0];
            }
        }
    }

    $beforeUpdate(opt, queryContext) {
        this.updatedAt = new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0];  // Format to 'YYYY-MM-DD HH:MM:SS'
    }
}

module.exports = Movie;
