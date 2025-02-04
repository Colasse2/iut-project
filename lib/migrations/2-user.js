'use strict';

module.exports = {

    async up(knex) {

        await knex.schema.alterTable('user', (table) => {


            table.string('roles',
        });
    },

    async down(knex) {

        await knex.schema.dropTableIfExists('user');
    }
};