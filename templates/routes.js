const Boom = require('boom');
const Joi = require('joi');
const JWT = require('jsonwebtoken');

const TRY_TOKEN = { mode: 'try', strategy: 'jwt' };


module.exports = [
    {
        method: 'GET',
        path: '/{{ROUTE}}',
        config: {
            handler (request, reply) {
                reply('Find me in app/server/routes/{{ROUTE}}-routes.js');
            }
        }
    }
];