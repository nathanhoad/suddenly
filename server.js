const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const Handlebars = require('handlebars');
const requireTree = require('require-tree');
const Log = require('./log');

const APP_ROOT = require('app-root-path');


module.exports.routes = (server, config) => {
    // Load up the routes
    requireTree(`${config.APP_ROOT || APP_ROOT}/app/server/routes`, {
        filter: /-routes\.js$/,
        each: (routes) => {
            server.route(routes);
        }
    });

    // Set up asset routes
    server.register(Inert, function () {});
    server.route({
        method: 'GET',
        path: '/assets/{param*}',
        handler: {
            directory: {
                path: `${config.APP_ROOT || APP_ROOT}/build`
            }
        }
    });
    
    // Views
    server.register(Vision, function () {
        server.views({
            engines: {
                html: Handlebars
            },
            path: `${config.APP_ROOT || APP_ROOT}/build`,
            layout: false,
            context: config.DEFAULT_CONTEXT || {}
        });
    });
    

    return server;
};


module.exports.run = (config, args) => {
    return new Promise((resolve, reject) => {
        let server = require(`${config.APP_ROOT || APP_ROOT}/app/server`);
        
        server.start((err) => {
            Log.info('server', 'Server started at', Log.bold(server.info.uri));
            resolve(server);
        });
    });
};