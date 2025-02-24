
exports.up = function(knex) {
    return knex.schema.table('user', function(table) {
        table.string('scope').notNullable().defaultTo('user');
    });
};

exports.down = function(knex) {
    return knex.schema.table('user', function(table) {
        table.dropColumn('scope');
    });
};