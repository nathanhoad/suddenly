const Boom = require('boom');
const Joi = require('joi');
const Prerequisites = require('app/server/prerequisites');
const {{MODEL_CLASS}} = require('app/server/models/{{MODEL_LOWERCASE}}');
const {{MODEL_CLASS}}Resource = require('app/server/resources/{{MODEL_LOWERCASE}}-resource');

const TRY_TOKEN = { mode: 'try', strategy: 'jwt' };


module.exports = [
    {
        method: 'GET',
        path: '/app/{{ROUTE}}',
        config: {
            auth: TRY_TOKEN,
            handler (request, reply) {
                let filter = {};
                
                {{MODEL_CLASS}}.where(filter).fetchAll().then(({{MODELS_LOWERCASE}}) => {
                    {{MODELS_LOWERCASE}} = {{MODELS_LOWERCASE}}.map(request.auth.isAuthenticated ? {{MODEL_CLASS}}Resource.private : {{MODEL_CLASS}}Resource.public);
                    reply({{MODELS_LOWERCASE}});
                });
            }
        }
    },
    {
        method: 'POST',
        path: '/app/{{ROUTE}}',
        config: {
            auth: 'jwt',
            validate: {
                payload: Joi.object({
                    // Add in payload validation
                    // ...
               }).options({ abortEarly: false, stripUnknown: true })
            },
            handler (request, reply) {
                {{MODEL_CLASS}}.create(request.payload).then(({{MODEL_LOWERCASE}}) => {
                    reply({{MODEL_CLASS}}Resource.private({{MODEL_LOWERCASE}}));
                }).catch((err) => {
                    reply(Boom.badRequest());
                });
            }
        }
    },
    {
        method: 'GET',
        path: '/app/{{ROUTE}}/{{{MODEL_LOWERCASE}}}',
        config: {
            auth: TRY_TOKEN,
            pre: Prerequisites.use('{{MODEL_LOWERCASE}}'),
            handler (request, reply) {
                if (!request.pre.{{MODEL_LOWERCASE}}) return reply(Boom.notFound());
                
                reply(request.auth.isAuthenticated ? {{MODEL_CLASS}}Resource.private(request.pre.{{MODEL_LOWERCASE}}) : {{MODEL_CLASS}}Resource.public(request.pre.{{MODEL_LOWERCASE}}));
            }
        }
    },
    {
        method: 'PUT',
        path: '/app/{{ROUTE}}/{{{MODEL_LOWERCASE}}}',
        config: {
            auth: 'jwt',
            validate: {
                payload: Joi.object({
                    slug: Joi.string().allow(null),
                    // Add in payload validation
                    // ...
                }).options({ abortEarly: false, stripUnknown: true })
            },
            pre: Prerequisites.use('{{MODEL_LOWERCASE}}'),
            handler (request, reply) {
                if (!request.pre.{{MODEL_LOWERCASE}}) return reply(Boom.notFound());
                
                request.pre.{{MODEL_LOWERCASE}}.update(request.payload).then(({{MODEL_LOWERCASE}}) => {
                    reply({{MODEL_CLASS}}Resource.private({{MODEL_LOWERCASE}}));
                }).catch((err) => {
                    reply(Boom.badRequest());
                });
            }
        }
    },
    {
        method: 'DELETE',
        path: '/app/{{ROUTE}}/{{{MODEL_LOWERCASE}}}',
        config: {
            auth: 'jwt',
            pre: Prerequisites.use('{{MODEL_LOWERCASE}}'),
            handler (request, reply) {
                if (!request.pre.{{MODEL_LOWERCASE}}) return reply(Boom.notFound());
                
                let deleted_{{MODEL_LOWERCASE}} = {{MODEL_CLASS}}Resource.private(request.pre.{{MODEL_LOWERCASE}});
                
                request.pre.{{MODEL_LOWERCASE}}.destroy().then(() => {
                    reply(deleted_{{MODEL_LOWERCASE}});
                }).catch((err) => {
                    reply(Boom.badRequest());
                });
            }
        }
    }
];
