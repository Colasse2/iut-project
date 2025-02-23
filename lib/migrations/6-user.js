'use strict';

module.exports = {
    async up(knex) {
        await knex.schema.alterTable('user', (table) => {
            table.string('email').notNullable().defaultTo('default@example.com').alter();
        });
    },

    async down(knex) {
        await knex.schema.alterTable('user', (table) => {
            table.dropColumn('email');
        });
    }
};
