'use strict';

module.exports = {

    async down(knex) {
        await knex.schema.alterTable('user', (table) => {
            table.dropColumn('email');
        });
    }
};
