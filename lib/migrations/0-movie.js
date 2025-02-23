'use strict';

module.exports = {

    async up(knex) {

        // Création de la table 'movies'
        await knex.schema.createTable('movies', (table) => {
            table.increments('id').primary();               // ID du film
            table.string('title').notNull();                // Titre du film
            table.text('description').notNull();            // Description du film
            table.date('releaseDate').notNull();            // Date de sortie du film
            table.string('director').notNull();             // Réalisateur du film

            table.dateTime('createdAt').notNull().defaultTo(knex.fn.now()); // Date de création
            table.dateTime('updatedAt').notNull().defaultTo(knex.fn.now()); // Date de mise à jour
        });

        // Création de la table 'user_movies' pour les films favoris
        await knex.schema.createTable('user_movies', (table) => {
            table.integer('userId').unsigned().notNull();    // ID de l'utilisateur
            table.integer('movieId').unsigned().notNull();   // ID du film
            table.primary(['userId', 'movieId']);             // Clé primaire composée des deux champs

            // Définition des clés étrangères
            table.foreign('userId').references('id').inTable('user').onDelete('CASCADE');   // Relation avec 'user'
            table.foreign('movieId').references('id').inTable('movies').onDelete('CASCADE'); // Relation avec 'movies'
        });
    },

    async down(knex) {

        // Suppression des tables 'user_movies' et 'movies'
        await knex.schema.dropTableIfExists('user_movies');
        await knex.schema.dropTableIfExists('movies');
    }
};
