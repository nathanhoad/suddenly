const Lab = require('lab');
const expect = require('code').expect;
const FS = require('fs-extra');

const lab = exports.lab = Lab.script();

const Builder = require('../builder');
const Log = require('../log');
Log.silent = true;


lab.experiment('Builder', () => {
    var config = {};
    
    lab.beforeEach((done) => {
        config.APP_ROOT = `${__dirname}/../tmp`;
        
        // Empty the project folder
        FS.remove(`${__dirname}/../tmp/*`, () => {
            done();
        });
    });
    
    
    lab.suite('clean', () => {
        lab.beforeEach((done) => {
            FS.copy(`${__dirname}/builder`, `${__dirname}/../tmp`, (err) => {
                done();
            });
        });
        
        
        lab.test('cleans the build directory', (done) => {
            // Check that there are things in the build dir
            FS.readFile(`${__dirname}/../tmp/build/thing-to-be-cleaned.txt`, (err, file) => {
                expect(err).to.be.null();
                
                Builder.clean(config).then(() => {
                    // check that there are no files in the build dir
                    FS.readdir(`${__dirname}/../tmp/build`, (err, files) => {
                        expect(files).to.be.an.array();
                        expect(files.length).to.equal(0);
                        
                        done();
                    });
                }).catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });
    
    
    lab.suite('build', () => {
        lab.beforeEach((done) => {
            FS.copy(`${__dirname}/builder`, `${__dirname}/../tmp`, (err) => {
                done();
            });
        });
        
        
        lab.test('it builds a project', { timeout: 5000 }, (done) => {
            Builder.build(config).then((stats) => {
                expect(stats).to.be.an.object();
                
                FS.readdir(`${__dirname}/../tmp/build`, (err, files) => {
                    expect(files).to.be.an.array();
                    
                    expect(files.length).to.equal(6);
                    
                    expect(files.filter(f => f.match(/\.js$/)).length).to.equal(1);
                    expect(files.filter(f => f.match(/\.html$/)).length).to.equal(1);
                    expect(files.filter(f => f.match(/\.png$/)).length).to.equal(2);
                    expect(files.filter(f => f.match(/robots\.txt/)).length, 'Has robots.txt from public folder').to.equal(1);
                    
                    done();
                });
            }).catch((err) => {
                console.log(err);
                done();
            });
        });
    });
    
    
    lab.suite('run', () => {
        lab.beforeEach((done) => {
            FS.copy(`${__dirname}/builder`, `${__dirname}/../tmp`, (err) => {
                done();
            });
        });
        
        
        lab.test('can run a dev server', { timeout: 5000 }, (done) => {
            Builder.run(config).then((server) => {
                expect(server).to.be.an.object();
                expect(server).to.contain(['listener']);
                
                server.assetServer.close();
                server.watcher.close();
                server.stop(() => {
                    done();
                });
            }).catch((err) => {
                console.log(err);
                done();
            });
        });
    });
    
    
    lab.suite('buildAndRun', () => {
        lab.beforeEach((done) => {
            FS.copy(`${__dirname}/builder`, `${__dirname}/../tmp`, (err) => {
                done();
            });
        });
        
        
        lab.test('it can build and then run a dev server', { timeout: 5000 }, (done) => {
            Builder.buildAndRun(config).then((server) => {
                expect(server).to.be.an.object();
                expect(server).to.contain(['listener']);
                
                FS.readdir(`${__dirname}/../tmp/build`, (err, files) => {
                    expect(files).to.be.an.array();
                    expect(files.length).to.equal(6);
                    
                    expect(files.filter(f => f.match(/\.js$/)).length).to.equal(1);
                    expect(files.filter(f => f.match(/\.html$/)).length).to.equal(1);
                    expect(files.filter(f => f.match(/\.png$/)).length).to.equal(2);
                    
                    expect(files.filter(f => f.match(/robots\.txt/)).length, 'Has robots.txt from public folder').to.equal(1);
                    
                    server.assetServer.close();
                    server.watcher.close();
                    server.stop(() => {
                        done();
                    });
                });
            }).catch((err) => {
                console.log(err);
                done();
            });
        });
    });
});