'use strict';

module.exports = {

    async up(knex) {


        await knex.schema.createTable('movies', (table) => {
            table.increments('id').primary();
            table.string('title').notNull();
            table.text('description').notNull();
            table.date('releaseDate').notNull();
            table.string('director').notNull();

            table.dateTime('createdAt').notNull().defaultTo(knex.fn.now());
            table.dateTime('updatedAt').notNull().defaultTo(knex.fn.now());
        });


        await knex.schema.createTable('user_movies', (table) => {
            table.integer('userId').unsigned().notNull();
            table.integer('movieId').unsigned().notNull();
            table.primary(['userId', 'movieId']);


            table.foreign('userId').references('id').inTable('user').onDelete('CASCADE');
            table.foreign('movieId').references('id').inTable('movies').onDelete('CASCADE');
        });
    },

    async down(knex) {


        await knex.schema.dropTableIfExists('user_movies');
        await knex.schema.dropTableIfExists('movies');
    }
};
