'use strict';

const Joi = require('joi');
const MailService = require('../services/mailService');

async function updateMovieInDatabase(id, payload) {
    return {
        id: id,
        title: 'truc',
        description: 'blabla',
        releaseDate: new Date(),
        director: 'chose',
    };
}

module.exports = [
    {
        method: 'POST',
        path: '/movie',
        options: {
            tags: ['api'],
            auth: {
                scope: ['admin']
            },
            validate: {
                payload: Joi.object({
                    title: Joi.string().required().min(3).description('Titre du movie'),
                    description: Joi.string().required().min(10).description('Description du movie'),
                    releaseDate: Joi.date().required().description('Date de sortie du movie'),
                    director: Joi.string().required().min(3).description('Réalisateur du movie'),
                })
            }
        },
        handler: async (request, h) => {
            const { Movie, User } = request.models();

            const movieData = {
                title: 'Sample Movie',
                description: 'This is a sample movie description',
                releaseDate: '2025-02-23',
                director: 'Sample Director'
            };

            const movie = await Movie.query().insert(movieData);

            // Récupérer tous les utilisateurs pour envoyer l'email
            const users = await User.query();
            for (const user of users) {
                console.log(user)
                const mailservice = new MailService(request.server)
                await mailservice.sendMovieNotificationEmail(user.mail, movie);
            }

            return h.response({ message: 'Movie created successfully', movie }).code(201);
        }
    }
    ,

    {
        method: 'PATCH',
        path: '/movie/{id}',
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
                    title: Joi.string().min(3).description('Titre du movie'),
                    description: Joi.string().min(10).description('Description du movie'),
                    releaseDate: Joi.date().description('Date de sortie du movie'),
                    director: Joi.string().min(3).description('Réalisateur du movie'),
                }).min(1)
            }
        },
        handler: async (request, h) => {
            const { id } = request.params;
            const payload = request.payload;
            const { Movie, User } = request.models();

            // Format releaseDate if provided
            if (payload.releaseDate) {
                payload.releaseDate = new Date(payload.releaseDate).toISOString().split('T')[0];
            }

            const updatedMovie = await Movie.query().patchAndFetchById(id, payload);
            if (!updatedMovie) {
                return h.response({ message: 'Movie not found' }).code(404);
            }

            // Récupérer les utilisateurs qui ont ce film en favori
            const users = await User.query().joinRelated('favorites').where('favorites.id', id);
            for (const user of users) {
                console.log(user)
                const mailservice = new MailService(request.server)
                await mailservice.sendMovieNotificationEmail(user.mail, updatedMovie);
            }

            return h.response({ message: 'Movie updated successfully', movie: updatedMovie }).code(200);
        }
    }
    ,


    {
        method: 'DELETE',
        path: '/movie/{id}',
        options: {
            tags: ['api'],
            auth: {
                scope: ['admin']
            },
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                })
            }
        },
        handler: async (request, h) => {
            const { id } = request.params;
            const { Movie } = request.models();
            const deletedMovie = await Movie.query().deleteById(id);
            if (!deletedMovie) {
                return h.response({ message: 'Movie not found' }).code(404);
            }
            return h.response({ message: 'Movie deleted successfully' }).code(204);
        }
    },

    {
        method: 'POST',
        path: '/movie/{id}/favorite',
        options: {
            tags: ['api'],
            auth: {
                scope: ['user', 'admin']
            },
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                })
            }
        },
        handler: async (request, h) => {
            try {
                const { id } = request.params;
                const { User, Movie } = request.models();
                const { userId } = request.auth.credentials;

                if (!id || !userId) {
                    return h.response({ message: 'Invalid movie ID or user ID' }).code(400);
                }

                const user = await User.query().findById(userId).withGraphFetched('favorites');
                if (!user) {
                    return h.response({ message: 'User not found' }).code(404);
                }

                // Check if the movie exists
                const movie = await Movie.query().findById(id);
                if (!movie) {
                    return h.response({ message: 'Movie not found' }).code(404);
                }

                if (user.favorites && user.favorites.some(fav => fav.id === parseInt(id))) {
                    return h.response({ message: 'Movie is already in your favorites' }).code(400);
                }

                await user.$relatedQuery('favorites').relate(id);
                return h.response({ message: 'Movie added to favorites' }).code(200);
            } catch (error) {
                console.error('Error adding movie to favorites:', error);
                return h.response({ message: 'Internal server error' }).code(500);
            }
        }
    },

    {
        method: 'DELETE',
        path: '/movie/{id}/favorite',
        options: {
            tags: ['api'],
            auth: {
                scope: ['user', 'admin']
            },
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                })
            }
        },
        handler: async (request, h) => {
            try {
                const { id } = request.params;
                const { User, Movie } = request.models();
                const { userId } = request.auth.credentials;

                if (!id || !userId) {
                    return h.response({ message: 'Invalid movie ID or user ID' }).code(400);
                }

                const user = await User.query().findById(userId).withGraphFetched('favorites');
                if (!user) {
                    return h.response({ message: 'User not found' }).code(404);
                }

                // Check if the movie exists
                const movie = await Movie.query().findById(id);
                if (!movie) {
                    return h.response({ message: 'Movie not found' }).code(404);
                }

                const movieInFavorites = user.favorites && user.favorites.some(fav => fav.id === parseInt(id));
                if (!movieInFavorites) {
                    return h.response({ message: 'Movie not in your favorites' }).code(400);
                }

                await user.$relatedQuery('favorites').unrelate().where('movieId', id);
                return h.response({ message: 'Movie removed from favorites' }).code(200);
            } catch (error) {
                console.error('Error removing movie from favorites:', error);
                return h.response({ message: 'Internal server error' }).code(500);
            }
        }
    }
    ,

    {
        method: 'GET',
        path: '/movie',
        options: {
            tags: ['api'],
            auth: false,
        },
        handler: async (request, h) => {
            const { Movie } = request.models();
            const movies = await Movie.query();
            if (!movies || movies.length === 0) {
                return h.response({ message: 'No movies found' }).code(404);
            }
            return h.response(movies).code(200);
        }
    }
];
