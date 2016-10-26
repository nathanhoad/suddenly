const Hapi = require('hapi');


var server = new Hapi.Server();
server.connection({
    port: process.env.PORT || 5000
});

// Load the local version of Suddenly
const Suddenly = require('../../..');
Suddenly.routes(server, { APP_ROOT: `${__dirname}/../..` });

module.exports = server;