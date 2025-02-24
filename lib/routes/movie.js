'use strict';

const Joi = require('joi');
const MailService = require('../services/mailService');
const { Parser } = require('json2csv');
const amqp = require('amqplib');

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
            const mailService = new MailService(request.server);

            const movieData = {
                title: 'Sample Movie',
                description: 'This is a sample movie description',
                releaseDate: '2025-02-23',
                director: 'Sample Director'
            };

            try {
                const movie = await Movie.query().insert(movieData);

                const users = await User.query();
                for (const user of users) {
                    await mailService.sendMovieNotificationEmail(user.mail, movie);
                }

                return h.response({ message: 'Movie created successfully', movie }).code(201);
            } catch (error) {
                console.error('Error creating movie:', error);
                return h.response({ message: 'Internal server error' }).code(500);
            }
        }
    },
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
                    releaseDate: Joi.date().description('Date de sortie du movie'),
                    director: Joi.string().min(3).description('Réalisateur du movie'),
                }).min(1)
            }
        },
        handler: async (request, h) => {
            const { id } = request.params;
            const payload = request.payload;
            const { Movie, User } = request.models();
            const mailService = new MailService(request.server);

            if (payload.releaseDate) {
                payload.releaseDate = new Date(payload.releaseDate).toISOString().split('T')[0];
            }

            try {
                const updatedMovie = await Movie.query().patchAndFetchById(id, payload);
                if (!updatedMovie) {
                    return h.response({ message: 'Movie not found' }).code(404);
                }

                const users = await User.query().joinRelated('favorites').where('favorites.id', id);
                for (const user of users) {
                    await mailService.sendMovieNotificationEmail(user.mail, updatedMovie);
                }

                return h.response({ message: 'Movie updated successfully', movie: updatedMovie }).code(200);
            } catch (error) {
                console.error('Error updating movie:', error);
                return h.response({ message: 'Internal server error' }).code(500);
            }
        }
    },
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
            try {
                const deletedMovie = await Movie.query().deleteById(id);
                if (!deletedMovie) {
                    return h.response({ message: 'Movie not found' }).code(404);
                }
                return h.response({ message: 'Movie deleted successfully' }).code(204);
            } catch (error) {
                console.error('Error deleting movie:', error);
                return h.response({ message: 'Internal server error' }).code(500);
            }
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
    },
    {
        method: 'GET',
        path: '/movie',
        options: {
            tags: ['api'],
            auth: false,
        },
        handler: async (request, h) => {
            const { Movie } = request.models();
            try {
                const movies = await Movie.query();
                if (!movies || movies.length === 0) {
                    return h.response({ message: 'No movies found' }).code(404);
                }
                return h.response(movies).code(200);
            } catch (error) {
                console.error('Error fetching movies:', error);
                return h.response({ message: 'Internal server error' }).code(500);
            }
        }
    },
    {
        method: 'GET',
        path: '/movie/export',
        options: {
            tags: ['api'],
            auth: { scope: ['admin'] }
        },
        handler: async (request, h) => {
            const { Movie } = request.models();
            const { email } = request.auth.credentials;
            const mailService = new MailService(request.server);

            try {
                const movies = await Movie.query();
                if (!movies.length) {
                    return h.response({ message: 'No movies found' }).code(404);
                }

                const fields = [
                    { label: 'id', value: 'id' },
                    { label: 'title', value: 'title' },
                    { label: 'description', value: 'description' },
                    { label: 'releaseDate', value: 'releaseDate' },
                    { label: 'director', value: 'director' }
                ];
                const opts = { fields, delimiter: ',' }; // Specify the delimiter
                const json2csvParser = new Parser(opts);
                const csv = json2csvParser.parse(movies);

                // Send email with CSV
                await mailService.sendCsvEmail(email, csv);

                return h.response({ message: 'Export in progress. You will receive an email.' }).code(202);
            } catch (error) {
                console.error('Error exporting movies:', error);
                return h.response({ message: 'Internal server error' }).code(500);
            }
        }
    }
];