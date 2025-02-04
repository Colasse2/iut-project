'use strict';

module.exports = {

    async up(knex) {

        await knex.schema.alterTable('user', (table) => {


            table.string('password').notNull();
            table.string('mail').notNull();
            table.string('username').notNull();
        });
    },

    async down(knex) {

        await knex.schema.dropTableIfExists('user');
    }
};