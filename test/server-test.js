const Lab = require('lab');
const expect = require('code').expect;
const Path = require('path');
const FS = require('fs-extra');

const lab = exports.lab = Lab.script();

const Hapi = require('hapi');
const Server = require('../server');

const Log = require('../log');
Log.silent = true;


lab.experiment('Server', () => {
    var config = {};
    
    
    lab.beforeEach((done) => {
        config = {
            APP_ROOT: Path.resolve(`${__dirname}/../tmp`)
        };
        
        // Empty the project folder
        FS.remove(`${__dirname}/../tmp/*`, () => {
            done();
        });
    });
    
    
    lab.suite('server', () => {
        var server;
        
        lab.beforeEach((done) => {
            FS.mkdirs(`${__dirname}/../tmp`, () => {
                FS.copy(`${__dirname}/server`, `${__dirname}/../tmp`, (err) => {
                    server = new Hapi.Server();
                    server.connection({
                        port: 5000
                    });
                    Server.routes(server, config);
                    done();
                });
            });
        });
        
        
        lab.test('sets up a Hapi server', (done) => {
            expect(server).to.be.an.object();
            server.inject({ method: 'GET', url: '/' }, (response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.result).to.equal('<p>This is the index.</p>');
                done();
            });
        });
    });
    
    
    lab.suite('run', () => {
        lab.beforeEach((done) => {
            FS.mkdirs(`${__dirname}/../tmp`, () => {
                FS.copy(`${__dirname}/server`, `${__dirname}/../tmp`, (err) => {
                    done();
                });
            });
        });
        
        
        lab.test('runs a Hapi server', { timeout: 5000 }, (done) => {
            Server.run(config).then((server) => {
                expect(server).to.be.an.object();
                server.stop(() => {
                    done();
                });
            });
        });
    });
});