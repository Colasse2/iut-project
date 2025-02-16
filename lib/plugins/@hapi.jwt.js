'use strict';

const Jwt = require('@hapi/jwt');


const token = Jwt.token.generate(
    {
        aud: 'urn:audience:iut',
        iss: 'urn:issuer:iut',
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        scope: '' //Le scope du user
    },
    {
        key: 'random_string', // La clé qui est définit dans lib/auth/strategies/jwt.js
        algorithm: 'HS512'
    },
    {
        ttlSec: 14400 // 4 hours
    }
);