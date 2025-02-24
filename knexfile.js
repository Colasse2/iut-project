'use strict';

const Path = require('path');
const Hoek = require('@hapi/hoek');
const Manifest = require('./server/manifest');
const Plugin = require('./lib/plugins/@hapipal.schwifty');

module.exports = Hoek.applyToDefaults(
    {
        migrations: {
            directory: Path.relative(process.cwd(), Plugin.options.migrationsDir)
        }
    },
    Manifest
        .get('/register/plugins', process.env)
        .find(({ plugin }) => plugin === '@hapipal/schwifty')
        .options.knex
);
