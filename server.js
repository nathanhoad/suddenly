const Path = require('path');
const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const Handlebars = require('handlebars');
const requireTree = require('require-tree');
const Log = require('./log');

const APP_ROOT = require('app-root-path').toString();


module.exports.routes = (server, config) => {
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    // Load up the routes
    requireTree(`${app_root}/app/server/routes`, {
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
                path: `${app_root}/build`
            }
        }
    });
    
    // Views
    server.register(Vision, function () {
        server.views({
            engines: {
                html: Handlebars
            },
            path: `${app_root}/build`,
            layout: false,
            context: config.DEFAULT_CONTEXT || {}
        });
    });
    

    return server;
};


module.exports.run = (config, args) => {
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    return new Promise((resolve, reject) => {
        let server = require(`${app_root}/app/server`);
        
        server.start((err) => {
            Log.info('server', 'Server started at', Log.bold(server.info.uri));
            resolve(server);
        });
    });
};